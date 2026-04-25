import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../utils/api';
import { Category } from '../types';
import { motion } from 'framer-motion';
import { TIMERS, QUESTION_COUNTS } from '../constants';
import { clearQuizState } from '../utils/idb';
import { Brain, Clock, ListChecks, Sparkles, Play, Star, ChevronRight, X, Lock, Unlock, CalendarDays } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { getPublishedAdminQuizzes, AdminQuiz } from '../admin/utils/adminFirestore';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import CustomModal from '../components/CustomModal';
import { useCustomModal } from '../hooks/useCustomModal';

const QuizSetup: React.FC = () => {
  const { currentUser } = useAuth();
  const { modalState, showAlert, closeModal } = useCustomModal();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(15); // Default to 15 questions
  const [loading, setLoading] = useState(true);
  const [customQuizzes, setCustomQuizzes] = useState<AdminQuiz[]>([]);
  const [infoModalQuiz, setInfoModalQuiz] = useState<AdminQuiz | null>(null);
  const navigate = useNavigate();

  const getAvailabilityStatus = (quiz: AdminQuiz) => {
    if (!quiz.hasTimeRestriction) {
      return { status: 'available', text: 'Available Now', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', locked: false };
    }
    
    const now = new Date();
    // Support string dates or firestore Timestamps if they come as objects
    const extractDate = (val: any) => {
      if (!val) return null;
      if (val.seconds) return new Date(val.seconds * 1000);
      if (val.toDate) return val.toDate();
      return new Date(val);
    };

    const startTime = extractDate(quiz.availableFrom);
    const endTime = extractDate(quiz.availableUntil);
    
    if (startTime && now < startTime) {
      return { 
        status: 'upcoming', 
        text: `Opens ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        locked: true
      };
    }
    
    if (endTime && now > endTime) {
      return { 
        status: 'ended', 
        text: 'Quiz Ended', 
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        locked: true
      };
    }
    
    return { status: 'live', text: 'Live Now', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', locked: false };
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadCategories();

    // Load custom admin quizzes
    const loadCustomQuizzes = async () => {
      try {
        const quizzes = await getPublishedAdminQuizzes();
        setCustomQuizzes(quizzes);
      } catch (err) {
        console.error('Could not load custom quizzes:', err);
      }
    };
    loadCustomQuizzes();
  }, []);

  const checkBanAndStart = async (quizConfig: any) => {
    try {
      if (!currentUser) { navigate('/login'); return; }
      const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userSnap.exists() || userSnap.data()?.isBanned === true) {
        await signOut(auth);
        window.location.href = '/#/login?banned=true';
        return;
      }
      navigate('/quiz', { state: quizConfig });
    } catch {
      navigate('/quiz', { state: quizConfig }); // fail open
    }
  };

  const handleStart = async () => {
    if (selectedCategory === null) {
      showAlert({ title: 'No Category Selected', message: 'Please select a category before starting the quiz.', confirmStyle: 'primary' });
      return;
    }
    // Clear any previous saved state
    await clearQuizState();

    // Navigate to runner with config (with ban check)
    checkBanAndStart({
      categoryId: selectedCategory,
      questionCount: questionCount,
    });
  };

  const handleStartCustomQuiz = async (quiz: AdminQuiz) => {
    await clearQuizState();
    checkBanAndStart({
      source: 'admin',
      quizId: quiz.quizId,
      title: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      questions: quiz.questions,
      timeLimitMinutes: quiz.timeLimitMinutes || 10,
      negativeMarking: quiz.negativeMarking || false,
      hasTimeRestriction: quiz.hasTimeRestriction || false,
      availableUntil: quiz.availableUntil || null,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
        >
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 px-8 py-10">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-10 h-10 text-white" />
                <h2 className="text-4xl font-extrabold text-white">Configure Your Quiz</h2>
              </div>
              <p className="text-blue-100 text-lg">Select your topic and number of questions to begin your learning journey</p>
            </div>
          </div>

          {/* Custom Quizzes by QuizHub Team -> Moved ABOVE standard configurator */}
          {customQuizzes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border-b-4 border-gray-100 dark:border-gray-800"
            >
              <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-8 py-5">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-white" />
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">Quizzes by QuizHub Team</h3>
                  </div>
                </div>
              </div>
              <div className="p-8 grid sm:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-800/30">
                {customQuizzes.map((quiz) => {
                  const status = getAvailabilityStatus(quiz);
                  return (
                    <motion.button
                      key={quiz.quizId}
                      onClick={() => setInfoModalQuiz(quiz)}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="text-left p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
                    >
                      {status.locked && <div className="absolute inset-0 bg-gray-100/30 dark:bg-gray-900/30 backdrop-blur-[1px] z-10 pointers-events-none" />}
                      <div className="relative z-20">
                        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                          <div className="flex gap-2.5">
                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                              quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : quiz.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            } capitalize shadow-sm`}>
                              {quiz.difficulty}
                            </span>
                            <span className={`px-2 py-1 text-xs font-bold rounded-md shadow-sm ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                          {!status.locked && (
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                          )}
                          {status.locked && (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">{quiz.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{quiz.category}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">📝 {quiz.totalQuestions} Questions</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">⏱️ {quiz.timeLimitMinutes || 10} Minutes</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="p-8 md:p-10 space-y-8">
            {/* Category Selection */}
            <div>
              <label className="flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Select Category
              </label>
              <select
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium text-lg transition-all"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
              >
                <option value="" disabled>Choose a topic...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Question Count Selection */}
            <div>
              <label className="flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Number of Questions & Time
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {QUESTION_COUNTS.map((count) => (
                  <motion.button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative overflow-hidden py-6 px-4 rounded-2xl border-2 font-bold transition-all duration-300
                      ${questionCount === count
                        ? 'border-primary bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-primary dark:text-blue-400 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}
                    `}
                  >
                    {/* Selected indicator */}
                    {questionCount === count && (
                      <motion.div
                        layoutId="selectedIndicator"
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                      />
                    )}

                    <div className="relative z-10">
                      <div className="text-3xl font-extrabold mb-2">{count}</div>
                      <div className="text-sm font-semibold">Questions</div>
                      <div className="mt-2 pt-2 border-t border-current/20">
                        <Clock className="w-4 h-4 inline mr-1" />
                        <span className="text-xs font-medium">
                          {(TIMERS[count] / 60)} min
                        </span>
                      </div>
                    </div>

                    {/* Checkmark for selected */}
                    {questionCount === count && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Questions are randomly selected and shuffled each time for a unique experience
              </p>
            </div>

            {/* Summary Box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-2xl"></div>

              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Quiz Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Questions</div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{questionCount}</div>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Limit</div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {(TIMERS[questionCount] / 60)} min
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Start Button */}
            <motion.button
              onClick={handleStart}
              disabled={selectedCategory === null}
              whileHover={{ scale: selectedCategory === null ? 1 : 1.02 }}
              whileTap={{ scale: selectedCategory === null ? 1 : 0.98 }}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              Start Quiz
            </motion.button>
          </div>
        </motion.div>

        {/* Replaced Custom Quizzes Section with Quiz Info Modal */}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50"
        >
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">📝 Quiz Features</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Questions are randomly shuffled from a larger pool for variety</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Answer options are randomized in each quiz</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Progress is auto-saved every 5 seconds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Mark questions for review and navigate freely</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Quiz Info Modal */}
      <AnimatePresence>
        {infoModalQuiz && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setInfoModalQuiz(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-start justify-between text-white">
                <div>
                  <h3 className="text-2xl font-black mb-1 leading-tight">{infoModalQuiz.title}</h3>
                  <p className="text-white/80 text-sm font-medium">{infoModalQuiz.category}</p>
                </div>
                <button
                  onClick={() => setInfoModalQuiz(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6 flex-1 bg-gray-50 dark:bg-transparent">
                {(() => {
                  const status = getAvailabilityStatus(infoModalQuiz);
                  return (
                    <>
                      {/* Detailed Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-700/50 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                          <ListChecks className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Questions</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">{infoModalQuiz.totalQuestions}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-700/50 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                          <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Time Limit</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">{infoModalQuiz.timeLimitMinutes || 10} <span className="text-sm">min</span></p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Difficulty</span>
                          <span className={`px-3 py-1 text-xs font-black rounded-lg capitalize ${
                            infoModalQuiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            infoModalQuiz.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>{infoModalQuiz.difficulty}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Negative Marking</span>
                          <span className={`px-3 py-1 text-xs font-black rounded-lg ${
                            infoModalQuiz.negativeMarking ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                          }`}>{infoModalQuiz.negativeMarking ? 'Yes (-0.25)' : 'No'}</span>
                        </div>
                        
                        {infoModalQuiz.hasTimeRestriction && (
                          <div className={`p-4 rounded-2xl shadow-sm border flex items-start gap-3 ${status.locked ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
                            {status.locked ? <Lock className="w-5 h-5 text-red-500 mt-0.5" /> : <Unlock className="w-5 h-5 text-green-500 mt-0.5" />}
                            <div>
                              <p className={`text-sm font-bold ${status.locked ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-400'} mb-1`}>
                                Window Restricted
                              </p>
                              <p className={`text-xs ${status.locked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-500'}`}>
                                {status.text}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          disabled={status.locked}
                          onClick={() => handleStartCustomQuiz(infoModalQuiz)}
                          className={`w-full py-5 rounded-2xl font-black text-lg transition-all transform flex items-center justify-center gap-3 ${
                            status.locked 
                              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed shadow-none'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1'
                          }`}
                        >
                          {status.locked ? (
                            <> <Lock className="w-5 h-5" /> Locked </>
                          ) : (
                            <> 🚀 Start Quiz </>
                          )}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <CustomModal {...modalState} onClose={closeModal} />
    </div>
  );
};

export default QuizSetup;