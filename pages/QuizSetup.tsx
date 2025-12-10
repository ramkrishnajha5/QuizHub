import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../utils/api';
import { Category } from '../types';
import { motion } from 'framer-motion';
import { TIMERS, QUESTION_COUNTS } from '../constants';
import { clearQuizState } from '../utils/idb';
import { Brain, Clock, ListChecks, Sparkles, Play } from 'lucide-react';

const QuizSetup: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(15); // Default to 15 questions
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  }, []);

  const handleStart = async () => {
    if (selectedCategory === null) {
      alert("Please select a category");
      return;
    }
    // Clear any previous saved state
    await clearQuizState();

    // Navigate to runner with config
    navigate('/quiz', {
      state: {
        categoryId: selectedCategory,
        questionCount: questionCount
      }
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
    </div>
  );
};

export default QuizSetup;