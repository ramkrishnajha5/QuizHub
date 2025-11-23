import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { updateProfile, User } from 'firebase/auth';
import { db } from '../firebase';

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  createdAt?: Timestamp;
}

export const createUserDocument = async (user: User, additionalData?: { name?: string }) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email } = user;
    const name = additionalData?.name || user.displayName || 'User';
    
    try {
      await setDoc(userRef, {
        name,
        email,
        phone: '',
        dob: '',
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error creating user document', error);
    }
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() } as UserProfileData;
  }
  return null;
};

export const updateUserProfileDoc = async (uid: string, data: Partial<UserProfileData>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

export const updateUserDisplayName = async (user: User, name: string) => {
  await updateProfile(user, { displayName: name });
  await updateUserProfileDoc(user.uid, { name });
};
