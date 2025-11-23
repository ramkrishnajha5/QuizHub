import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../utils/api';
import { Category, Difficulty } from '../types';
import { motion } from 'framer-motion';
import { TIMERS } from '../constants';
import { clearQuizState } from '../utils/idb';

const QuizSetup: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
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
        difficulty: difficulty
      }
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary dark:text-blue-400">Loading Categories...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-darkcard rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <div className="bg-primary px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Configure Your Quiz</h2>
          <p className="text-blue-100 mt-1">Select a topic and difficulty to begin.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Category</label>
            <select
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
            >
              <option value="" disabled>Choose a topic...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Difficulty</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(Difficulty).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`
                    py-3 px-4 rounded-xl border-2 font-medium capitalize transition-all
                    ${difficulty === diff
                      ? 'border-primary bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}
                  `}
                >
                  {diff}
                  <span className="block text-xs font-normal mt-1 text-gray-500 dark:text-gray-500">
                    {(TIMERS[diff as keyof typeof TIMERS] / 60).toFixed(0)} min
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            <p>Questions: <span className="font-bold text-gray-900 dark:text-white">25</span></p>
            <p>Time Limit: <span className="font-bold text-gray-900 dark:text-white">{(TIMERS[difficulty] / 60).toFixed(0)} minutes</span></p>
          </div>

          <button
            onClick={handleStart}
            disabled={selectedCategory === null}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
          >
            Start Quiz
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizSetup;