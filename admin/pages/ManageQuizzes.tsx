/**
 * Manage Quizzes Page
 * Table of all admin-uploaded quizzes with edit, publish/unpublish, preview, delete
 */

import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllAdminQuizzes, updateAdminQuiz, deleteAdminQuiz, AdminQuiz } from '../utils/adminFirestore';
import { logAdminAction } from '../utils/adminLogger';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, FileText, Loader, Eye, Edit as PencilIcon, Trash2 as TrashIcon, CheckCircle, Check as CheckIcon, Save as SaveIcon, Loader as SpinnerIcon, X } from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import CustomModal from '../../components/CustomModal';
import { useCustomModal } from '../../hooks/useCustomModal';

const ManageQuizzes: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const { modalState, showAlert, showConfirm, closeModal } = useCustomModal();
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [page, setPage] = useState(1);
  const [previewQuiz, setPreviewQuiz] = useState<AdminQuiz | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const perPage = 10;

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await getAllAdminQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuizzes(); }, []);

  const filtered = useMemo(() => {
    let result = [...quizzes];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(quiz => quiz.title.toLowerCase().includes(q) || quiz.category.toLowerCase().includes(q));
    }
    if (statusFilter === 'published') result = result.filter(q => q.isPublished);
    if (statusFilter === 'draft') result = result.filter(q => !q.isPublished);
    return result;
  }, [quizzes, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleTogglePublish = async (quiz: AdminQuiz) => {
    try {
      await updateAdminQuiz(quiz.quizId, { isPublished: !quiz.isPublished });
      await logAdminAction({
        action: quiz.isPublished ? 'QUIZ_UNPUBLISHED' : 'QUIZ_PUBLISHED',
        performedBy: adminUser?.uid || '',
        performedByEmail: adminUser?.email || '',
        details: `Quiz "${quiz.title}" ${quiz.isPublished ? 'unpublished' : 'published'}`,
      });
      loadQuizzes();
    } catch (error) {
      showAlert({ title: 'Error', message: 'Failed to update quiz', confirmStyle: 'danger' });
    }
  };

  const handleDelete = async (quiz: AdminQuiz) => {
    showConfirm({
      title: 'Delete Quiz',
      message: `Delete quiz "${quiz.title}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmStyle: 'danger',
      onConfirm: async () => {
        try {
          await deleteAdminQuiz(quiz.quizId);
          await logAdminAction({
            action: 'QUIZ_DELETED',
            performedBy: adminUser?.uid || '',
            performedByEmail: adminUser?.email || '',
            details: `Quiz "${quiz.title}" deleted`,
          });
          loadQuizzes();
        } catch (error) {
          showAlert({ title: 'Error', message: 'Failed to delete quiz', confirmStyle: 'danger' });
        }
      },
    });
  };

  const openEditModal = async (quiz: AdminQuiz) => {
    try {
      const snap = await getDoc(doc(db, "adminQuizzes", quiz.quizId));
      if (snap.exists()) {
        setEditData({ id: snap.id, ...snap.data() });
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching quiz to edit:', error);
      showAlert({ title: 'Error', message: 'Failed to load quiz details', confirmStyle: 'danger' });
    }
  };

  const openPreviewModal = async (quiz: AdminQuiz) => {
    try {
      setPreviewLoading(true);
      const snap = await getDoc(doc(db, "adminQuizzes", quiz.quizId));
      if (!snap.exists()) {
        showAlert({ title: 'Not Found', message: 'Quiz not found', confirmStyle: 'danger' });
        return;
      }
      setPreviewQuiz({ quizId: snap.id, ...snap.data() } as AdminQuiz);
      setShowPreviewModal(true);
    } catch (err: any) {
      showAlert({ title: 'Error', message: 'Failed to load preview: ' + err.message, confirmStyle: 'danger' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const addNewQuestion = () => {
    setEditData((prev: any) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctOption: 0,
          explanation: "",
        }
      ]
    }));
  };

  const removeQuestion = (index: number) => {
    if (editData.questions.length <= 1) return;
    setEditData((prev: any) => ({
      ...prev,
      questions: prev.questions.filter((_: any, i: number) => i !== index)
    }));
  };

  const updateQuestion = (qIndex: number, field: string, value: any) => {
    setEditData((prev: any) => {
      const updated = [...prev.questions];
      updated[qIndex] = { ...updated[qIndex], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  const updateOption = (qIndex: number, optIdx: number, value: string) => {
    setEditData((prev: any) => {
      const updated = [...prev.questions];
      const opts = [...updated[qIndex].options];
      opts[optIdx] = value;
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return { ...prev, questions: updated };
    });
  };

  const saveQuizChanges = async () => {
    if (!editData.title?.trim()) { setEditError("Quiz title is required"); return; }
    if (!editData.category?.trim()) { setEditError("Category is required"); return; }
    if (editData.questions.length < 1) { setEditError("At least 1 question required"); return; }
    
    for (let i = 0; i < editData.questions.length; i++) {
      const q = editData.questions[i];
      if (!q.questionText?.trim()) { setEditError(`Question ${i + 1}: text cannot be empty`); return; }
      if (q.options.some((o: string) => !o?.trim())) { setEditError(`Question ${i + 1}: all 4 options required`); return; }
      if (q.correctOption === undefined || q.correctOption === null) { setEditError(`Question ${i + 1}: select correct answer`); return; }
    }

    try {
      setSaving(true);
      const updatedQuiz = {
        title: editData.title.trim(),
        category: editData.category.trim(),
        difficulty: editData.difficulty || "medium",
        timeLimitMinutes: Number(editData.timeLimitMinutes) || 10,
        negativeMarking: editData.negativeMarking === true,
        totalQuestions: editData.questions.length,
        updatedAt: serverTimestamp(),
        questions: editData.questions.map((q: any, i: number) => ({
          questionId: i + 1,
          questionText: q.questionText.trim(),
          options: q.options.map((o: string) => o.trim()),
          correctOption: Number(q.correctOption),
          explanation: q.explanation?.trim() || "",
        }))
      };

      await updateDoc(doc(db, "adminQuizzes", editData.id), updatedQuiz);
      
      await logAdminAction({
        action: 'QUIZ_UPDATED',
        targetUid: editData.id,
        performedBy: adminUser?.uid || '',
        performedByEmail: adminUser?.email || '',
        details: `Quiz "${updatedQuiz.title}" edited`
      });

      setQuizzes(prev => prev.map(q => q.quizId === editData.id ? { ...q, ...updatedQuiz } as AdminQuiz : q));
      setShowEditModal(false);
      setEditData(null);
      setEditError("");
      showAlert({ title: 'Success', message: 'Quiz updated successfully!', confirmStyle: 'success' });
    } catch (err: any) {
      console.error("Save error:", err);
      setEditError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <AdminLayout title="Manage Quizzes">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by title or category..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium">
          <option value="all">All Quizzes</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-purple-500" size={40} /></div>
      ) : paged.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No quizzes found</h3>
          <p className="text-gray-500 dark:text-gray-400">Create your first quiz from the Upload page</p>
        </motion.div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Category</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Difficulty</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Qs</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paged.map((quiz) => (
                  <tr key={quiz.quizId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white text-sm">{quiz.title}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">{quiz.category}</td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : quiz.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      } capitalize`}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">{quiz.totalQuestions}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        quiz.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => handleTogglePublish(quiz)}
                            disabled={loading}
                            className={`
                              relative inline-flex items-center w-10 h-5 rounded-full
                              transition-all duration-300 ease-in-out focus:outline-none
                              ${quiz.isPublished
                                ? "bg-green-500 shadow-sm shadow-green-400/40"
                                : "bg-gray-400 dark:bg-gray-600"}
                            `}
                            title={quiz.isPublished ? "Published — click to unpublish" : "Draft — click to publish"}
                          >
                            <span className={`
                              inline-block w-3.5 h-3.5 bg-white rounded-full shadow
                              transform transition-transform duration-300
                              ${quiz.isPublished ? "translate-x-5" : "translate-x-0.5"}
                            `} />
                          </button>
                          <span className={`text-[10px] font-medium mt-0.5 ${quiz.isPublished ? "text-green-500" : "text-gray-400"}`}>
                            {quiz.isPublished ? "Live" : "Draft"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(quiz)}
                            className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg
                              hover:bg-blue-500/10 transition-all"
                            title="Edit Quiz"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => openPreviewModal(quiz)} className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition" title="Preview">
                            {previewLoading && previewQuiz?.quizId === quiz.quizId ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <Eye size={18} />}
                          </button>
                          <button onClick={() => handleDelete(quiz)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition" title="Delete">
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"><ChevronLeft size={18} /></button>
                <span className="text-sm font-bold text-gray-900 dark:text-white px-3">{page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewQuiz && (
        <div className="admin-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div
            className="admin-modal-box max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{previewQuiz.title}</h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{previewQuiz.category}</span>
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 capitalize">{previewQuiz.difficulty}</span>
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    {previewQuiz.questions?.length || 0} Questions
                  </span>
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">⏱ {previewQuiz.timeLimitMinutes} min</span>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${previewQuiz.negativeMarking
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                    {previewQuiz.negativeMarking ? "⚠ Negative Marking" : "✅ No Negative Marking"}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!previewQuiz.questions || previewQuiz.questions.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                No questions found in this quiz.
              </div>
            ) : (
              previewQuiz.questions.map((q: any, index: number) => (
                <div key={index} className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="font-medium mb-3 text-gray-900 dark:text-white">
                    <span className="text-purple-600 dark:text-purple-400 mr-2 font-bold">Q{index + 1}.</span>
                    {q.questionText}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((option: string, optIdx: number) => (
                      <div key={optIdx} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm border
                          ${q.correctOption === optIdx
                            ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-500/50 text-green-800 dark:text-green-300 font-medium"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${q.correctOption === optIdx
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                          {["A","B","C","D"][optIdx]}
                        </span>
                        {option}
                        {q.correctOption === optIdx && (
                          <span className="ml-auto text-green-600 dark:text-green-400 text-xs font-semibold">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="mt-3 text-xs text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-900/50">
                      💡 <span className="font-semibold">Explanation:</span> {q.explanation}
                    </p>
                  )}
                </div>
              ))
            )}

            <div className="mt-6 text-center">
              <button onClick={() => setShowPreviewModal(false)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-semibold transition-all">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Quiz Modal */}
      <AnimatePresence>
        {showEditModal && editData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-modal-overlay" onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="admin-modal-box bg-white dark:bg-gray-800 shadow-2xl flex flex-col w-full max-w-3xl overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><PencilIcon className="w-5 h-5" /> Edit Quiz</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
                {editError && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{editError}</div>}

                {/* Section 1 - Quiz Details */}
                <div className="glass-card p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                  <h3 className="text-sm font-bold text-purple-600 mb-4 uppercase">Section 1 — Quiz Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                      <input type="text" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-2.5 text-sm border focus:border-purple-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                      <input type="text" value={editData.category} onChange={(e) => setEditData({...editData, category: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-2.5 text-sm border focus:border-purple-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Difficulty</label>
                      <select value={editData.difficulty} onChange={(e) => setEditData({...editData, difficulty: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-2.5 text-sm border focus:border-purple-400 outline-none">
                        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Time Limit (mins)</label>
                      <input type="number" min="1" value={editData.timeLimitMinutes} onChange={(e) => setEditData({...editData, timeLimitMinutes: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-2.5 text-sm border focus:border-purple-400 outline-none" />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <button type="button" onClick={() => setEditData({...editData, negativeMarking: !editData.negativeMarking})} className={`relative inline-flex items-center w-10 h-5 rounded-full transition-all duration-300 ease-in-out ${editData.negativeMarking ? "bg-purple-600" : "bg-gray-400"}`}>
                        <span className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transform transition-transform duration-300 ${editData.negativeMarking ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Negative Marking: {editData.negativeMarking ? <span className="text-red-500 font-bold">+1 correct, -0.25 wrong</span> : <span className="text-green-500 font-bold">+1 correct, 0 wrong</span>}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2 - Questions */}
                <div className="p-1">
                  <h3 className="text-sm font-bold text-purple-600 mb-4 uppercase">Section 2 — Questions</h3>
                  {editData.questions.map((q: any, index: number) => (
                    <div key={index} className="glass-card p-4 rounded-xl mb-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm relative">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-black text-purple-500">Question {index + 1}</span>
                        <button onClick={() => removeQuestion(index)} disabled={editData.questions.length <= 1} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed">
                          <TrashIcon className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                      <textarea value={q.questionText} onChange={(e) => updateQuestion(index, "questionText", e.target.value)} placeholder="Enter question..." rows={2} className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm mb-3 border focus:border-purple-400 resize-none outline-none dark:text-white" />

                      {["A", "B", "C", "D"].map((label, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-gray-400 w-5">{label}</span>
                          <input type="text" value={q.options[optIdx]} onChange={(e) => updateOption(index, optIdx, e.target.value)} placeholder={`Option ${label}`} className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-2.5 text-sm border focus:border-purple-400 outline-none dark:text-white" />
                          <button onClick={() => updateQuestion(index, "correctOption", optIdx)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${q.correctOption === optIdx ? "border-green-500 bg-green-500" : "border-gray-300 dark:border-gray-600 hover:border-green-400"}`} title={`Mark option ${label} as correct`}>
                            {q.correctOption === optIdx && <CheckIcon className="w-4 h-4 text-white" />}
                          </button>
                        </div>
                      ))}
                      <p className="text-[10px] text-gray-500 mt-2 mb-3 ml-8">Click the circle button to mark the correct answer</p>

                      <input type="text" value={q.explanation || ""} onChange={(e) => updateQuestion(index, "explanation", e.target.value)} placeholder="Explanation (optional)" className="w-full bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-2.5 text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900 focus:border-blue-400 outline-none" />
                    </div>
                  ))}

                  <button onClick={addNewQuestion} className="w-full py-3 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-bold text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                    + Add New Question
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
                <button onClick={() => setShowEditModal(false)} className="px-5 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={saveQuizChanges} disabled={saving} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><SpinnerIcon className="w-4 h-4 animate-spin" /> Saving...</> : <><SaveIcon className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
    <CustomModal {...modalState} onClose={closeModal} />
    </>
  );
};

export default ManageQuizzes;
