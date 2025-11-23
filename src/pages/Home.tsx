import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Play, History, Zap, BarChart2, ArrowRight, Award, Layers, Smartphone, BookOpen, Brain, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { getQuizState } from '../utils/idb';
import { QuizAttempt } from '../types';

const Home: React.FC = () => {
  const { currentUser: user, loading } = useAuth();
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [savedState, setSavedState] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkResume = async () => {
      const saved = await getQuizState();
      if (saved && saved.status === 'active') {
        setSavedState(saved);
      }
    };
    checkResume();

    if (user) {
      const fetchHistory = async () => {
        try {
          const q = query(
            collection(db, `users/${user.uid}/quizSummaries`),
            orderBy('finishedAt', 'desc'),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          const attempts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRecentAttempts(attempts);
        } catch (e) {
          console.error("Could not fetch history:", e);
        }
      };
      fetchHistory();
    }
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-darkbg"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!user) {
    // Guest View (Unchanged visual)
    return (
      <div className="bg-gray-50 dark:bg-darkbg min-h-[calc(100vh-4rem)] flex flex-col justify-center transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-tight">
              Master Your Knowledge with <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">PrepPulse</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              The smartest way to prepare. Access thousands of free mock tests, track your progress with advanced analytics, and achieve your learning goals without distractions.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Link to="/setup" className="flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-primary hover:bg-blue-700 md:py-4 md:px-12 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <Play className="w-6 h-6 mr-2" fill="currentColor" />
                Start Quiz Now
              </Link>
              <Link to="/login" className="flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-lg font-bold rounded-full text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:px-12 shadow-sm hover:shadow-md transition-all">
                Create Free Account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:text-white">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.displayName?.split(' ')[0] || 'Scholar'}! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Ready to expand your horizons today?</p>
      </motion.div>

      {savedState && (
        <div className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm gap-4">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-200">
                <Target size={24} />
             </div>
             <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">Resume Pending Quiz</h3>
                <p className="text-indigo-700 dark:text-indigo-300 text-sm">You have an unfinished {savedState.category || 'Mix'} quiz waiting.</p>
             </div>
          </div>
          <button 
            onClick={() => navigate('/quiz')}
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-md whitespace-nowrap"
          >
            Continue Quiz
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden" onClick={() => navigate('/setup')}>
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full text-primary dark:text-blue-400 group-hover:scale-110 transition-transform"><Play size={24} fill="currentColor" /></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Start New Quiz</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Choose from 20+ categories.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400"><Award size={24} /></div>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{recentAttempts.length > 0 ? Math.max(...recentAttempts.map(a => a.percent)).toFixed(0) : 0}%</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Best Score</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Your all-time high score.</p>
        </div>

        <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400"><History size={24} /></div>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{recentAttempts.length}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Total Quizzes</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Recent mock tests completed.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Layers className="w-5 h-5 mr-2 text-primary" /> Recent Activity
          </h3>
          <Link to="/history" className="text-primary text-sm font-medium hover:underline flex items-center">
            View All <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        
        {recentAttempts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800">
              <Brain className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg">No quizzes taken yet.</p>
            <Link to="/setup" className="text-primary font-bold hover:underline mt-2 inline-block">Start your first quiz now!</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkcard divide-y divide-gray-100 dark:divide-gray-700">
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(attempt.finishedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {attempt.categoryName} <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-1 border border-gray-200 dark:border-gray-600 px-1.5 py-0.5 rounded capitalize">{attempt.difficulty}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">
                      {attempt.percent.toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${attempt.percent >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {attempt.percent >= 70 ? 'Pass' : 'Improve'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
