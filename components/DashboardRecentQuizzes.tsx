import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRecentQuizSummaries, getQuizAttemptDetails, QuizAttempt } from '../utils/saveQuizResult';
import { Eye, X, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardRecentQuizzes: React.FC = () => {
    const { currentUser } = useAuth();
    const [summaries, setSummaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
    const [viewingDetails, setViewingDetails] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const loadSummaries = async () => {
            if (currentUser) {
                try {
                    const data = await getRecentQuizSummaries(currentUser.uid, 20);
                    setSummaries(data);
                } catch (error) {
                    console.error('Error loading quiz summaries:', error);
                }
            }
            setLoading(false);
        };
        loadSummaries();
    }, [currentUser]);

    const handleViewDetails = async (attemptId: string) => {
        if (!currentUser) return;

        setLoadingDetails(true);
        setViewingDetails(true);

        try {
            const attempt = await getQuizAttemptDetails(currentUser.uid, attemptId);
            setSelectedAttempt(attempt);
        } catch (error) {
            console.error('Error loading attempt details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeDetails = () => {
        setViewingDetails(false);
        setSelectedAttempt(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (summaries.length === 0) {
        return (
            <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No quiz attempts yet</p>
                <a
                    href="/#/setup"
                    className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Start Your First Quiz
                </a>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Recent Quizzes</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs md:text-sm">Your last 20 quiz attempts</p>
                </div>

                {/* Horizontal scroll container for mobile - isolated to this section only */}
                <div className="overflow-x-auto scrollbar-thin max-w-full">
                    <table className="w-full min-w-[640px]">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Difficulty
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Percentage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {summaries.map((summary, index) => (
                                <tr key={summary.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {summary.categoryName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${summary.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            summary.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                summary.difficulty === 'hard' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            }`}>
                                            {summary.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                                        {summary.score}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-semibold ${summary.percent >= 80 ? 'text-green-600 dark:text-green-400' :
                                            summary.percent >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-red-600 dark:text-red-400'
                                            }`}>
                                            {summary.percent.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(summary.finishedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleViewDetails(summary.attemptId)}
                                            className="flex items-center text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium transition"
                                        >
                                            <Eye size={16} className="mr-1" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {viewingDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={closeDetails}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-darkcard rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {loadingDetails ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader className="animate-spin h-12 w-12 text-primary" />
                                </div>
                            ) : selectedAttempt ? (
                                <>
                                    {/* Header */}
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                Quiz Details
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {selectedAttempt.categoryName} - {selectedAttempt.difficulty}
                                            </p>
                                            <div className="flex gap-4 mt-3 text-sm">
                                                <span className="text-green-600 dark:text-green-400 font-semibold">
                                                    ✓ {selectedAttempt.correct} Correct
                                                </span>
                                                <span className="text-red-600 dark:text-red-400 font-semibold">
                                                    ✗ {selectedAttempt.wrong} Wrong
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400 font-semibold">
                                                    ○ {selectedAttempt.unattempted} Unattempted
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={closeDetails}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                        >
                                            <X size={24} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>

                                    {/* Questions List */}
                                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                                        <div className="space-y-6">
                                            {selectedAttempt.questions.map((question, index) => {
                                                const userAnswer = selectedAttempt.userAnswers[index];
                                                const isCorrect = userAnswer?.isCorrect;

                                                // Handle different data structures
                                                const qText = question.question;
                                                const options = (question as any).options || (question as any).all_answers || [];
                                                const correctAns = (question as any).correctAnswer || (question as any).correct_answer;

                                                return (
                                                    <div
                                                        key={(question as any).questionId || index}
                                                        className={`p-4 rounded-lg border-2 ${isCorrect
                                                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                            : userAnswer?.selectedOption
                                                                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                                                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                                                {index + 1}
                                                            </span>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900 dark:text-white" dangerouslySetInnerHTML={{ __html: qText }} />
                                                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                                    <Clock size={14} />
                                                                    <span>{userAnswer?.timeSpentSeconds || 0}s</span>
                                                                </div>
                                                            </div>
                                                            {isCorrect ? (
                                                                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={24} />
                                                            ) : userAnswer?.selectedOption ? (
                                                                <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex-shrink-0" />
                                                            )}
                                                        </div>

                                                        <div className="ml-11 space-y-2">
                                                            {options.map((option: string, optIndex: number) => {
                                                                const isUserAnswer = userAnswer?.selectedOption === option;
                                                                const isCorrectAnswer = correctAns === option;

                                                                return (
                                                                    <div
                                                                        key={optIndex}
                                                                        className={`p-3 rounded-lg ${isCorrectAnswer
                                                                            ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                                                            : isUserAnswer
                                                                                ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                                                                                : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-sm text-gray-900 dark:text-white" dangerouslySetInnerHTML={{ __html: option }} />
                                                                            {isCorrectAnswer && (
                                                                                <span className="text-xs font-semibold text-green-700 dark:text-green-300">✓ Correct</span>
                                                                            )}
                                                                            {isUserAnswer && !isCorrectAnswer && (
                                                                                <span className="text-xs font-semibold text-red-700 dark:text-red-300">Your Answer</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-gray-600 dark:text-gray-400">Failed to load quiz details</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DashboardRecentQuizzes;
