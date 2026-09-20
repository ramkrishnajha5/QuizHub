/**
 * Admin Firestore Helper Functions
 * All admin-related Firestore operations
 */

import { db } from '@/utils/firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp,
  Timestamp, writeBatch, DocumentSnapshot
} from 'firebase/firestore';

// ==================== ADMIN AUTH ====================

export interface AdminUser {
  uid: string;
  email: string;
  role: 'superadmin' | 'moderator';
  createdAt: any;
  lastLogin: any;
}

export async function getAdminByUid(uid: string): Promise<AdminUser | null> {
  try {
    const docRef = doc(db, 'admins', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { uid: snap.id, ...snap.data() } as AdminUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin:', error);
    return null;
  }
}

export async function updateAdminLastLogin(uid: string): Promise<void> {
  try {
    const docRef = doc(db, 'admins', uid);
    await updateDoc(docRef, { lastLogin: serverTimestamp() });
  } catch (error) {
    console.error('Error updating admin last login:', error);
  }
}

export async function addAdmin(uid: string, email: string, role: 'superadmin' | 'moderator'): Promise<void> {
  const docRef = doc(db, 'admins', uid);
  await setDoc(docRef, {
    email,
    role,
    createdAt: serverTimestamp(),
    lastLogin: null,
  });
}

// ==================== USERS ====================

export interface AppUser {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  photoURL?: string;
  isBanned?: boolean;
  updatedAt?: any;
  createdAt?: any;
}

export async function getAllUsers(): Promise<AppUser[]> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as AppUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUserById(uid: string): Promise<AppUser | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { uid: snap.id, ...snap.data() } as AppUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// ==================== QUIZ ATTEMPTS ====================

export interface QuizAttemptRecord {
  id: string;
  category?: string;
  categoryName?: string;
  difficulty?: string;
  score?: number;
  percent?: number;
  correct?: number;
  wrong?: number;
  unattempted?: number;
  totalQuestions?: number;
  questionCount?: number;
  durationSeconds?: number;
  startedAt?: number;
  finishedAt?: number;
  questions?: any[];
  userAnswers?: any[];
  userId?: string;
  source?: string;
  quizId?: string;
}

export async function getUserQuizAttempts(uid: string): Promise<QuizAttemptRecord[]> {
  try {
    const attemptsRef = collection(db, `users/${uid}/quizAttempts`);
    const q = query(attemptsRef, orderBy('finishedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, userId: uid, ...d.data() } as QuizAttemptRecord));
  } catch (error) {
    console.error('Error fetching user quiz attempts:', error);
    return [];
  }
}

export async function getUserQuizSummaries(uid: string): Promise<any[]> {
  try {
    const summariesRef = collection(db, `users/${uid}/quizSummaries`);
    const q = query(summariesRef, orderBy('finishedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching user quiz summaries:', error);
    return [];
  }
}

export async function getAllQuizAttempts(): Promise<QuizAttemptRecord[]> {
  try {
    const users = await getAllUsers();
    const allAttempts: QuizAttemptRecord[] = [];
    
    for (const user of users) {
      const attempts = await getUserQuizAttempts(user.uid);
      const attemptsWithUser = attempts.map(a => ({
        ...a,
        userId: user.uid,
        userName: user.name || user.email || 'Unknown',
        userEmail: user.email || '',
      }));
      allAttempts.push(...attemptsWithUser);
    }
    
    // Sort by finishedAt desc
    allAttempts.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
    return allAttempts;
  } catch (error) {
    console.error('Error fetching all quiz attempts:', error);
    return [];
  }
}

// ==================== SAVED BOOKS ====================

export async function getUserSavedBooks(uid: string): Promise<any[]> {
  try {
    const booksRef = collection(db, `users/${uid}/savedBooks`);
    const q = query(booksRef, orderBy('addedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching saved books:', error);
    return [];
  }
}

// ==================== ADMIN QUIZZES ====================

export interface AdminQuizQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctOption: number; // 0-3 index
  explanation?: string;
  section?: string;
}

export interface AdminQuiz {
  quizId: string;
  title: string;
  category: string;
  difficulty: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  isPublished: boolean;
  totalQuestions: number;
  timeLimitMinutes?: number;
  negativeMarking?: boolean;
  hasTimeRestriction?: boolean;
  availableFrom?: any;
  availableUntil?: any;
  questions: AdminQuizQuestion[];
  sections?: string[];
  folderId?: string | null;
  folderPath?: string;
}

export async function createAdminQuiz(quiz: Omit<AdminQuiz, 'quizId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const quizRef = doc(collection(db, 'adminQuizzes'));
  const data = {
    ...quiz,
    quizId: quizRef.id,
    sections: quiz.sections || [],
    folderId: quiz.folderId || null,
    folderPath: quiz.folderPath || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(quizRef, data);
  return quizRef.id;
}

export async function updateAdminQuiz(quizId: string, data: Partial<AdminQuiz>): Promise<void> {
  const quizRef = doc(db, 'adminQuizzes', quizId);
  await updateDoc(quizRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteAdminQuiz(quizId: string): Promise<void> {
  const quizRef = doc(db, 'adminQuizzes', quizId);
  await deleteDoc(quizRef);
}

export async function getAllAdminQuizzes(): Promise<AdminQuiz[]> {
  try {
    const quizzesRef = collection(db, 'adminQuizzes');
    const q = query(quizzesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ quizId: d.id, ...d.data() } as AdminQuiz));
  } catch (error) {
    console.error('Error fetching admin quizzes:', error);
    return [];
  }
}

export async function getPublishedAdminQuizzes(): Promise<AdminQuiz[]> {
  try {
    const quizzesRef = collection(db, 'adminQuizzes');
    // Using simple query to avoid requiring composite Firestore index
    const q = query(quizzesRef, where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    
    // Parse and sort client-side
    const quizzes = snapshot.docs.map(d => ({ quizId: d.id, ...d.data() } as AdminQuiz));
    return quizzes.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching published quizzes:', error);
    return [];
  }
}

export async function getAdminQuizById(quizId: string): Promise<AdminQuiz | null> {
  try {
    const docRef = doc(db, 'adminQuizzes', quizId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { quizId: snap.id, ...snap.data() } as AdminQuiz;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin quiz:', error);
    return null;
  }
}

// ==================== QUIZ FOLDERS ====================

export interface QuizFolder {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  createdAt: any;
  createdBy: string;
}

export async function getAllQuizFolders(): Promise<QuizFolder[]> {
  try {
    const foldersRef = collection(db, 'quizFolders');
    const q = query(foldersRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizFolder));
  } catch (error) {
    console.error('Error fetching quiz folders:', error);
    return [];
  }
}

export async function createQuizFolder(name: string, parentId: string | null, createdBy: string): Promise<string> {
  const folderRef = doc(collection(db, 'quizFolders'));
  // Determine order: put new folders at the end
  const existingFolders = await getAllQuizFolders();
  const siblings = existingFolders.filter(f => f.parentId === parentId);
  const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(f => f.order || 0)) : 0;

  await setDoc(folderRef, {
    name,
    parentId: parentId || null,
    order: maxOrder + 1,
    createdAt: serverTimestamp(),
    createdBy,
  });
  return folderRef.id;
}

export async function renameQuizFolder(folderId: string, newName: string): Promise<void> {
  const folderRef = doc(db, 'quizFolders', folderId);
  await updateDoc(folderRef, { name: newName });

  // Update folderPath on all quizzes that reference this folder or its children
  await refreshFolderPaths();
}

export async function deleteQuizFolder(folderId: string): Promise<void> {
  // Move all quizzes in this folder to "uncategorized" (null)
  const quizzesRef = collection(db, 'adminQuizzes');
  const q = query(quizzesRef, where('folderId', '==', folderId));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach(d => {
    batch.update(d.ref, { folderId: null, folderPath: 'Other Quizzes' });
  });

  // Delete child folders recursively
  const allFolders = await getAllQuizFolders();
  const childIds = getDescendantFolderIds(folderId, allFolders);
  for (const childId of childIds) {
    // Move quizzes in child folders to uncategorized
    const childQ = query(quizzesRef, where('folderId', '==', childId));
    const childSnap = await getDocs(childQ);
    childSnap.docs.forEach(d => {
      batch.update(d.ref, { folderId: null, folderPath: 'Other Quizzes' });
    });
    batch.delete(doc(db, 'quizFolders', childId));
  }

  // Delete the folder itself
  batch.delete(doc(db, 'quizFolders', folderId));
  await batch.commit();
}

function getDescendantFolderIds(parentId: string, allFolders: QuizFolder[]): string[] {
  const children = allFolders.filter(f => f.parentId === parentId);
  let result: string[] = [];
  for (const child of children) {
    result.push(child.id);
    result = result.concat(getDescendantFolderIds(child.id, allFolders));
  }
  return result;
}

/**
 * Build the full display path for a folder, e.g. "SSC / SSC CGL / Chapterwise"
 */
export function buildFolderPath(folderId: string, allFolders: QuizFolder[]): string {
  const parts: string[] = [];
  let current = allFolders.find(f => f.id === folderId);
  while (current) {
    parts.unshift(current.name);
    current = current.parentId ? allFolders.find(f => f.id === current!.parentId) : undefined;
  }
  return parts.join(' / ');
}

export interface FolderTreeNode {
  folder: QuizFolder;
  depth: number;
  path: string;
}

/**
 * Get flattened list of folders in tree order with depth and full path,
 * sorted alphabetically at every level.
 */
export function getSortedFolderTree(
  allFolders: QuizFolder[],
  parentId: string | null = null,
  depth: number = 0
): FolderTreeNode[] {
  const currentLevel = allFolders
    .filter(f => f.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  let result: FolderTreeNode[] = [];
  for (const f of currentLevel) {
    const fullPath = buildFolderPath(f.id, allFolders);
    result.push({ folder: f, depth, path: fullPath });
    result = result.concat(getSortedFolderTree(allFolders, f.id, depth + 1));
  }
  return result;
}

/**
 * Refresh folderPath on all quizzes (call after renaming a folder)
 */
async function refreshFolderPaths(): Promise<void> {
  const allFolders = await getAllQuizFolders();
  const quizzesRef = collection(db, 'adminQuizzes');
  const snapshot = await getDocs(quizzesRef);
  const batch = writeBatch(db);
  let count = 0;
  snapshot.docs.forEach(d => {
    const data = d.data();
    if (data.folderId) {
      const newPath = buildFolderPath(data.folderId, allFolders);
      if (newPath !== data.folderPath) {
        batch.update(d.ref, { folderPath: newPath });
        count++;
      }
    }
  });
  if (count > 0) await batch.commit();
}

/**
 * Move a quiz to a different folder
 */
export async function moveQuizToFolder(quizId: string, folderId: string | null): Promise<void> {
  const quizRef = doc(db, 'adminQuizzes', quizId);
  if (folderId) {
    const allFolders = await getAllQuizFolders();
    const path = buildFolderPath(folderId, allFolders);
    await updateDoc(quizRef, { folderId, folderPath: path, updatedAt: serverTimestamp() });
  } else {
    await updateDoc(quizRef, { folderId: null, folderPath: 'Other Quizzes', updatedAt: serverTimestamp() });
  }
}

/**
 * Copy a quiz into a folder (duplicates the quiz with a new ID)
 */
export async function copyQuizToFolder(quizId: string, targetFolderId: string | null): Promise<string> {
  const quizRef = doc(db, 'adminQuizzes', quizId);
  const snap = await getDoc(quizRef);
  if (!snap.exists()) throw new Error('Quiz not found');

  const data = snap.data();
  const newRef = doc(collection(db, 'adminQuizzes'));

  let folderPath = 'Other Quizzes';
  if (targetFolderId) {
    const allFolders = await getAllQuizFolders();
    folderPath = buildFolderPath(targetFolderId, allFolders);
  }

  await setDoc(newRef, {
    ...data,
    quizId: newRef.id,
    title: data.title + ' (Copy)',
    folderId: targetFolderId || null,
    folderPath,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newRef.id;
}

// ==================== BAN MANAGEMENT ====================

export interface UserBan {
  uid: string;
  email: string;
  reason: string;
  bannedBy: string;
  bannedAt: any;
  isBanned: boolean;
  userName?: string;
}

export async function banUser(uid: string, email: string, reason: string, bannedBy: string, userName?: string): Promise<void> {
  const batch = writeBatch(db);
  
  // Write to userBans
  const banRef = doc(db, 'userBans', uid);
  batch.set(banRef, {
    uid,
    email,
    reason,
    bannedBy,
    bannedAt: serverTimestamp(),
    isBanned: true,
    userName: userName || '',
  });
  
  // Update user doc
  const userRef = doc(db, 'users', uid);
  batch.update(userRef, { isBanned: true });
  
  await batch.commit();
}

export async function unbanUser(uid: string): Promise<void> {
  const batch = writeBatch(db);
  
  // Update userBans
  const banRef = doc(db, 'userBans', uid);
  batch.update(banRef, { isBanned: false });
  
  // Update user doc
  const userRef = doc(db, 'users', uid);
  batch.update(userRef, { isBanned: false });
  
  await batch.commit();
}

export async function getAllBannedUsers(): Promise<UserBan[]> {
  try {
    const bansRef = collection(db, 'userBans');
    const q = query(bansRef, where('isBanned', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserBan));
  } catch (error) {
    console.error('Error fetching banned users:', error);
    return [];
  }
}

export async function isUserBanned(uid: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data().isBanned === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking ban status:', error);
    return false;
  }
}

// ==================== ACTIVITY LOGS ====================

export interface AdminLog {
  id: string;
  action: string;
  targetUid?: string;
  targetEmail?: string;
  performedBy: string;
  performedByEmail?: string;
  timestamp: any;
  details?: string;
}

export async function getAdminLogs(limitCount = 100): Promise<AdminLog[]> {
  try {
    const logsRef = collection(db, 'adminLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdminLog));
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return [];
  }
}

// ==================== APP CONFIG ====================

export interface AppConfig {
  maintenanceMode: boolean;
  maxQuizQuestions: number;
  allowGoogleSignIn: boolean;
}

export async function getAppConfig(): Promise<AppConfig> {
  try {
    const docRef = doc(db, 'appConfig', 'settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AppConfig;
    }
    return { maintenanceMode: false, maxQuizQuestions: 25, allowGoogleSignIn: true };
  } catch (error) {
    console.error('Error fetching app config:', error);
    return { maintenanceMode: false, maxQuizQuestions: 25, allowGoogleSignIn: true };
  }
}

export async function updateAppConfig(config: Partial<AppConfig>): Promise<void> {
  const docRef = doc(db, 'appConfig', 'settings');
  await setDoc(docRef, config, { merge: true });
}

// ==================== STATS ====================

export async function getAdminDashboardStats() {
  try {
    const [users, bannedUsers, adminQuizzes] = await Promise.all([
      getAllUsers(),
      getAllBannedUsers(),
      getAllAdminQuizzes(),
    ]);

    // Count total quiz attempts across all users
    let totalAttempts = 0;
    const attemptsPerDay: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};

    for (const user of users) {
      const summaries = await getUserQuizSummaries(user.uid);
      totalAttempts += summaries.length;

      for (const s of summaries) {
        // Attempts per day
        if (s.finishedAt) {
          const date = new Date(s.finishedAt).toISOString().split('T')[0];
          attemptsPerDay[date] = (attemptsPerDay[date] || 0) + 1;
        }
        // Category count
        if (s.categoryName) {
          categoryCount[s.categoryName] = (categoryCount[s.categoryName] || 0) + 1;
        }
      }
    }

    // Last 30 days chart data
    const last30Days: { date: string; attempts: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last30Days.push({ date: dateStr, attempts: attemptsPerDay[dateStr] || 0 });
    }

    // Top 5 categories
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Recent signups (last 5 users sorted by updatedAt)
    const recentSignups = users
      .sort((a, b) => {
        const aTime = a.updatedAt?.seconds || 0;
        const bTime = b.updatedAt?.seconds || 0;
        return bTime - aTime;
      })
      .slice(0, 5);

    return {
      totalUsers: users.length,
      totalAttempts,
      totalAdminQuizzes: adminQuizzes.length,
      bannedUsersCount: bannedUsers.length,
      last30Days,
      topCategories,
      recentSignups,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalAttempts: 0,
      totalAdminQuizzes: 0,
      bannedUsersCount: 0,
      last30Days: [],
      topCategories: [],
      recentSignups: [],
    };
  }
}
