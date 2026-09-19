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
  quizTitle?: string;
  difficulty?: string; // easy, medium, hard, or mixed
  questionCount: number; // Number of questions (10, 15, 20, 25)
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
  negativeMarking?: boolean;
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

export interface QuizFolder {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  createdAt?: any;
  createdBy?: string;
}

export interface AdminQuizQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export interface AdminQuiz {
  quizId: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
  isPublished: boolean;
  totalQuestions: number;
  timeLimitMinutes?: number;
  negativeMarking?: boolean;
  hasTimeRestriction?: boolean;
  availableFrom?: any;
  availableUntil?: any;
  questions?: AdminQuizQuestion[];
  folderId?: string | null;
  folderPath?: string;
}
