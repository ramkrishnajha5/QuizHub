import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, db } from '../utils/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    bannedMessage: string | null;
    clearBannedMessage: () => void;
    signup: (email: string, password: string, displayName: string) => Promise<User>;
    login: (email: string, password: string) => Promise<User>;
    loginWithGoogle: () => Promise<User>;
    logout: () => Promise<void>;
    updateUserProfile: (displayName: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Skip ban check for admin sessions
                const isAdminSession = sessionStorage.getItem('adminSession') === 'true';
                if (!isAdminSession) {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        if (userDoc.exists() && userDoc.data().isBanned === true) {
                            // User is banned — sign out immediately
                            await signOut(auth);
                            setBannedMessage('⛔ Your account has been suspended by an administrator. Contact support if you believe this is a mistake.');
                            setCurrentUser(null);
                            setLoading(false);
                            return;
                        }
                    } catch (error) {
                        console.error('Error checking ban status:', error);
                        // fail open on network error
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

        const isAdminSession = sessionStorage.getItem('adminSession') === 'true';
        if (isAdminSession) return;

        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeBanWatcher = onSnapshot(userDocRef, (snapshot) => {
            if (!snapshot.exists()) return;
            if (snapshot.data()?.isBanned === true) {
                handleBannedLogout();
            }
        });

        return () => unsubscribeBanWatcher();
    }, [currentUser]);

    const signup = async (email: string, password: string, displayName: string): Promise<User> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        // Refresh the user object to get the updated displayName
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

    const loginWithGoogle = async (): Promise<User> => {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const user = userCredential.user;
        try {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: user.displayName || "User",
                email: user.email,
                photoURL: user.photoURL || "",
                createdAt: serverTimestamp(),
                isBanned: false,
            }, { merge: true });
        } catch (err) {
            console.error("Failed to create google user doc:", err);
        }
        return user;
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

    const value: AuthContextType = {
        currentUser,
        loading,
        bannedMessage,
        clearBannedMessage,
        signup,
        login,
        loginWithGoogle,
        logout,
        updateUserProfile,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
