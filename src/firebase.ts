import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

if (!getApps().length) {
  app = initializeApp(FIREBASE_CONFIG);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);
googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
