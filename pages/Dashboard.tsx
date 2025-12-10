import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../utils/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Play, Award, TrendingUp, Sparkles, ChevronRight, BookOpen, Zap } from 'lucide-react';
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
            if (saved && saved.status === 'active') setSavedState(saved);
        };
        checkResume();

        if (user) {
            const fetchHistory = async () => {
                try {
                    const q = query(collection(db, `users/${user.uid}/attempts`), orderBy('startedAt', 'desc'), limit(5));
                    const querySnapshot = await getDocs(q);
                    setRecentAttempts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt)));
                } catch (e) {
                    console.error("Could not fetch history:", e);
                }
            };
            fetchHistory();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
                <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl">
                    <Sparkles className="w-16 h-16 mx-auto mb-6 text-purple-500" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please Login</p>
                    <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">Go to Login</Link>
                </div>
            </div>
        );
    }

    const stats = [
        { icon: Play, title: "Start Quiz", description: "Begin a new challenge", gradient: "from-blue-400 to-cyan-500", action: () => navigate('/setup') },
        { icon: Award, title: "Best Score", value: recentAttempts.length > 0 ? Math.max(...recentAttempts.map(a => a.percent)).toFixed(0) + '%' : '0%', description: "Your top performance", gradient: "from-yellow-400 to-orange-500" },
        { icon: TrendingUp, title: "Total Quizzes", value: recentAttempts.length.toString(), description: "Tests completed", gradient: "from-green-400 to-emerald-500" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 20, repeat: Infinity }} className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 25, repeat: Infinity }} className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-3">
                        Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{user.displayName?.split(' ')[0] || 'Scholar'}</span>! 👋
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">Ready to learn something new today?</p>
                </motion.div>

                {/* Resume Banner */}
                {savedState && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 opacity-20"><div style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '20px 20px' }} className="absolute inset-0" /></div>
                        <div className="relative flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Zap className="w-12 h-12 text-white" />
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-1">Resume Quiz</h3>
                                    <p className="text-white/90">Continue your {savedState.category || 'Mix'} quiz</p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/quiz')} className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold shadow-xl hover:shadow-2xl transition flex items-center gap-2">
                                Continue <ChevronRight />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={stat.action}
                            className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl ${stat.action ? 'cursor-pointer' : ''}`}
                        >
                            <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                                <stat.icon className="w-8 h-8 text-white" />
                            </div>
                            {stat.value && <div className={`text-5xl font-black mb-2 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</div>}
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{stat.description}</p>
                            {stat.action && <div className="mt-4 text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2">Get Started <ChevronRight className="w-4 h-4" /></div>}
                        </motion.div>
                    ))}
                </div>

                {/* Recent Quizzes */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8">
                    <DashboardRecentQuizzes />
                </motion.div>

                {/* Tip */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="flex items-start gap-4">
                        <BookOpen className="w-10 h-10 flex-shrink-0" />
                        <div>
                            <h4 className="text-2xl font-black mb-2">💡 Did you know?</h4>
                            <p className="text-white/90 text-lg">Regular testing improves retention by <span className="font-bold">50%</span> compared to just restudying!</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
