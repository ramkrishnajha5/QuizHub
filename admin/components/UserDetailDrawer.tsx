/**
 * User Detail Drawer
 * Slides in from the right showing user profile, quiz history, saved books, and admin actions
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, BookOpen, BarChart3, Shield, Clock, CheckCircle, XCircle, Ban, Loader, Trash2, Eye as EyeIcon, EyeOff as EyeOffIcon, Copy as CopyIcon, Check as CheckIcon } from 'lucide-react';
import { getUserQuizAttempts, getUserSavedBooks, banUser, unbanUser, QuizAttemptRecord, AppUser } from '../utils/adminFirestore';
import { logAdminAction } from '../utils/adminLogger';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import CustomModal from '../../components/CustomModal';
import { useCustomModal } from '../../hooks/useCustomModal';

interface UserDetailDrawerProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

type TabKey = 'profile' | 'quizzes' | 'books' | 'actions';

const UIDDisplay = ({ uid }: { uid: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<any>(null);
  const countRef = useRef<any>(null);

  const showUID = () => {
    setIsVisible(true);
    setCountdown(30);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      setCountdown(0);
    }, 30000);

    countRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const hideUID = () => {
    setIsVisible(false);
    setCountdown(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);
  };

  const copyUID = async () => {
    if (!isVisible) return;
    try {
      await navigator.clipboard.writeText(uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn('Failed to copy UID to clipboard');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countRef.current) clearInterval(countRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
        <code className="flex-1 text-xs font-mono truncate text-gray-900 dark:text-gray-300">
          {isVisible ? uid : "•".repeat(20)}
        </code>
        <button
          onClick={isVisible ? hideUID : showUID}
          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center gap-1 flex-shrink-0 transition-all font-bold"
          title={isVisible ? "Hide UID" : "Show UID"}
        >
          {isVisible ? (
            <><EyeOffIcon className="w-3.5 h-3.5" /> Hide</>
          ) : (
            <><EyeIcon className="w-3.5 h-3.5" /> Show</>
          )}
        </button>
        <button
          onClick={copyUID}
          disabled={!isVisible}
          className={`text-xs flex items-center gap-1 flex-shrink-0 transition-all px-2 py-1 rounded font-bold
            ${isVisible
              ? "text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer"
              : "text-gray-400 dark:text-gray-600 cursor-not-allowed"}`}
          title={isVisible ? "Copy UID" : "Show UID first to copy"}
        >
          {copied ? (
            <><CheckIcon className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
          ) : (
            <><CopyIcon className="w-3.5 h-3.5" /> Copy</>
          )}
        </button>
      </div>
      {isVisible && countdown > 0 && (
        <p className="text-[10px] text-yellow-600 dark:text-yellow-500 flex items-center gap-1 font-bold">
          <span className="text-yellow-500">⏱</span>
          Auto-hiding in {countdown}s
        </p>
      )}
    </div>
  );
};

const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ user, isOpen, onClose, onUserUpdated }) => {
  const { adminUser, adminRole } = useAdminAuth();
  const { modalState, showAlert, closeModal } = useCustomModal();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptRecord[]>([]);
  const [savedBooks, setSavedBooks] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);
  const [unbanning, setUnbanning] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setActiveTab('profile');
      setQuizAttempts([]);
      setSavedBooks([]);
      setBanReason('');
    }
  }, [user, isOpen]);

  const loadQuizHistory = async () => {
    if (!user || quizAttempts.length > 0) return;
    setLoadingQuizzes(true);
    try {
      const attempts = await getUserQuizAttempts(user.uid);
      setQuizAttempts(attempts);
    } catch (error) {
      console.error('Error loading quiz history:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const loadSavedBooks = async () => {
    if (!user || savedBooks.length > 0) return;
    setLoadingBooks(true);
    try {
      const books = await getUserSavedBooks(user.uid);
      setSavedBooks(books);
    } catch (error) {
      console.error('Error loading saved books:', error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === 'quizzes') loadQuizHistory();
    if (tab === 'books') loadSavedBooks();
  };

  const handleBan = async () => {
    if (!user || !adminUser || !banReason.trim()) return;
    setBanning(true);
    try {
      await banUser(user.uid, user.email || '', banReason.trim(), adminUser.uid, user.name);
      await logAdminAction({
        action: 'USER_BANNED',
        performedBy: adminUser.uid,
        performedByEmail: adminUser.email || '',
        targetUid: user.uid,
        targetEmail: user.email || '',
        details: `Reason: ${banReason.trim()}`,
      });
      setBanReason('');
      onUserUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error banning user:', error);
      showAlert({ title: 'Error', message: 'Failed to ban user', confirmStyle: 'danger' });
    } finally {
      setBanning(false);
    }
  };

  const handleUnban = async () => {
    if (!user || !adminUser) return;
    setUnbanning(true);
    try {
      await unbanUser(user.uid);
      await logAdminAction({
        action: 'USER_UNBANNED',
        performedBy: adminUser.uid,
        performedByEmail: adminUser.email || '',
        targetUid: user.uid,
        targetEmail: user.email || '',
        details: `User unbanned: ${user.email}`,
      });
      onUserUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error unbanning user:', error);
      showAlert({ title: 'Error', message: 'Failed to unban user', confirmStyle: 'danger' });
    } finally {
      setUnbanning(false);
    }
  };

  if (!user) return null;

  const tabs = [
    { key: 'profile' as TabKey, label: 'Profile', icon: User },
    { key: 'quizzes' as TabKey, label: 'Quizzes', icon: BarChart3 },
    { key: 'books' as TabKey, label: 'Books', icon: BookOpen },
    { key: 'actions' as TabKey, label: 'Actions', icon: Shield },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-modal-overlay"
            onClick={onClose}
          >
            {/* Drawer -> Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-modal-box bg-white dark:bg-gray-800 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-white">User Details</h2>
                  <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/50">
                    <User size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{user.name || 'Unknown'}</h3>
                    <p className="text-white/80 text-sm">{user.email || '—'}</p>
                    {user.isBanned && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">BANNED</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition border-b-2 ${
                      activeTab === tab.key
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-4">
                    {[
                      { label: 'UID', value: user.uid },
                      { label: 'Email', value: user.email || '—' },
                      { label: 'Name', value: user.name || '—' },
                      { label: 'Phone', value: user.phone || '—' },
                      { label: 'Date of Birth', value: user.dob || '—' },
                      { label: 'Status', value: user.isBanned ? '🚫 Banned' : '✅ Active' },
                    ].map((field) => (
                      <div key={field.label} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{field.label}</p>
                        {field.label === 'UID' ? (
                          <UIDDisplay uid={field.value} />
                        ) : (
                          <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">{field.value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quiz History Tab */}
                {activeTab === 'quizzes' && (
                  <div>
                    {loadingQuizzes ? (
                      <div className="flex justify-center py-12"><Loader className="animate-spin text-purple-500" size={32} /></div>
                    ) : quizAttempts.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-12">No quiz attempts</p>
                    ) : (
                      <div className="space-y-3">
                        {quizAttempts.map((attempt) => (
                          <div key={attempt.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setExpandedAttempt(expandedAttempt === attempt.id ? null : attempt.id)}
                              className="w-full p-4 text-left flex items-center justify-between"
                            >
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">
                                  {attempt.categoryName || attempt.category || 'Quiz'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Score: {attempt.correct}/{attempt.totalQuestions || attempt.questionCount} • {attempt.percent?.toFixed(1)}%
                                </p>
                              </div>
                              <div className="text-xs text-gray-400">
                                {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleDateString() : '—'}
                              </div>
                            </button>

                            {/* Expanded Question Breakdown */}
                            <AnimatePresence>
                              {expandedAttempt === attempt.id && attempt.questions && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-gray-200 dark:border-gray-600"
                                >
                                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                                    {attempt.questions.map((q: any, qi: number) => {
                                      const ua = attempt.userAnswers?.[qi];
                                      const correctAns = q.correctAnswer || q.correct_answer;
                                      const userAns = ua?.selectedOption || ua?.selectedAnswer;
                                      const isCorrect = userAns === correctAns;

                                      return (
                                        <div key={qi} className={`p-3 rounded-lg border-l-4 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : userAns ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 bg-gray-100 dark:bg-gray-800'}`}>
                                          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1" dangerouslySetInnerHTML={{ __html: q.question || q.questionText || `Question ${qi + 1}` }} />
                                          <p className="text-xs text-green-600 dark:text-green-400">Correct: {correctAns}</p>
                                          {userAns && !isCorrect && (
                                            <p className="text-xs text-red-600 dark:text-red-400">User answered: {userAns}</p>
                                          )}
                                          {!userAns && <p className="text-xs text-gray-500">Unattempted</p>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Saved Books Tab */}
                {activeTab === 'books' && (
                  <div>
                    {loadingBooks ? (
                      <div className="flex justify-center py-12"><Loader className="animate-spin text-purple-500" size={32} /></div>
                    ) : savedBooks.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-12">No saved books</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {savedBooks.map((book) => (
                          <div key={book.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
                            {book.thumbnail && (
                              <img src={book.thumbnail} alt={book.title} className="w-full h-32 object-cover" />
                            )}
                            <div className="p-3">
                              <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2">{book.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                {book.authors?.join(', ') || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Tab */}
                {activeTab === 'actions' && (
                  <div className="space-y-6">
                    {/* Ban / Unban */}
                    {user.isBanned ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
                        <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Unban User</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                          This will restore the user's access to QuizHub.
                        </p>
                        <button
                          onClick={handleUnban}
                          disabled={unbanning}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
                        >
                          {unbanning ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                          {unbanning ? 'Unbanning...' : 'Unban User'}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                        <h4 className="font-bold text-red-900 dark:text-red-200 mb-3 flex items-center gap-2">
                          <Ban size={18} /> Ban User
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                          Banning will immediately prevent this user from logging in.
                        </p>
                        <textarea
                          placeholder="Reason for ban (required)..."
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-800 rounded-xl text-sm text-gray-900 dark:text-white mb-4 resize-none"
                          rows={3}
                        />
                        <button
                          onClick={handleBan}
                          disabled={banning || !banReason.trim()}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
                        >
                          {banning ? <Loader className="animate-spin" size={16} /> : <Ban size={16} />}
                          {banning ? 'Banning...' : 'Ban User'}
                        </button>
                      </div>
                    )}

                    {/* Delete Account (superadmin only) */}
                    {adminRole === 'superadmin' && (
                      <div className="bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-2xl p-6">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Trash2 size={18} /> Delete Account
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Permanently delete this user's data. This action cannot be undone.
                        </p>
                        <button
                          onClick={() => showAlert({ title: 'Server-Side Only', message: 'Account deletion requires Firebase Admin SDK and is only available via server-side functions.', confirmStyle: 'primary' })}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-800 dark:bg-gray-600 text-white font-bold rounded-xl shadow-lg"
                        >
                          <Trash2 size={16} /> Delete Account
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <CustomModal {...modalState} onClose={closeModal} />
    </>
  );
};

export default UserDetailDrawer;
