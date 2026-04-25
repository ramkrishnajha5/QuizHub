/**
 * Admin Sidebar Navigation
 * Collapsible on mobile, persistent on desktop
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BarChart3, PlusCircle, FileText,
  Ban, ScrollText, Settings, LogOut, ShieldCheck, Zap, X, ChevronLeft
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'All Users', icon: Users },
  { path: '/admin/attempts', label: 'Quiz Attempts', icon: BarChart3 },
  { path: '/admin/upload-quiz', label: 'Upload Quiz', icon: PlusCircle },
  { path: '/admin/manage-quizzes', label: 'Manage Quizzes', icon: FileText },
  { path: '/admin/banned', label: 'Banned Users', icon: Ban },
  { path: '/admin/logs', label: 'Activity Logs', icon: ScrollText },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { adminData, adminRole, adminLogout } = useAdminAuth();

  const handleLogout = async () => {
    await adminLogout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                QuizHub
              </span>
              <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 -mt-0.5">Admin Panel</span>
            </div>
          </Link>
          <button onClick={onClose} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : ''} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="adminNavIndicator"
                  className="absolute right-0 w-1 h-8 bg-white rounded-l-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info & Logout */}
      <div className="px-4 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3 px-4 py-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {adminData?.email?.split('@')[0] || 'Admin'}
            </p>
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
              adminRole === 'superadmin'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
            }`}>
              {adminRole === 'superadmin' ? 'Super Admin' : 'Moderator'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition mt-2"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 font-medium text-sm transition mt-1"
        >
          <ChevronLeft size={20} />
          <span>Back to App</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 z-50 md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
