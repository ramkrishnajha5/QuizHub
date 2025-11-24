import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useQuiz } from '../contexts/QuizContext';

const LeaveQuizModal: React.FC = () => {
    const { showLeaveWarning, confirmLeave, cancelLeave } = useQuiz();

    return (
        <AnimatePresence>
            {showLeaveWarning && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={cancelLeave}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-darkcard rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                                Leave Quiz?
                            </h2>

                            {/* Message */}
                            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                                If you leave this page now, your current quiz progress will be lost and cannot be recovered.
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={cancelLeave}
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
                                >
                                    Stay on Quiz
                                </button>
                                <button
                                    onClick={confirmLeave}
                                    className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    Leave Anyway
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LeaveQuizModal;
