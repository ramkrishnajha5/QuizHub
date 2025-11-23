export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  MIXED = 'mixed'
}

export interface Category {
  id: number;
  name: string;
}

export interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  // Augmented properties
  all_answers?: string[];
}

export interface QuizQuestion {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface UserAnswer {
  questionIndex?: number;
  questionId?: string;
  selectedAnswer?: string | null;
  selectedOption?: string | null;
  isMarkedForReview?: boolean;
  isCorrect?: boolean;
  timeSpent: number; // in seconds
  timeSpentSeconds?: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  categoryId?: number;
  category: string; // This is categoryName in saveQuizResult
  categoryName?: string;
  difficulty: string;
  startedAt: number;
  endedAt?: number;
  finishedAt?: number;
  durationSeconds: number;
  score: number;
  percent: number;
  correct: number;
  wrong: number;
  unattempted: number;
  totalQuestions?: number;
  questions: Question[] | QuizQuestion[];
  userAnswers: UserAnswer[];
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
}

export interface DashboardStats {
  totalAttempts: number;
  averageScore: number;
  streak: number;
  lastQuizDate: number | null;
}