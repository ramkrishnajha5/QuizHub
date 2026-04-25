/**
 * Quiz Attempts Page
 * All quiz attempts across all users with search, filter, sort, pagination, detail modal, CSV export
 */

import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import AttemptDetailModal from '../components/AttemptDetailModal';
import { getAllQuizAttempts, QuizAttemptRecord } from '../utils/adminFirestore';
import { exportToCSV } from '../utils/exportCSV';
import { Search, Download, ChevronLeft, ChevronRight, BarChart3, Loader, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const QuizAttemptsPage: React.FC = () => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'accuracy'>('date');
  const [page, setPage] = useState(1);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const perPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllQuizAttempts();
        console.log("Attempts fetched:", data.length);
        setAttempts(data);
      } catch (error) {
        console.error('Error loading attempts:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>();
    attempts.forEach(a => {
      if (a.categoryName) cats.add(a.categoryName);
      else if (a.category) cats.add(a.category);
    });
    return Array.from(cats).sort();
  }, [attempts]);

  const filtered = useMemo(() => {
    let result = [...attempts];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        (a.userName || '').toLowerCase().includes(q) ||
        (a.userEmail || '').toLowerCase().includes(q) ||
        (a.categoryName || a.category || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(a => (a.categoryName || a.category) === categoryFilter);
    }

    // Sort
    if (sortBy === 'date') result.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
    if (sortBy === 'score') result.sort((a, b) => (b.correct || 0) - (a.correct || 0));
    if (sortBy === 'accuracy') result.sort((a, b) => (b.percent || 0) - (a.percent || 0));

    return result;
  }, [attempts, search, categoryFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleExport = () => {
    const exportData = filtered.map(a => ({
      UserName: a.userName || '',
      UserEmail: a.userEmail || '',
      Category: a.categoryName || a.category || '',
      Score: a.correct || 0,
      TotalQuestions: a.totalQuestions || a.questionCount || 0,
      Accuracy: (a.percent || 0).toFixed(1) + '%',
      TimeTaken: a.durationSeconds ? (a.durationSeconds / 60).toFixed(1) + ' min' : '—',
      Date: a.finishedAt ? new Date(a.finishedAt).toLocaleDateString() : '—',
    }));
    exportToCSV(exportData, 'quiz_attempts');
  };

  return (
    <AdminLayout title="Quiz Attempts">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user name, email, or category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
        >
          <option value="date">Sort: Date</option>
          <option value="score">Sort: Score</option>
          <option value="accuracy">Sort: Accuracy</option>
        </select>
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-purple-500" size={40} /></div>
      ) : paged.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No quiz attempts found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">User</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Category</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Score</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Accuracy</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Time</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Date</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paged.map((a, idx) => (
                  <tr key={a.id + '-' + idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[150px]">{a.userName || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{a.userEmail || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                      {a.categoryName || a.category || '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {a.correct || 0}/{a.totalQuestions || a.questionCount || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${
                        (a.percent || 0) >= 70 ? 'text-green-600' : (a.percent || 0) >= 40 ? 'text-yellow-600' : 'text-red-500'
                      }`}>
                        {(a.percent || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                      {a.durationSeconds ? (a.durationSeconds / 60).toFixed(1) + 'm' : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {a.finishedAt ? new Date(a.finishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setSelectedAttempt(a); setModalOpen(true); }}
                        className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-bold text-gray-900 dark:text-white px-3">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AttemptDetailModal attempt={selectedAttempt} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </AdminLayout>
  );
};

export default QuizAttemptsPage;
