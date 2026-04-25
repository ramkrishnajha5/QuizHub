/**
 * Activity Logs Page
 * Read-only table of all admin actions from adminLogs
 */

import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAdminLogs, AdminLog } from '../utils/adminFirestore';
import { Search, ScrollText, Loader, Filter, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const ACTION_COLORS: Record<string, string> = {
  ADMIN_LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  USER_BANNED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  USER_UNBANNED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  USER_DELETED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  QUIZ_CREATED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  QUIZ_UPDATED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  QUIZ_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  QUIZ_PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  QUIZ_UNPUBLISHED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  ADMIN_ADDED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  CONFIG_UPDATED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, "adminLogs"),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        const snap = await getDocs(q);
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminLog)));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const actionTypes = useMemo(() => {
    const types = new Set<string>();
    logs.forEach(l => types.add(l.action));
    return Array.from(types).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    let result = [...logs];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        (l.action || '').toLowerCase().includes(q) ||
        (l.performedByEmail || '').toLowerCase().includes(q) ||
        (l.targetEmail || '').toLowerCase().includes(q) ||
        (l.details || '').toLowerCase().includes(q)
      );
    }
    if (actionFilter !== 'all') {
      result = result.filter(l => l.action === actionFilter);
    }
    return result;
  }, [logs, search, actionFilter]);

  return (
    <AdminLayout title="Activity Logs">
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          Showing latest 50 activity logs. Older logs are auto-removed.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-500">
          <option value="all">All Actions</option>
          {actionTypes.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-purple-500" size={40} /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ScrollText className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No activity logs</h3>
          <p className="text-gray-500 dark:text-gray-400">Activity will appear here as admin actions are performed</p>
        </motion.div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Performed By</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Target</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Details</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filtered.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                      {log.performedByEmail || log.performedBy || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 hidden lg:table-cell">
                      {log.targetEmail || log.targetUid || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {log.timestamp?.seconds
                        ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ActivityLogs;
