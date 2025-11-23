import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signup: (email: string, password: string, displayName: string) => Promise<User>;
    login: (email: string, password: string) => Promise<User>;
    loginWithGoogle: () => Promise<User>;
    logout: () => Promise<void>;
    updateUserProfile: (displayName: string) => Promise<void>;
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (email: string, password: string, displayName: string): Promise<User> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        // Refresh the user object to get the updated displayName
        await userCredential.user.reload();
        setCurrentUser(auth.currentUser);
        return userCredential.user;
    };

    const login = async (email: string, password: string): Promise<User> => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    const loginWithGoogle = async (): Promise<User> => {
        const userCredential = await signInWithPopup(auth, googleProvider);
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

    const value: AuthContextType = {
        currentUser,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
