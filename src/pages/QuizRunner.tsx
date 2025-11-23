import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchQuestions } from '../services/quizService';
import { saveQuizState, getQuizState, clearQuizState } from '../utils/idb';
import { saveQuizResultToFirestore } from '../utils/saveQuizResult';
import { Question, UserAnswer, QuizAttempt } from '../types';
import { TIMERS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

  // Refs for autosave logic
  const stateRef = useRef({ questions, currentQuestionIndex, userAnswers, timeLeft });
  
  useEffect(() => {
    stateRef.current = { questions, currentQuestionIndex, userAnswers, timeLeft };
  }, [questions, currentQuestionIndex, userAnswers, timeLeft]);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      const saved = await getQuizState();
      
      if (saved && saved.status === 'active') {
        // Resume
        setQuestions(saved.questions);
        setUserAnswers(saved.userAnswers);
        setTimeLeft(saved.timeLeft);
        setCurrentQuestionIndex(saved.currentQuestionIndex);
        setLoading(false);
      } else {
        // New Start
        const state = location.state as QuizLocationState;
        if (!state) {
          navigate('/setup');
          return;
        }
        try {
          const qs = await fetchQuestions(state.categoryId, state.difficulty);
          setQuestions(qs);
          
          // Initialize answers structure
          const initialAnswers: UserAnswer[] = qs.map((_, i) => ({
            questionIndex: i,
            selectedAnswer: null,
            isMarkedForReview: false,
            timeSpent: 0
          }));
          setUserAnswers(initialAnswers);
          
          const duration = TIMERS[state.difficulty as keyof typeof TIMERS] || 1200;
          setTimeLeft(duration);
          setLoading(false);
        } catch (error) {
          alert('Failed to load questions. Please try again.');
          navigate('/setup');
        }
      }
    };
    init();
  }, [location, navigate]);

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
      
      if (['1','2','3','4'].includes(e.key)) {
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
        if(window.confirm("Submit quiz?")) finishQuiz();
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

    const attemptData: QuizAttempt = {
      id: uuidv4(),
      userId: currentUser?.uid || 'guest',
      category: questions[0].category,
      difficulty: questions[0].difficulty,
      startedAt: quizStartedAt,
      endedAt,
      durationSeconds: (endedAt - quizStartedAt) / 1000,
      score,
      percent,
      correct,
      wrong,
      unattempted,
      questions,
      userAnswers
    };

    if (currentUser) {
      await saveQuizResultToFirestore(currentUser.uid, attemptData);
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
      
      {/* 1. Timer / Top Bar */}
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
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition shadow-sm font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* 2. Mobile Question Palette (Horizontal Scroll - TOP after header/timer) */}
      <div className="md:hidden bg-white dark:bg-darkcard border-b border-gray-100 dark:border-gray-700 p-3 overflow-x-auto no-scrollbar sticky top-[8.5rem] z-30 shadow-sm">
         <div className="flex space-x-2">
           {questions.map((_, i) => (
             <button
               key={i}
               onClick={() => setCurrentQuestionIndex(i)}
               className={`
                 flex-shrink-0 w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center transition-all
                 ${i === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-darkcard scale-110' : ''}
                 ${userAnswers[i].isMarkedForReview ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                   userAnswers[i].selectedAnswer ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
               `}
             >
               {i + 1}
             </button>
           ))}
         </div>
      </div>

      {/* 3. Main Content Area */}
      <main className="flex-grow max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
        
        {/* Question Area */}
        <div className="flex-grow">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-darkcard p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-full"
          >
             <div className="flex justify-between items-start mb-6">
               <span className="bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                 {currentQ.category}
               </span>
               <button 
                onClick={toggleMarkReview}
                className={`flex items-center text-sm transition-colors ${currentA.isMarkedForReview ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
               >
                 <Flag size={16} className="mr-1" fill={currentA.isMarkedForReview ? "currentColor" : "none"} />
                 {currentA.isMarkedForReview ? 'Marked' : 'Mark for Review'} (M)
               </button>
             </div>

             <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.question }} />

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
                     w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold border flex-shrink-0
                     ${currentA.selectedAnswer === opt ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 group-hover:border-gray-400'}
                   `}>
                     {idx + 1}
                   </span>
                   <span className="text-gray-800 dark:text-gray-200 font-medium text-lg" dangerouslySetInnerHTML={{ __html: opt }} />
                   {currentA.selectedAnswer === opt && <CheckCircle className="ml-auto text-primary w-6 h-6 flex-shrink-0" />}
                 </button>
               ))}
             </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-6 py-3 bg-white dark:bg-darkcard border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <ChevronLeft className="mr-2" size={20} /> Prev
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(p => Math.min(questions.length - 1, p + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="ml-2" size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar / Palette (Desktop) */}
        <div className="hidden md:block w-72 bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-fit sticky top-32">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Question Palette</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`
                  h-10 rounded-lg text-sm font-medium transition-all hover:scale-105
                  ${i === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-darkcard' : ''}
                  ${userAnswers[i].isMarkedForReview ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                    userAnswers[i].selectedAnswer ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                `}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center"><div className="w-3 h-3 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-sm mr-3"></div> Answered</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-sm mr-3"></div> Marked</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm mr-3"></div> Not Visited</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizRunner;
