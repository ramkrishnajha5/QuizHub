/**
 * Banned Users Page
 * Table of all banned users with unban and view profile actions
 */

import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import UserDetailDrawer from '../components/UserDetailDrawer';
import { getAllBannedUsers, unbanUser, UserBan, getUserById, AppUser } from '../utils/adminFirestore';
import { logAdminAction } from '../utils/adminLogger';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Search, ChevronLeft, ChevronRight, Ban, Loader, Eye, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomModal from '../../components/CustomModal';
import { useCustomModal } from '../../hooks/useCustomModal';

const BannedUsers: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const { modalState, showAlert, showConfirm, closeModal } = useCustomModal();
  const [bans, setBans] = useState<UserBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [unbanning, setUnbanning] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const perPage = 10;

  const loadBans = async () => {
    setLoading(true);
    try {
      const data = await getAllBannedUsers();
      setBans(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBans(); }, []);

  const filtered = useMemo(() => {
    if (!search) return bans;
    const q = search.toLowerCase();
    return bans.filter(b =>
      (b.userName || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.reason || '').toLowerCase().includes(q)
    );
  }, [bans, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleUnban = async (ban: UserBan) => {
    showConfirm({
      title: 'Unban User',
      message: `Are you sure you want to unban ${ban.email}?`,
      confirmText: 'Unban',
      cancelText: 'Cancel',
      confirmStyle: 'success',
      onConfirm: async () => {
        setUnbanning(ban.uid);
        try {
          await unbanUser(ban.uid);
          await logAdminAction({
            action: 'USER_UNBANNED',
            performedBy: adminUser?.uid || '',
            performedByEmail: adminUser?.email || '',
            targetUid: ban.uid,
            targetEmail: ban.email,
            details: `User ${ban.email} unbanned`,
          });
          loadBans();
        } catch (error) {
          showAlert({ title: 'Error', message: 'Failed to unban user', confirmStyle: 'danger' });
        } finally {
          setUnbanning(null);
        }
      },
    });
  };

  const handleViewProfile = async (uid: string) => {
    const user = await getUserById(uid);
    if (user) {
      setSelectedUser(user);
      setDrawerOpen(true);
    }
  };

  return (
    <>
    <AdminLayout title="Banned Users">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search banned users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-purple-500" size={40} /></div>
      ) : paged.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Ban className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No banned users</h3>
          <p className="text-gray-500 dark:text-gray-400">All users are in good standing</p>
        </motion.div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">User</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Reason</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Banned Date</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paged.map((ban) => (
                  <tr key={ban.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{ban.userName || ban.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{ban.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell max-w-xs truncate">{ban.reason}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {ban.bannedAt?.seconds ? new Date(ban.bannedAt.seconds * 1000).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleViewProfile(ban.uid)} className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition" title="View Profile">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleUnban(ban)}
                          disabled={unbanning === ban.uid}
                          className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-lg shadow disabled:opacity-50 transition"
                        >
                          {unbanning === ban.uid ? <Loader className="animate-spin" size={14} /> : <Unlock size={14} />}
                          Unban
                        </button>
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
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={18} /></button>
                <span className="text-sm font-bold text-gray-900 dark:text-white px-3">{page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      <UserDetailDrawer user={selectedUser} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onUserUpdated={loadBans} />
    </AdminLayout>
    <CustomModal {...modalState} onClose={closeModal} />
    </>
  );
};

export default BannedUsers;
