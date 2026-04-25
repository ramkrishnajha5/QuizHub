/**
 * All Users Page
 * Full data table with search, filter, sort, pagination, and user detail drawer
 */

import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import UserDetailDrawer from '../components/UserDetailDrawer';
import { getAllUsers, getUserQuizSummaries, AppUser } from '../utils/adminFirestore';
import { Search, Filter, ChevronLeft, ChevronRight, Users, Loader, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserRow extends AppUser {
  totalQuizzes: number;
  avgScore: number;
}

const AllUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'quizzes'>('date');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const perPage = 10;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      console.log("Users fetched:", allUsers.length);
      const enriched: UserRow[] = [];

      for (const u of allUsers) {
        const summaries = await getUserQuizSummaries(u.uid);
        const total = summaries.length;
        const avg = total > 0 ? summaries.reduce((acc, s) => acc + (s.percent || 0), 0) / total : 0;
        enriched.push({ ...u, totalQuizzes: total, avgScore: avg });
      }

      setUsers(enriched);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    let result = [...users];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === 'active') result = result.filter(u => !u.isBanned);
    if (statusFilter === 'banned') result = result.filter(u => u.isBanned);

    // Sort
    if (sortBy === 'name') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (sortBy === 'date') result.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
    if (sortBy === 'quizzes') result.sort((a, b) => b.totalQuizzes - a.totalQuizzes);

    return result;
  }, [users, search, statusFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openDrawer = (user: AppUser) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  return (
    <AdminLayout title="All Users">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
        >
          <option value="date">Sort: Join Date</option>
          <option value="name">Sort: Name</option>
          <option value="quizzes">Sort: Quiz Count</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-purple-500" size={40} /></div>
      ) : paged.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No users found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Email</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Quizzes</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Avg Score</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paged.map((user) => (
                  <tr
                    key={user.uid}
                    onClick={() => openDrawer(user)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(user.name || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">{user.email || '—'}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">{user.totalQuizzes}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold hidden sm:table-cell">
                      <span className={user.avgScore >= 70 ? 'text-green-600' : user.avgScore >= 40 ? 'text-yellow-600' : 'text-red-500'}>
                        {user.avgScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        user.isBanned
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); openDrawer(user); }}
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
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition"
                >
                  <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
                <span className="text-sm font-bold text-gray-900 dark:text-white px-3">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition"
                >
                  <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUserUpdated={loadUsers}
      />
    </AdminLayout>
  );
};

export default AllUsersPage;
