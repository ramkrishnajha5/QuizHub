import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchQuestions } from '../utils/api';
import { saveQuizState, getQuizState, clearQuizState } from '../utils/idb';
import { Question, UserAnswer, QuizAttempt } from '../types';
import { TIMERS } from '../constants';
import { auth, db } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Alert from '../components/Alert';
import { saveQuizResult } from '../utils/saveQuizResult';
import { useAuth } from '../contexts/AuthContext';
import { useQuiz } from '../contexts/QuizContext';
import { getPublishedAdminQuizzes } from '../admin/utils/adminFirestore';
import { QuizQuestion, UserAnswer as QuizUserAnswer } from '../types';
import CustomModal from '../components/CustomModal';
import { useCustomModal } from '../hooks/useCustomModal';

interface QuizLocationState {
  categoryId: number;
  questionCount: number;
}

const QuizRunner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { setQuizInProgress } = useQuiz();

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
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [submitCooldown, setSubmitCooldown] = useState(0);
  const [globalEndTime, setGlobalEndTime] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const [quizId, setQuizId] = useState<string | null>(null);
  const [quizSource, setQuizSource] = useState<string>('api');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const { modalState, showConfirm, closeModal } = useCustomModal();
  const warningShownRef = useRef(false);

  // Derive unique sections from questions
  const sections = useMemo(() => {
    const list = questions.map(q => q.section?.trim()).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [questions]);

  // Keep activeSection synchronized with current question
  useEffect(() => {
    if (sections.length > 0) {
      const qSec = questions[currentQuestionIndex]?.section?.trim();
      if (qSec && qSec !== activeSection) {
        setActiveSection(qSec);
      } else if (!activeSection && sections[0]) {
        setActiveSection(sections[0]);
      }
    }
  }, [currentQuestionIndex, questions, sections, activeSection]);

  const handleSwitchSection = (sec: string) => {
    setActiveSection(sec);
    const firstIdx = questions.findIndex(q => (q.section?.trim() || '') === sec);
    if (firstIdx !== -1) {
      setCurrentQuestionIndex(firstIdx);
    }
  };

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
        const state = location.state as any;

        // 1. If fresh navigation state was passed (e.g. from QuizSetup), ALWAYS initialize from state!
        if (state && (state.source === 'admin' || state.categoryId)) {
          console.log('Starting new quiz from navigation state...');
          await clearQuizState();

          if (state.source === 'admin' && state.questions) {
            console.log('Loading custom admin quiz:', state.title);
            if (state.quizId) setQuizId(state.quizId);
            setQuizSource('admin');
            if (state.title) setQuizTitle(state.title);

            const qs: Question[] = state.questions.map((q: any) => ({
              question: q.questionText,
              correct_answer: q.options[q.correctOption],
              incorrect_answers: q.options.filter((_: string, idx: number) => idx !== q.correctOption),
              all_answers: q.options,
              category: state.category,
              difficulty: state.difficulty,
              type: 'multiple',
              explanation: q.explanation,
              section: q.section?.trim() || undefined,
            }));

            setCategoryId(0);
            setQuestionCount(qs.length);
            setQuestions(qs);

            const initialAnswers: UserAnswer[] = qs.map((_, i) => ({
              questionIndex: i,
              selectedAnswer: null,
              isMarkedForReview: false,
              timeSpent: 0,
            }));
            setUserAnswers(initialAnswers);

            setTimeLeft((state.timeLimitMinutes || qs.length) * 60);

            if (state.availableUntil) {
              const extractDate = (val: any) => {
                if (!val) return null;
                if (val.seconds) return new Date(val.seconds * 1000);
                if (val.toDate) return val.toDate();
                return new Date(val);
              };
              const endDate = extractDate(state.availableUntil);
              if (endDate) setGlobalEndTime(endDate.getTime());
            }

            console.log('✅ Custom quiz initialized with', qs.length, 'questions');
            setLoading(false);
            setIsInitialized(true);
            setQuizInProgress(true);
            return;
          }

          // Regular OpenTDB Quiz
          setCategoryId(state.categoryId);
          setQuestionCount(state.questionCount || 15);
          setQuizSource('api');

          const response = await fetchQuestions(state.categoryId, state.questionCount);
          const qs = response.questions;
          const warning = response.warning;

          if (warning) {
            setAlert({ type: 'warning', message: warning });
            setTimeout(() => setAlert(null), 5000);
          }

          if (!qs || !Array.isArray(qs) || qs.length === 0) {
            console.error('No questions returned from API');
            if (!hasShownError) {
              setHasShownError(true);
              setAlert({ type: 'error', message: 'No questions available for this category. Please try another selection.' });
              setTimeout(() => navigate('/setup'), 3000);
            }
            return;
          }

          setQuestions(qs);
          const initialAnswers: UserAnswer[] = qs.map((_, i) => ({
            questionIndex: i,
            selectedAnswer: null,
            isMarkedForReview: false,
            timeSpent: 0
          }));
          setUserAnswers(initialAnswers);

          const duration = TIMERS[state.questionCount] || TIMERS[15];
          setTimeLeft(duration);

          console.log('✅ Quiz initialized successfully with', qs.length, 'questions');
          setLoading(false);
          setIsInitialized(true);
          setQuizInProgress(true);
          return;
        }

        // 2. If NO navigation state is present (e.g. browser reloaded / resumed), check IndexedDB:
        const saved = await getQuizState();

        if (saved && saved.status === 'active') {
          console.log('Resuming active quiz from IndexedDB...');
          let questionsToUse: Question[] = saved.questions || [];

          if (saved.quizId) setQuizId(saved.quizId);
          if (saved.source) setQuizSource(saved.source);
          if (saved.title) setQuizTitle(saved.title);

          // Auto-heal: If saved questions are missing sections, fetch latest from Firestore!
          const hasSections = questionsToUse.some((q: any) => q.section && q.section.trim());
          if (!hasSections && questionsToUse.length > 0) {
            try {
              console.log('Checking Firestore to sync sections for saved quiz...');
              const publishedQuizzes = await getPublishedAdminQuizzes();
              const matched = publishedQuizzes.find(pq =>
                (saved.quizId && pq.quizId === saved.quizId) ||
                (pq.questions && pq.questions.length === questionsToUse.length &&
                  (pq.title === saved.category || pq.title === saved.title || pq.questions[0]?.questionText === questionsToUse[0]?.question))
              );

              if (matched && matched.questions) {
                console.log('✅ Found matching Firestore quiz:', matched.title, 'with', matched.sections?.length || 0, 'sections. Syncing sections...');
                if (!saved.quizId) setQuizId(matched.quizId);
                setQuizSource('admin');
                if (matched.title) setQuizTitle(matched.title);

                questionsToUse = questionsToUse.map((q: any, i: number) => {
                  const liveQ = matched.questions[i] || matched.questions.find((lq: any) => lq.questionText === q.question);
                  return {
                    ...q,
                    section: liveQ?.section?.trim() || undefined
                  };
                });
              }
            } catch (syncErr) {
              console.warn('Could not sync sections from Firestore:', syncErr);
            }
          }

          setQuestions(questionsToUse);
          setUserAnswers(saved.userAnswers);
          setTimeLeft(saved.timeLeft);
          setCurrentQuestionIndex(saved.currentQuestionIndex);
          setLoading(false);
          setIsInitialized(true);
          setQuizInProgress(true);
          return;
        }

        // 3. No state and no saved quiz found
        console.log('No quiz configuration found, redirecting to setup...');
        navigate('/setup');
        return;
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
          userMessage = '📚 No Questions Available\n\nThis category doesn\'t have enough questions for the selected count. Try:\n• Selecting fewer questions\n• Choosing a different category\n• Trying a different topic with more available questions';
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
          userMessage = '⚠️ Quiz API Error\n\n' + errorMessage + '\n\nPlease try selecting a different category or question count.';
        }

        setAlert({ type: errorType, message: userMessage });
        setTimeout(() => navigate('/setup'), 5000);
      }
    };

    init();
  }, []); // Empty dependency array - only run once

  // Browser beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!loading && !isSubmitting && isInitialized) {
        e.preventDefault();
        e.returnValue = 'Your quiz progress will be lost if you leave. Are you sure?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [loading, isSubmitting, isInitialized]);

  // Timer with 30-second warning
  useEffect(() => {
    if (loading || timeLeft <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        // Show 30-second warning popup
        if (prev === 31 && !warningShownRef.current) {
          warningShownRef.current = true;
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
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

  // Global end-time enforcement for admin quizzes
  useEffect(() => {
    if (!globalEndTime || isSubmitting) return;
    const checker = setInterval(() => {
      const msLeft = globalEndTime - Date.now();
      const secLeft = Math.ceil(msLeft / 1000);

      if (secLeft <= 0) {
        clearInterval(checker);
        finishQuiz();
      } else if (secLeft <= 30 && !warningShownRef.current) {
        warningShownRef.current = true;
        setShowTimeWarning(true);
        setTimeout(() => setShowTimeWarning(false), 5000);
      }
    }, 1000);
    return () => clearInterval(checker);
  }, [globalEndTime, isSubmitting]);

  // Autosave - include category info and quiz identifiers
  useEffect(() => {
    const saver = setInterval(() => {
      if (!loading && !isSubmitting && questions.length > 0) {
        saveQuizState({
          status: 'active',
          category: questions[0]?.category || 'General',
          categoryId: categoryId,
          questionCount: questionCount,
          quizId: quizId,
          source: quizSource,
          title: quizTitle,
          ...stateRef.current
        });
      }
    }, 5000);
    return () => clearInterval(saver);
  }, [loading, isSubmitting, questions, categoryId, questionCount, quizId, quizSource, quizTitle]);

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
        showConfirm({
          title: 'Submit Quiz?',
          message: 'Are you sure you want to submit? You cannot change answers after submission.',
          onConfirm: () => finishQuiz(),
          confirmText: 'Submit',
          cancelText: 'Cancel',
          confirmStyle: 'primary',
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const handleAnswer = (answer: string) => {
    const updated = [...userAnswers];
    if (updated[currentQuestionIndex].selectedAnswer === answer) {
      updated[currentQuestionIndex].selectedAnswer = null;
    } else {
      updated[currentQuestionIndex].selectedAnswer = answer;
    }
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
    setQuizInProgress(false); // Clear quiz protection

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    let score = 0;

    const statePayload = location.state as any;
    const isAdminQuiz = statePayload?.source === 'admin';
    const negativeMarking = isAdminQuiz ? (statePayload?.negativeMarking === true) : false;

    questions.forEach((q, i) => {
      const ans = userAnswers[i].selectedAnswer;
      if (!ans) {
        unattempted++;
      } else if (ans === q.correct_answer) {
        correct++;
        score += 1;
      } else {
        wrong++;
        if (negativeMarking) {
          score -= 0.25;
        }
      }
    });

    score = Math.max(0, score);
    const percent = (score / questions.length) * 100;
    const endedAt = Date.now();

    // Prepare quiz data for saving
    const quizQuestions: QuizQuestion[] = questions.map((q, i) => ({
      questionId: `q_${i}`,
      question: q.question,
      options: q.all_answers || [],
      correctAnswer: q.correct_answer,
      section: q.section,
    }));

    const quizUserAnswers: QuizUserAnswer[] = userAnswers.map((ua, i) => ({
      questionId: `q_${i}`,
      selectedOption: ua.selectedAnswer,
      isCorrect: ua.selectedAnswer === questions[i].correct_answer,
      timeSpentSeconds: ua.timeSpent
    }));

    // Determine quiz difficulty - if all questions have same difficulty use that, otherwise 'mixed'
    const difficulties = [...new Set(questions.map(q => String(q.difficulty || 'mixed')))];
    const quizDifficulty = difficulties.length === 1 ? String(difficulties[0]) : 'mixed';

    const attemptData: QuizAttempt = {
      id: uuidv4(),
      userId: currentUser?.uid || 'guest',
      categoryId: categoryId,
      category: questions[0]?.category || 'General',
      categoryName: questions[0]?.category || 'General',
      difficulty: quizDifficulty,
      questionCount: questionCount,
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
      userAnswers: quizUserAnswers,
      ...(isAdminQuiz ? {
        source: 'admin',
        quizId: statePayload?.quizId,
        quizTitle: statePayload?.title,
        negativeMarking: negativeMarking,
      } : {}),
    } as unknown as QuizAttempt;

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

  const handleSubmitQuiz = () => {
    if (submitCooldown > 0 || isSubmitting) return;
    showConfirm({
      title: 'Submit Quiz?',
      message: 'Are you sure you want to submit? You cannot change answers after submission.',
      onConfirm: () => {
        setSubmitCooldown(8);
        const cd = setInterval(() => {
          setSubmitCooldown(p => {
            if (p <= 1) {
              clearInterval(cd);
              return 0;
            }
            return p - 1;
          });
        }, 1000);
        finishQuiz();
      },
      confirmText: 'Submit',
      cancelText: 'Cancel',
      confirmStyle: 'primary',
    });
  };

  const answeredCount = useMemo(() => {
    return userAnswers.filter(ua => ua && ua.selectedAnswer !== null && ua.selectedAnswer !== undefined).length;
  }, [userAnswers]);

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
      <div className="bg-white dark:bg-darkcard shadow-sm px-4 md:px-6 py-3 flex justify-between items-center sticky top-16 z-40 border-b border-gray-100 dark:border-gray-700 w-full">
        {/* Left: Question counter and status */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <span className="font-bold text-gray-700 dark:text-gray-200 text-sm md:text-base">
            Q <span className="text-primary">{currentQuestionIndex + 1}</span>/{questions.length}
          </span>
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-gray-200 dark:border-gray-700 text-xs">
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
              {answeredCount} Ans
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
              {questions.length - answeredCount} Left
            </span>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div className={`flex items-center font-mono font-bold text-base md:text-xl px-3 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-inner ${timerColor}`}>
          <Clock size={18} className="mr-2 flex-shrink-0" />
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Right: Submit Button */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handleSubmitQuiz}
            disabled={submitCooldown > 0 || isSubmitting}
            className={`px-4 py-2 text-white text-xs md:text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5 ${
              submitCooldown > 0 || isSubmitting
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-90'
                : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-green-600/20'
            }`}
          >
            {submitCooldown > 0 ? (
              <>
                <Clock size={14} className="animate-spin" />
                <span>Wait {submitCooldown}s</span>
              </>
            ) : isSubmitting ? (
              'Submitting...'
            ) : (
              'Submit Quiz'
            )}
          </button>
        </div>
      </div>

      {/* Section Selector Bar (Visible when quiz has sections) */}
      {sections.length > 0 && (
        <div className="bg-white/95 dark:bg-darkcard/95 backdrop-blur-md px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 overflow-x-auto no-scrollbar z-30 sticky top-28 shadow-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 flex-shrink-0 uppercase tracking-wider pr-1">
            <Layers size={14} className="text-primary" /> Sections:
          </span>
          {sections.map((sec) => {
            const secIndices = questions.map((q, i) => ({ q, i })).filter(({ q }) => (q.section?.trim() || '') === sec);
            const answeredCount = secIndices.filter(({ i }) => userAnswers[i]?.selectedAnswer !== null && userAnswers[i]?.selectedAnswer !== undefined).length;
            const isCurrentSec = (currentQ?.section?.trim() || '') === sec || activeSection === sec;

            return (
              <button
                key={sec}
                type="button"
                onClick={() => handleSwitchSection(sec)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  isCurrentSec
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                    : 'bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{sec}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isCurrentSec
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {answeredCount}/{secIndices.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile Question Palette (Horizontal Scroll) */}
      <div className="md:hidden bg-white dark:bg-darkcard border-b border-gray-100 dark:border-gray-700 p-2 flex overflow-x-auto gap-2 no-scrollbar">
        {(sections.length > 0
          ? questions.map((q, i) => ({ q, i })).filter(({ q }) => (q.section?.trim() || '') === (activeSection || currentQ?.section))
          : questions.map((q, i) => ({ q, i }))
        ).map(({ i }) => (
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-200 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide w-fit">
                  {currentQ.category}
                </span>
                {currentQ.section && (
                  <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                    🏷️ Section: {currentQ.section}
                  </span>
                )}
              </div>
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
        <div className="hidden md:block w-80 flex-shrink-0 bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-fit sticky top-36">
          {/* Quick Timer & Submit bar for PC */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className={timerColor} />
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Time Left</div>
                <div className={`font-mono font-bold text-base ${timerColor}`}>{formatTime(timeLeft)}</div>
              </div>
            </div>
            <button
              onClick={handleSubmitQuiz}
              disabled={submitCooldown > 0 || isSubmitting}
              className={`px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-all shadow-sm ${
                submitCooldown > 0 || isSubmitting
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:scale-95'
              }`}
            >
              {submitCooldown > 0 ? `Wait ${submitCooldown}s` : 'Submit'}
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Question Palette</h3>
            {sections.length > 0 && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {activeSection || currentQ.section}
              </span>
            )}
          </div>

          {/* Grouped sections or single palette */}
          {sections.length > 0 ? (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {sections.map((sec) => {
                const secItems = questions
                  .map((q, i) => ({ q, i }))
                  .filter(({ q }) => (q.section?.trim() || '') === sec);
                const isSecActive = (activeSection || currentQ?.section) === sec;

                return (
                  <div key={sec} className={`rounded-xl border p-2.5 transition-all ${
                    isSecActive
                      ? 'border-primary/40 bg-blue-50/20 dark:bg-blue-900/10'
                      : 'border-gray-100 dark:border-gray-800'
                  }`}>
                    <div 
                      onClick={() => handleSwitchSection(sec)}
                      className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 cursor-pointer hover:text-primary"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isSecActive ? 'bg-primary' : 'bg-gray-400'}`} />
                        {sec}
                      </span>
                      <span className="text-[11px] text-gray-400 font-normal">
                        {secItems.filter(({ i }) => userAnswers[i]?.selectedAnswer).length}/{secItems.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {secItems.map(({ i }) => (
                        <button
                          key={i}
                          onClick={() => {
                            setActiveSection(sec);
                            setCurrentQuestionIndex(i);
                          }}
                          className={`
                            h-9 w-full rounded-lg text-xs font-bold transition-all flex items-center justify-center
                            ${i === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-darkcard shadow-sm' : ''}
                            ${userAnswers[i]?.isMarkedForReview ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              userAnswers[i]?.selectedAnswer ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                          `}
                          title={`Q${i + 1} (${sec})`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`
                    h-10 w-full rounded-lg text-sm font-medium transition-colors flex-shrink-0
                    ${i === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-darkcard' : ''}
                    ${userAnswers[i]?.isMarkedForReview ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      userAnswers[i]?.selectedAnswer ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center"><div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded-sm mr-2"></div> Answered</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 rounded-sm mr-2"></div> Marked</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-sm mr-2"></div> Not Visited</div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleSubmitQuiz}
              disabled={submitCooldown > 0 || isSubmitting}
              className={`w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow flex items-center justify-center gap-2 ${
                submitCooldown > 0 || isSubmitting
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:scale-98 shadow-green-600/20'
              }`}
            >
              {submitCooldown > 0 ? `Wait ${submitCooldown}s before submit` : 'Submit Entire Quiz'}
            </button>
          </div>
        </div>
      </main>

      {/* 30-Second Warning Popup */}
      <AnimatePresence>
        {showTimeWarning && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md"
          >
            <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-sm">⏰ Only 30 seconds left!</p>
              <p className="text-xs text-red-100">Your quiz will be auto-submitted when time runs out.</p>
            </div>
            <button onClick={() => setShowTimeWarning(false)} className="ml-2 text-white/70 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <CustomModal {...modalState} onClose={closeModal} />
    </div>
  );
};

export default QuizRunner;