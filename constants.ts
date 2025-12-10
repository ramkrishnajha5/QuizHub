export const APP_NAME = "QuizHub";
export const WEB3FORMS_ACCESS_KEY = "1509b4ef-7f11-47cf-b88d-fcfb8c6a23b9";
export const INSTAGRAM_LINK = "https://instagram.com/ramkrishnajha5";

// Question count options and their corresponding time limits (in seconds)
export const QUESTION_COUNTS = [10, 15, 20, 25] as const;

export const TIMERS: Record<number, number> = {
  10: 600,   // 10 minutes
  15: 900,   // 15 minutes
  20: 1200,  // 20 minutes
  25: 1500,  // 25 minutes
};

// Placeholder config - User needs to replace this in a real app
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCsNbl2M8ueE7skv2Cnn7btSd0PEfOKbp4",
  authDomain: "quiz-90217.firebaseapp.com",
  projectId: "quiz-90217",
  storageBucket: "quiz-90217.firebasestorage.app",
  messagingSenderId: "1000298137844",
  appId: "1:1000298137844:web:785c1a12ef9db9af2036a1",
  measurementId: "G-JWJZ6RYR07"
};