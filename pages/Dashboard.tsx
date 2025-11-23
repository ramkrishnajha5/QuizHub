import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../utils/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Play, History, Zap, BarChart2, ArrowRight, Award, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { getQuizState } from '../utils/idb';
import { QuizAttempt } from '../types';
import DashboardRecentQuizzes from '../components/DashboardRecentQuizzes';

const Dashboard: React.FC = () => {
    const [user, loading] = useAuthState(auth);
    const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
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
                        collection(db, `users/${user.uid}/attempts`),
                        orderBy('startedAt', 'desc'),
                        limit(5)
                    );
                    const querySnapshot = await getDocs(q);
                    const attempts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
                    setRecentAttempts(attempts);
                } catch (e) {
                    console.error("Could not fetch history (likely permissions or mock mode):", e);
                }
            };
            fetchHistory();
        }
    }, [user]);

    // Loading state
    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-darkbg"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    if (!user) {
        return (
            <div className="p-10 text-center text-gray-600 dark:text-gray-400">
                Please <Link to="/login" className="text-primary hover:underline">login</Link> to view your dashboard.
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 dark:text-white box-border">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.displayName?.split(' ')[0] || 'Scholar'}! 👋</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Ready to expand your horizons today?</p>
            </motion.div>

            {savedState && (
                <div className="mb-6 md:mb-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-3 sm:gap-0">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-indigo-900 dark:text-indigo-200">Resume Quiz</h3>
                        <p className="text-indigo-700 dark:text-indigo-300 text-xs md:text-sm mt-1">You have an unfinished {savedState.category || 'Mix'} quiz waiting for you.</p>
                    </div>
                    <button
                        onClick={() => navigate('/quiz')}
                        className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-md flex-shrink-0"
                    >
                        Continue
                    </button>
                </div>
            )}

            {/* Stats Cards - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-8 md:mb-10 w-full">
                {/* Start New Quiz Card */}
                <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm p-5 md:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/setup')}>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="p-2.5 md:p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full text-primary dark:text-blue-400 group-hover:scale-110 transition-transform"><Play size={22} /></div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Start New Quiz</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1.5 md:mt-2">Choose from 20+ categories and custom difficulties.</p>
                </div>

                {/* Best Score Card */}
                <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm p-5 md:p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="p-2.5 md:p-3 bg-green-50 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400"><Award size={22} /></div>
                        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{recentAttempts.length > 0 ? Math.max(...recentAttempts.map(a => a.percent)).toFixed(0) : 0}%</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Best Score</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1.5 md:mt-2">Your all-time high score across all quizzes.</p>
                </div>

                {/* Total Quizzes Card */}
                <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm p-5 md:p-6 border border-gray-100 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="p-2.5 md:p-3 bg-purple-50 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400"><History size={22} /></div>
                        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{recentAttempts.length}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Total Quizzes</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1.5 md:mt-2">Total mock tests completed to date.</p>
                </div>
            </div>

            {/* Recent Quizzes Component */}
            <div className="mb-6 md:mb-8 w-full min-w-0">
                <DashboardRecentQuizzes />
            </div>

            <div className="mt-6 md:mt-8 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 md:p-6 border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-primary dark:text-blue-200 flex-shrink-0">
                        <BookOpen size={18} className="md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Did you know?</h4>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Regular testing improves retention by 50% compared to just restudying. The "Testing Effect" is a proven psychological phenomenon that QuizHub helps you leverage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
