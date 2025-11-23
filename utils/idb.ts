import { openDB } from 'idb';

const DB_NAME = 'preppulse-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for partial quiz state
      if (!db.objectStoreNames.contains('quizState')) {
        db.createObjectStore('quizState');
      }
      // Store for offline attempts
      if (!db.objectStoreNames.contains('offlineAttempts')) {
        db.createObjectStore('offlineAttempts', { keyPath: 'id' });
      }
    },
  });
};

export const saveQuizState = async (state: any) => {
  const db = await initDB();
  await db.put('quizState', state, 'current');
};

export const getQuizState = async () => {
  const db = await initDB();
  return db.get('quizState', 'current');
};

export const clearQuizState = async () => {
  const db = await initDB();
  await db.delete('quizState', 'current');
};