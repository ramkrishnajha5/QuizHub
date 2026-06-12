import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    signInWithRedirect,
    getRedirectResult,
    signInWithCredential,
    GoogleAuthProvider,
} from 'firebase/auth';
import { auth, db, googleProvider } from '../utils/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '../shared/constants';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    bannedMessage: string | null;
    clearBannedMessage: () => void;
    signup: (email: string, password: string, displayName: string) => Promise<User>;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    updateUserProfile: (displayName: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    loginWithGoogle: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [bannedMessage, setBannedMessage] = useState<string | null>(null);

    const clearBannedMessage = () => setBannedMessage(null);

    const handleBannedLogout = async () => {
        try { await signOut(auth); } catch (err) { console.error(err); }
        setBannedMessage('⛔ Your account has been suspended by an administrator. Contact support if you believe this is a mistake.');
        setCurrentUser(null);
    };

    // Auth state listener with ban check on load
    useEffect(() => {
        // Check for Google redirect result on web (after signInWithRedirect returns)
        if (Platform.OS === 'web') {
            getRedirectResult(auth).then(async (result) => {
                if (result && result.user) {
                    await ensureGoogleUserDoc(result.user);
                    setCurrentUser(result.user);
                }
            }).catch((err) => {
                console.error('Google redirect result error:', err);
            });
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Skip ban check for admin sessions
                const isAdminSession = await AsyncStorage.getItem('adminSession');
                if (isAdminSession !== 'true') {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        if (userDoc.exists() && userDoc.data().isBanned === true) {
                            await signOut(auth);
                            setBannedMessage('⛔ Your account has been suspended by an administrator. Contact support if you believe this is a mistake.');
                            setCurrentUser(null);
                            setLoading(false);
                            return;
                        }
                    } catch (error) {
                        console.error('Error checking ban status:', error);
                    }
                }
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Real-time ban watcher using onSnapshot
    useEffect(() => {
        if (!currentUser) return;

        const checkAdmin = async () => {
            const isAdminSession = await AsyncStorage.getItem('adminSession');
            if (isAdminSession === 'true') return;

            const userDocRef = doc(db, 'users', currentUser.uid);
            const unsubscribeBanWatcher = onSnapshot(userDocRef, (snapshot) => {
                if (!snapshot.exists()) return;
                if (snapshot.data()?.isBanned === true) {
                    handleBannedLogout();
                }
            });

            return unsubscribeBanWatcher;
        };

        let unsubscribe: (() => void) | undefined;
        checkAdmin().then(unsub => {
            unsubscribe = unsub;
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentUser]);

    const signup = async (email: string, password: string, displayName: string): Promise<User> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        await userCredential.user.reload();
        const user = auth.currentUser;
        if (user) {
            try {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: displayName,
                    email: user.email,
                    photoURL: user.photoURL || "",
                    createdAt: serverTimestamp(),
                    isBanned: false,
                    totalQuizzes: 0,
                }, { merge: true });
            } catch (err) {
                console.error("Failed to create user doc:", err);
            }
        }
        setCurrentUser(user);
        return userCredential.user;
    };

    const login = async (email: string, password: string): Promise<User> => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    const logout = async (): Promise<void> => {
        await signOut(auth);
    };

    const updateUserProfile = async (displayName: string): Promise<void> => {
        if (currentUser) {
            await updateProfile(currentUser, { displayName });
            await currentUser.reload();
            setCurrentUser(auth.currentUser);
        }
    };

    const resetPassword = async (email: string): Promise<void> => {
        await sendPasswordResetEmail(auth, email);
    };

    const loginWithGoogle = async (): Promise<User> => {
        if (Platform.OS === 'web') {
            // Web: use signInWithRedirect (popups are blocked in Expo web context)
            // After redirect, getRedirectResult in useEffect will capture the user
            await signInWithRedirect(auth, googleProvider);
            // This line won't be reached — page navigates away to Google
            // When it returns, getRedirectResult + onAuthStateChanged handle the rest
            return auth.currentUser!;
        } else {
            // Native: use expo-auth-session + expo-web-browser
            const { makeRedirectUri } = await import('expo-auth-session');
            const WebBrowser = await import('expo-web-browser');

            WebBrowser.maybeCompleteAuthSession();

            // We use our deployed web app as a proxy because Google strictly requires an HTTPS redirect URI
            // The mobile-auth.html file will instantly redirect the token back to our quizhub:// scheme!
            const redirectUri = 'https://quizzzhubb.netlify.app/mobile-auth.html';

            const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
                `client_id=1000298137844-3tb7n1dr5nlrnqnb8a8gbinkp2e9sp7g.apps.googleusercontent.com` + 
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                '&response_type=token' +
                '&scope=openid%20email%20profile';

            // We must pass our deep link scheme to openAuthSessionAsync so it knows what to listen for!
            const returnUrl = makeRedirectUri({ scheme: 'quizhub' });
            const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, returnUrl);

            if (result.type !== 'success' || !result.url) {
                throw new Error('Google sign-in was cancelled or failed');
            }

            // Extract the access token from the redirect URL
            const urlParams = result.url.includes('#') ? result.url.split('#')[1] : result.url.split('?')[1];
            const params = new URLSearchParams(urlParams || '');
            const accessToken = params.get('access_token');
            const idToken = params.get('id_token');

            if (!accessToken && !idToken) {
                throw new Error('No authentication token received from Google');
            }

            const credential = GoogleAuthProvider.credential(idToken || null, accessToken || null);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;
            await ensureGoogleUserDoc(user);
            setCurrentUser(user);
            return user;
        }
    };

    const ensureGoogleUserDoc = async (user: User) => {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: user.displayName || "Learner",
                    email: user.email,
                    photoURL: user.photoURL || "",
                    createdAt: serverTimestamp(),
                    isBanned: false,
                    totalQuizzes: 0,
                }, { merge: true });
            }
        } catch (err) {
            console.error("Failed to check/create Google user doc:", err);
        }
    };

    const value: AuthContextType = {
        currentUser,
        loading,
        bannedMessage,
        clearBannedMessage,
        signup,
        login,
        logout,
        updateUserProfile,
        resetPassword,
        loginWithGoogle,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
