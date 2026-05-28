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
} from 'firebase/firestore';

import { QuizAttempt } from '../shared/types';

export type { QuizAttempt };

export interface QuizSummary {
    categoryName: string;
    difficulty: string;
    score: number;
    percent: number;
    finishedAt: number;
    attemptId: string;
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
            categoryName: (attempt as any).categoryName,
            difficulty: attempt.difficulty || 'mixed',
            score: attempt.score,
            percent: (attempt.correct / (attempt.totalQuestions || attempt.questions.length)) * 100,
            finishedAt: attempt.finishedAt || Date.now(),
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

const trimOldDocuments = async (
    userId: string,
    collectionName: string,
    keepCount: number
): Promise<void> => {
    try {
        const collectionRef = collection(db, `users/${userId}/${collectionName}`);
        const q = query(collectionRef, orderBy('finishedAt', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.size > keepCount) {
            const docsToDelete = snapshot.docs.slice(keepCount);
            const deletePromises = docsToDelete.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log(`Trimmed ${docsToDelete.length} old ${collectionName}`);
        }
    } catch (error) {
        console.error(`Error trimming ${collectionName}:`, error);
    }
};

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

export const getQuizAttemptDetails = async (
    userId: string,
    attemptId: string
): Promise<QuizAttempt | null> => {
    try {
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
