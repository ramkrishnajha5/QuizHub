import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchQuestions } from '../utils/api';
import { saveQuizState, getQuizState, clearQuizState } from '../utils/idb';
import { Question, UserAnswer, QuizAttempt } from '../types';
import { TIMERS } from '../constants';
import { auth, db } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Alert from '../components/Alert';
import { saveQuizResult } from '../utils/saveQuizResult';
import { useAuth } from '../contexts/AuthContext';
import { QuizQuestion, UserAnswer as QuizUserAnswer } from '../types';

interface QuizLocationState {
  categoryId: number;
  difficulty: string;
}

const QuizRunner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizStartedAt] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info', message: string } | null>(null);
  const [categoryId, setCategoryId] = useState<number>(9);
  const [difficulty, setDifficulty] = useState<string>('medium');

  // Refs for autosave logic
  const stateRef = useRef({ questions, currentQuestionIndex, userAnswers, timeLeft });
  const initRef = useRef(false); // Track if initialization has started

  useEffect(() => {
    stateRef.current = { questions, currentQuestionIndex, userAnswers, timeLeft };
  }, [questions, currentQuestionIndex, userAnswers, timeLeft]);

  // Initial Load
  useEffect(() => {
    // Prevent duplicate initialization
    if (initRef.current) {
      console.log('Initialization already in progress or complete, skipping...');
      return;
    }

    initRef.current = true;

    const init = async () => {
      try {
        const saved = await getQuizState();

        if (saved && saved.status === 'active') {
          // Resume saved quiz
          console.log('Resuming saved quiz...');
          setQuestions(saved.questions);
          setUserAnswers(saved.userAnswers);
          setTimeLeft(saved.timeLeft);
          setCurrentQuestionIndex(saved.currentQuestionIndex);
          setLoading(false);
          setIsInitialized(true);
          return;
        }

        // New quiz - check if we have state
        const state = location.state as QuizLocationState;
        if (!state || !state.categoryId) {
          console.log('No quiz configuration found, redirecting to setup...');
          navigate('/setup');
          return;
        }

        // Set category and difficulty state for saving later
        setCategoryId(state.categoryId);
        setDifficulty(state.difficulty || 'medium');

        console.log('Fetching questions for category:', state.categoryId, 'difficulty:', state.difficulty);

        // Fetch questions
        const response = await fetchQuestions(state.categoryId, state.difficulty);
        const qs = response.questions;
        const warning = response.warning;

        console.log('Questions fetched:', qs?.length || 0);

        // Show warning if less than 25 questions
        if (warning) {
          setAlert({ type: 'warning', message: warning });
          setTimeout(() => setAlert(null), 5000);
        }

        // Validate questions
        if (!qs || !Array.isArray(qs) || qs.length === 0) {
          console.error('No questions returned from API');
          if (!hasShownError) {
            setHasShownError(true);
            setAlert({ type: 'error', message: 'No questions available for this category/difficulty combination. Please try another selection.' });
            setTimeout(() => navigate('/setup'), 3000);
          }
          return;
        }

        // Set questions
        setQuestions(qs);

        // Initialize answers structure
        const initialAnswers: UserAnswer[] = qs.map((_, i) => ({
          questionIndex: i,
          selectedAnswer: null,
          isMarkedForReview: false,
          timeSpent: 0
        }));
        setUserAnswers(initialAnswers);

        // Set timer
        const duration = TIMERS[state.difficulty as keyof typeof TIMERS] || 1200;
        setTimeLeft(duration);

        console.log('✅ Quiz initialized successfully with', qs.length, 'questions');
        setLoading(false);
        setIsInitialized(true);

      } catch (error: any) {
        console.error('❌ Error initializing quiz:', error);

        // Prevent duplicate alerts
        if (hasShownError || isInitialized) {
          console.log('Error already shown or quiz already initialized, skipping alert');
          return;
        }

        setHasShownError(true);

        // Detailed error handling with specific messages
        const errorMessage = error?.message || 'Failed to load questions';
        let userMessage = 'An error occurred while loading the quiz. Please try again.';
        let errorType: 'error' | 'warning' = 'error';

        // Rate limiting (429) error
        if (errorMessage.includes('Too many requests') || errorMessage.includes('Rate limited')) {
          userMessage = '⚠️ Quiz API Rate Limit Reached\n\nYou\'ve made too many quiz requests in a short time. Please wait 1-2 minutes before trying again. This helps ensure the service remains available for everyone.';
          errorType = 'warning';
        }
        // No questions available
        else if (errorMessage.includes('No questions available') || errorMessage.includes('not have enough questions')) {
          userMessage = '📚 No Questions Available\n\nThis category/difficulty combination doesn\'t have enough questions. Try:\n• Selecting a different difficulty level\n• Choosing a different category\n• Selecting "Mixed" difficulty for more variety';
        }
        // Invalid parameters
        else if (errorMessage.includes('Invalid parameters')) {
          userMessage = '❌ Invalid Quiz Configuration\n\nThe selected quiz parameters are invalid. Please go back and reconfigure your quiz settings.';
        }
        // Session/Token errors
        else if (errorMessage.includes('Session token') || errorMessage.includes('token expired')) {
          userMessage = '🔄 Session Expired\n\nYour quiz session has expired. Please refresh the page and start a new quiz.';
        }
        // Network errors
        else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
          userMessage = '🌐 Network Error\n\nUnable to connect to the quiz server. Please check your internet connection and try again.';
        }
        // Server errors (5xx)
        else if (errorMessage.includes('HTTP error') && errorMessage.includes('5')) {
          userMessage = '🔧 Server Error\n\nThe quiz server is experiencing issues. Please try again in a few minutes.';
        }
        // Generic API error
        else if (errorMessage.includes('API')) {
          userMessage = '⚠️ Quiz API Error\n\n' + errorMessage + '\n\nPlease try selecting a different category or difficulty.';
        }

        setAlert({ type: errorType, message: userMessage });
        setTimeout(() => navigate('/setup'), 5000);
      }
    };

    init();
  }, []); // Empty dependency array - only run once

  // Timer
  useEffect(() => {
    if (loading || timeLeft <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        // Update current question time spent
        setUserAnswers(prevAnswers => {
          const updated = [...prevAnswers];
          updated[currentQuestionIndex].timeSpent += 1;
          return updated;
        });
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, currentQuestionIndex, isSubmitting]);

  // Autosave
  useEffect(() => {
    const saver = setInterval(() => {
      if (!loading && !isSubmitting) {
        saveQuizState({
          status: 'active',
          ...stateRef.current
        });
      }
    }, 5000);
    return () => clearInterval(saver);
  }, [loading, isSubmitting]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (loading || isSubmitting) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const q = questions[currentQuestionIndex];
        const idx = parseInt(e.key) - 1;
        if (q.all_answers && q.all_answers[idx]) {
          handleAnswer(q.all_answers[idx]);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentQuestionIndex > 0) setCurrentQuestionIndex(p => p - 1);
      } else if (e.key === 'ArrowRight') {
        if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(p => p + 1);
      } else if (e.key.toLowerCase() === 'm') {
        toggleMarkReview();
      } else if (e.key.toLowerCase() === 's') {
        if (window.confirm("Submit quiz?")) finishQuiz();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const handleAnswer = (answer: string) => {
    const updated = [...userAnswers];
    updated[currentQuestionIndex].selectedAnswer = answer;
    setUserAnswers(updated);
  };

  const toggleMarkReview = () => {
    const updated = [...userAnswers];
    updated[currentQuestionIndex].isMarkedForReview = !updated[currentQuestionIndex].isMarkedForReview;
    setUserAnswers(updated);
  };

  const finishQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    questions.forEach((q, i) => {
      const ans = userAnswers[i].selectedAnswer;
      if (!ans) unattempted++;
      else if (ans === q.correct_answer) correct++;
      else wrong++;
    });

    const score = correct;
    const percent = (correct / questions.length) * 100;
    const endedAt = Date.now();

    // Prepare quiz data for saving
    const quizQuestions: QuizQuestion[] = questions.map((q, i) => ({
      questionId: `q_${i}`,
      question: q.question,
      options: q.all_answers || [],
      correctAnswer: q.correct_answer
    }));

    const quizUserAnswers: QuizUserAnswer[] = userAnswers.map((ua, i) => ({
      questionId: `q_${i}`,
      selectedOption: ua.selectedAnswer,
      isCorrect: ua.selectedAnswer === questions[i].correct_answer,
      timeSpentSeconds: ua.timeSpent
    }));

    const attemptData: QuizAttempt = {
      id: uuidv4(),
      userId: currentUser?.uid || 'guest',
      categoryId: categoryId,
      category: questions[0]?.category || 'General',
      categoryName: questions[0]?.category || 'General',
      difficulty: difficulty,
      startedAt: quizStartedAt,
      finishedAt: endedAt,
      durationSeconds: (endedAt - quizStartedAt) / 1000,
      score,
      percent,
      correct,
      wrong,
      unattempted,
      totalQuestions: questions.length,
      questions: quizQuestions,
      userAnswers: quizUserAnswers
    };

    // Save to Firestore if user is logged in
    if (currentUser) {
      try {
        await saveQuizResult(currentUser.uid, attemptData);
        console.log('Quiz result saved successfully');
      } catch (e) {
        console.error("Failed to save to firestore", e);
        setAlert({ type: 'error', message: 'Failed to save results. Please check your connection.' });
      }
    }

    await clearQuizState();
    navigate('/results', { state: { result: attemptData } });
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-darkbg dark:text-white">Preparing your quiz...</div>;

  const currentQ = questions[currentQuestionIndex];
  const currentA = userAnswers[currentQuestionIndex];
  const timerColor = timeLeft < 30 ? 'text-red-600 animate-pulse' : timeLeft < 120 ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg flex flex-col transition-colors duration-200">
      {/* Custom Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          show={!!alert}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Top Bar */}
      <div className="bg-white dark:bg-darkcard shadow-sm px-4 py-3 flex justify-between items-center sticky top-16 z-40 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-gray-500 dark:text-gray-400 text-sm">Q {currentQuestionIndex + 1}/{questions.length}</span>
          <div className="hidden md:flex space-x-1">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full 
                  ${idx === currentQuestionIndex ? 'bg-primary scale-125' :
                    userAnswers[idx].isMarkedForReview ? 'bg-yellow-400' :
                      userAnswers[idx].selectedAnswer ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-600'}`}
              />
            ))}
          </div>
        </div>
        <div className={`flex items-center font-mono font-bold text-xl ${timerColor}`}>
          <Clock size={20} className="mr-2" />
          {formatTime(timeLeft)}
        </div>
        <button
          onClick={finishQuiz}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition shadow-sm"
        >
          Submit
        </button>
      </div>

      {/* Mobile Question Palette (Horizontal Scroll) */}
      <div className="md:hidden bg-white dark:bg-darkcard border-b border-gray-100 dark:border-gray-700 p-2 flex overflow-x-auto gap-2 no-scrollbar">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestionIndex(i)}
            className={`
               flex-shrink-0 w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors
               ${i === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-darkcard' : ''}
               ${userAnswers[i].isMarkedForReview ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                userAnswers[i].selectedAnswer ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
             `}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 max-w-7xl">

        {/* Question Area */}
        <div className="flex-1 min-w-0 max-w-4xl">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-darkcard p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <span className="bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-200 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide w-fit">
                {currentQ.category}
              </span>
              <button
                onClick={toggleMarkReview}
                className={`flex items-center text-sm transition-colors px-3 py-1.5 rounded-lg self-start sm:self-auto
                  ${currentA.isMarkedForReview
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <Flag size={16} className="mr-2" fill={currentA.isMarkedForReview ? "currentColor" : "none"} />
                <span>{currentA.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
                <span className="ml-1 text-xs opacity-60 hidden sm:inline">(M)</span>
              </button>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-8 leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: currentQ.question }} />

            <div className="space-y-3">
              {currentQ.all_answers?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group
                    ${currentA.selectedAnswer === opt
                      ? 'border-primary bg-blue-50 dark:bg-blue-900/30 shadow-md'
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}
                  `}
                >
                  <span className={`
                     w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold border
                     ${currentA.selectedAnswer === opt ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 group-hover:border-gray-400'}
                   `}>
                    {idx + 1}
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium text-lg" dangerouslySetInnerHTML={{ __html: opt }} />
                  {currentA.selectedAnswer === opt && <CheckCircle className="ml-auto text-primary w-6 h-6" />}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-6 py-3 bg-white dark:bg-darkcard border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="mr-2" size={20} /> Prev
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(p => Math.min(questions.length - 1, p + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 shadow-md disabled:opacity-50"
            >
              Next <ChevronRight className="ml-2" size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar / Palette (Desktop) */}
        <div className="hidden md:block w-72 flex-shrink-0 bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-fit sticky top-32">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Question Palette</h3>
          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`
                  h-10 w-full rounded-lg text-sm font-medium transition-colors flex-shrink-0
                  ${i === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-darkcard' : ''}
                  ${userAnswers[i].isMarkedForReview ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    userAnswers[i].selectedAnswer ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                `}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center"><div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded-sm mr-2"></div> Answered</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 rounded-sm mr-2"></div> Marked</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-sm mr-2"></div> Not Visited</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizRunner;