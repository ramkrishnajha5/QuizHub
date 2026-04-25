/**
 * Admin Dashboard Page
 * Shows real-time stats, charts, recent activity, and recent signups
 */

import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAdminDashboardStats, getAdminLogs, AdminLog } from '../utils/adminFirestore';
import { Users, BarChart3, FileText, Ban, Loader, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BAR_COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#10B981'];

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<AdminLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashStats, logs] = await Promise.all([
          getAdminDashboardStats(),
          getAdminLogs(10),
        ]);
        console.log("Dashboard stats fetched:", dashStats);
        setStats(dashStats);
        setRecentLogs(logs);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-32">
          <Loader className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Quiz Attempts', value: stats?.totalAttempts || 0, icon: BarChart3, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Custom Quizzes', value: stats?.totalAdminQuizzes || 0, icon: FileText, gradient: 'from-orange-500 to-red-500' },
    { label: 'Banned Users', value: stats?.bannedUsersCount || 0, icon: Ban, gradient: 'from-red-500 to-rose-600' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/20 shadow-lg"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">
              {card.value.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart — Attempts per Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-500" />
            Quiz Attempts (Last 30 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.last30Days || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickFormatter={(val) => new Date(val).getDate().toString()}
                />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="attempts" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart — Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-pink-500" />
            Top 5 Categories
          </h3>
          <div className="h-64">
            {(stats?.topCategories?.length || 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topCategories || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#9CA3AF' }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9CA3AF' }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', border: 'none', color: '#fff' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {(stats?.topCategories || []).map((_: any, i: number) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No data yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Activity Feed + Recent Signups */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          {recentLogs.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentLogs.map((log, idx) => (
                <div key={log.id || idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{log.details || log.targetEmail || ''}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {log.timestamp?.seconds
                        ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">No recent activity</p>
          )}
        </motion.div>

        {/* Recent Signups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Users</h3>
          {(stats?.recentSignups?.length || 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {stats.recentSignups.map((u: any, idx: number) => (
                    <tr key={u.uid || idx}>
                      <td className="py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {u.name || 'Unknown'}
                      </td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                        {u.email || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">No users yet</p>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
