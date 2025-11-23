import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebase';
import { Link } from 'react-router-dom';
import { Play, Zap, BarChart2, Layers, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const [user, loading] = useAuthState(auth);

  // Loading state
  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-darkbg"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="bg-gray-50 dark:bg-darkbg min-h-[calc(100vh-4rem)] flex flex-col justify-center transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Master Your Knowledge with <span className="text-primary">QuizHub</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Smart, free mock tests for everyone. Challenge yourself with thousands of questions across various categories. Elevate your learning experience with our advanced analytics and distraction-free interface.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/setup" className="flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-primary hover:bg-blue-700 md:py-4 md:px-10 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <Play className="w-5 h-5 mr-2" />
              Start Quiz Now
            </Link>
            {!user && (
              <Link to="/login" className="flex items-center justify-center px-8 py-4 border border-gray-300 dark:border-gray-600 text-lg font-medium rounded-full text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:px-10 shadow-sm hover:shadow-md transition-all">
                Create Free Account
              </Link>
            )}
          </div>

          {/* Feature Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            <div className="bg-white dark:bg-darkcard p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-primary dark:text-blue-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Instant Feedback</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Get immediate results and detailed explanations for every question you answer. Learn as you go.</p>
            </div>
            <div className="bg-white dark:bg-darkcard p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="text-green-600 dark:text-green-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Visualize your improvement over time with comprehensive analytics charts and performance history.</p>
            </div>
            <div className="bg-white dark:bg-darkcard p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Layers className="text-purple-600 dark:text-purple-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Diverse Topics</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">From Science to Pop Culture, access a vast library of questions sourced from Open Trivia DB.</p>
            </div>
            <div className="bg-white dark:bg-darkcard p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="text-orange-600 dark:text-orange-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Mobile Optimized</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Designed for seamless performance on all devices. Practice on the go with offline support.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;