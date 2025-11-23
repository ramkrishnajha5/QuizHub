import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../constants';

// Initialize Firebase only if not already initialized
const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Helper to check if firebase is actually configured (for demo purposes)
export const isFirebaseConfigured = () => {
  return FIREBASE_CONFIG.apiKey !== "REPLACE_WITH_YOUR_FIREBASE_API_KEY";
};