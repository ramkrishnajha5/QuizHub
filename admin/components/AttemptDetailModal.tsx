/**
 * Attempt Detail Modal
 * Shows per-question breakdown for a quiz attempt
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AttemptDetailModalProps {
  attempt: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const AttemptDetailModal: React.FC<AttemptDetailModalProps> = ({ attempt, isOpen, onClose }) => {
  if (!attempt) return null;

  const questions = attempt.questions || [];
  const userAnswers = attempt.userAnswers || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="admin-modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="admin-modal-box bg-white dark:bg-gray-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-black text-white">Quiz Attempt Details</h2>
                <p className="text-white/80 text-sm">
                  {attempt.categoryName || attempt.category || 'Quiz'} • Score: {attempt.correct || 0}/{attempt.totalQuestions || questions.length} ({attempt.percent?.toFixed(1) || 0}%)
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition">
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="flex gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0 flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-green-500" />
                <span className="font-bold text-green-600">{attempt.correct || 0} Correct</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <XCircle size={16} className="text-red-500" />
                <span className="font-bold text-red-600">{attempt.wrong || 0} Wrong</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-gray-400" />
                <span className="font-bold text-gray-500">{attempt.unattempted || 0} Skipped</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-blue-500" />
                <span className="font-bold text-blue-600">{attempt.durationSeconds ? (attempt.durationSeconds / 60).toFixed(1) : '—'} min</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {questions.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">No question data available for this attempt</p>
              ) : (
                questions.map((q: any, idx: number) => {
                  const ua = userAnswers[idx];
                  const correctAns = q.correctAnswer || q.correct_answer;
                  const userAns = ua?.selectedOption || ua?.selectedAnswer;
                  const isCorrect = userAns === correctAns;
                  const options = q.options || q.all_answers || [];
                  const timeSpent = ua?.timeSpentSeconds || ua?.timeSpent || 0;

                  return (
                    <div
                      key={idx}
                      className={`bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border-l-4 ${
                        isCorrect ? 'border-green-500' : userAns ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400">Question {idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {timeSpent}s
                          </span>
                          {isCorrect && <CheckCircle size={18} className="text-green-500" />}
                          {!isCorrect && userAns && <XCircle size={18} className="text-red-500" />}
                          {!userAns && <AlertCircle size={18} className="text-gray-400" />}
                        </div>
                      </div>

                      <h4
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-4"
                        dangerouslySetInnerHTML={{ __html: q.question || q.questionText || 'Question text missing' }}
                      />

                      <div className="grid gap-2">
                        {options.map((opt: string, optIdx: number) => {
                          const isThisCorrect = opt === correctAns || optIdx === q.correctOption;
                          const isUserSelected = opt === userAns;

                          let bgClass = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600';
                          if (isThisCorrect) bgClass = 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700';
                          else if (isUserSelected) bgClass = 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700';

                          return (
                            <div key={optIdx} className={`flex items-center justify-between p-3 rounded-xl border ${bgClass}`}>
                              <span className="text-sm text-gray-900 dark:text-white" dangerouslySetInnerHTML={{ __html: opt }} />
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isThisCorrect && <CheckCircle size={14} className="text-green-600" />}
                                {isUserSelected && !isThisCorrect && <XCircle size={14} className="text-red-600" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttemptDetailModal;
