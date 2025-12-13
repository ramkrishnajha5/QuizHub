import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    orderBy,
    limit,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

import { QuizAttempt } from '../types';

// Re-export for backward compatibility if needed, or just use from types
export type { QuizAttempt };

export interface QuizSummary {
    categoryName: string;
    difficulty: string;
    score: number;
    percent: number;
    finishedAt: number;
    attemptId: string; // Reference to the full attempt
    totalQuestions?: number;
}


/**
 * Save quiz result to Firestore and trim old records
 */
export const saveQuizResult = async (
    userId: string,
    attempt: QuizAttempt
): Promise<string> => {
    try {
        // Generate IDs
        const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const summaryId = `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Save detailed attempt
        const attemptRef = doc(db, `users/${userId}/quizAttempts`, attemptId);
        await setDoc(attemptRef, {
            ...attempt,
            createdAt: serverTimestamp(),
            id: attemptId
        });

        // Save summary
        const summaryRef = doc(db, `users/${userId}/quizSummaries`, summaryId);
        const summary: QuizSummary = {
            categoryName: attempt.categoryName,
            difficulty: attempt.difficulty,
            score: attempt.score,
            percent: (attempt.correct / attempt.totalQuestions) * 100,
            finishedAt: attempt.finishedAt,
            attemptId: attemptId
        };
        await setDoc(summaryRef, {
            ...summary,
            createdAt: serverTimestamp(),
            id: summaryId
        });

        // Trim old attempts (keep only newest 10)
        await trimOldDocuments(userId, 'quizAttempts', 10);

        // Trim old summaries (keep only newest 20)
        await trimOldDocuments(userId, 'quizSummaries', 20);

        return attemptId;
    } catch (error) {
        console.error('Error saving quiz result:', error);
        throw error;
    }
};

/**
 * Trim old documents from a collection, keeping only the newest N
 */
const trimOldDocuments = async (
    userId: string,
    collectionName: string,
    keepCount: number
): Promise<void> => {
    try {
        const collectionRef = collection(db, `users/${userId}/${collectionName}`);
        const q = query(collectionRef, orderBy('finishedAt', 'desc'));
        const snapshot = await getDocs(q);

        // If we have more than keepCount, delete the excess
        if (snapshot.size > keepCount) {
            const docsToDelete = snapshot.docs.slice(keepCount);
            const deletePromises = docsToDelete.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log(`Trimmed ${docsToDelete.length} old ${collectionName}`);
        }
    } catch (error) {
        console.error(`Error trimming ${collectionName}:`, error);
        // Don't throw - trimming is not critical
    }
};

/**
 * Get recent quiz summaries
 */
export const getRecentQuizSummaries = async (
    userId: string,
    limitCount: number = 20
): Promise<any[]> => {
    try {
        const summariesRef = collection(db, `users/${userId}/quizSummaries`);
        const q = query(summariesRef, orderBy('finishedAt', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching quiz summaries:', error);
        return [];
    }
};

/**
 * Get full quiz attempt details
 */
export const getQuizAttemptDetails = async (
    userId: string,
    attemptId: string
): Promise<QuizAttempt | null> => {
    try {
        const attemptRef = doc(db, `users/${userId}/quizAttempts`, attemptId);
        const snapshot = await getDocs(query(collection(db, `users/${userId}/quizAttempts`)));
        const attemptDoc = snapshot.docs.find(d => d.id === attemptId);

        if (attemptDoc && attemptDoc.exists()) {
            return attemptDoc.data() as QuizAttempt;
        }
        return null;
    } catch (error) {
        console.error('Error fetching quiz attempt:', error);
        return null;
    }
};
