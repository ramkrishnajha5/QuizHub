import { initializeApp, getApps } from 'firebase/app';
// @ts-ignore
import { getAuth, GoogleAuthProvider, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '../shared/constants';

// Initialize Firebase only if not already initialized
const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApps()[0];

// Use React Native persistence for auth (persists across app restarts)
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Auth already initialized (hot reload)
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Helper to check if firebase is actually configured
export const isFirebaseConfigured = () => {
  return FIREBASE_CONFIG.apiKey !== "REPLACE_WITH_YOUR_FIREBASE_API_KEY";
};
