import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  doc
} from 'firebase/firestore';
import { QuizAttempt } from '../types';

// Max limits
const MAX_DETAILED_ATTEMPTS = 10;
const MAX_SUMMARIES = 20;

export const saveQuizResultToFirestore = async (userId: string, attempt: QuizAttempt) => {
  if (!userId) return;

  const attemptsRef = collection(db, `users/${userId}/quizAttempts`);
  const summariesRef = collection(db, `users/${userId}/quizSummaries`);

  // 1. Prepare Data
  const detailedData = {
    categoryId: 0, 
    categoryName: attempt.category,
    difficulty: attempt.difficulty,
    score: attempt.score,
    totalQuestions: attempt.questions.length,
    correct: attempt.correct,
    wrong: attempt.wrong,
    unattempted: attempt.unattempted,
    durationSeconds: attempt.durationSeconds,
    startedAt: attempt.startedAt,
    finishedAt: attempt.endedAt,
    questions: attempt.questions.map((q) => ({
      question: q.question,
      options: q.all_answers,
      correctAnswer: q.correct_answer
    })),
    userAnswers: attempt.userAnswers.map((ua, i) => ({
      selectedOption: ua.selectedAnswer,
      isCorrect: ua.selectedAnswer === attempt.questions[i].correct_answer,
      timeSpentSeconds: ua.timeSpent
    }))
  };

  const summaryData = {
    categoryName: attempt.category,
    difficulty: attempt.difficulty,
    score: attempt.score,
    percent: attempt.percent,
    finishedAt: attempt.endedAt,
    detailedAttemptId: '' // Will update after saving detailed
  };

  try {
    // 2. Save Detailed Attempt
    const attemptDoc = await addDoc(attemptsRef, detailedData);
    summaryData.detailedAttemptId = attemptDoc.id;

    // 3. Save Summary
    await addDoc(summariesRef, summaryData);

    // 4. Trim Detailed Attempts (Keep last 10)
    await trimCollection(attemptsRef, MAX_DETAILED_ATTEMPTS);

    // 5. Trim Summaries (Keep last 20)
    await trimCollection(summariesRef, MAX_SUMMARIES);

  } catch (error) {
    console.error("Error saving quiz result:", error);
  }
};

const trimCollection = async (colRef: any, maxItems: number) => {
  // Get all docs ordered by finishedAt descending
  const q = query(colRef, orderBy('finishedAt', 'desc'));
  const snapshot = await getDocs(q);

  if (snapshot.size > maxItems) {
    const docsToDelete = snapshot.docs.slice(maxItems);
    const deletePromises = docsToDelete.map(d => deleteDoc(doc(colRef, d.id)));
    await Promise.all(deletePromises);
  }
};
