/**
 * Admin Logger — Audit Trail
 * Logs admin actions to the `adminLogs` Firestore collection
 */

import { db } from '@/utils/firebase';
import { collection, doc, setDoc, serverTimestamp, getDocs, query, orderBy, limit as fsLimit, deleteDoc } from 'firebase/firestore';

export type AdminAction =
  | 'ADMIN_LOGIN'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'USER_DELETED'
  | 'QUIZ_CREATED'
  | 'QUIZ_UPDATED'
  | 'QUIZ_DELETED'
  | 'QUIZ_PUBLISHED'
  | 'QUIZ_UNPUBLISHED'
  | 'ADMIN_ADDED'
  | 'CONFIG_UPDATED';

interface LogEntry {
  action: AdminAction;
  performedBy: string;
  performedByEmail?: string;
  targetUid?: string;
  targetEmail?: string;
  details?: string;
}

export async function logAdminAction(entry: LogEntry): Promise<void> {
  try {
    const logsRef = collection(db, 'adminLogs');

    // Count current logs
    const countSnap = await getDocs(logsRef);
    const currentCount = countSnap.size;

    // If at or above limit, delete the oldest log(s)
    if (currentCount >= 50) {
      const oldestQuery = query(
        logsRef,
        orderBy("timestamp", "asc"),
        fsLimit(currentCount - 49) // delete enough to make room for 1
      );
      const oldestSnap = await getDocs(oldestQuery);
      const deletePromises = oldestSnap.docs.map(d => deleteDoc(doc(db, 'adminLogs', d.id)));
      await Promise.all(deletePromises);
    }

    const logRef = doc(logsRef);
    await setDoc(logRef, {
      ...entry,
      timestamp: serverTimestamp(),
    });

    // Create a notification for the admin bell
    const notifRef = doc(collection(db, 'adminNotifications'));
    await setDoc(notifRef, {
      action: entry.action,
      message: entry.details || `${entry.action.replace('_', ' ')} performed`,
      read: false,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw — logging should not break the main operation
  }
}
