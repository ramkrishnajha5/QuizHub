/**
 * Admin Top Bar
 * Shows page title, dark mode toggle, admin avatar
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Menu, Sun, Moon, Bell, ShieldCheck, CheckCircle, Info, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../utils/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface AdminTopBarProps {
  title: string;
  onMenuClick: () => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ title, onMenuClick }) => {
  const { adminData, adminRole } = useAdminAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to admin notifications
    const q = query(
      collection(db, 'adminNotifications'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.read === false) {
          notifs.push({ id: doc.id, ...data });
        }
      });
      setNotifications(notifs.slice(0, 5));
    }, (error) => {
      console.warn('Failed to listen to notifications:', error);
    });

    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async () => {
    if (notifications.length === 0) return;
    
    // Batch update to mark as read
    const batch = writeBatch(db);
    notifications.forEach(notif => {
      batch.update(doc(db, 'adminNotifications', notif.id), { read: true });
    });
    
    try {
      await batch.commit();
    } catch (e) {
      console.error('Error marking notifications as read', e);
    }
  };

  const handleViewAllLogs = async () => {
    await handleMarkAsRead();
    setShowNotifs(false);
    navigate('/admin/logs');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 md:px-8 py-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Menu size={22} className="text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 dark:text-gray-400"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 dark:text-gray-400 relative"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 flex flex-col max-h-[80vh]"
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10 flex-shrink-0">
                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                    <div className="flex items-center gap-2">
                       {notifications.length > 0 && (
                         <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold px-2 py-0.5 rounded-full">
                           {notifications.length} New
                         </span>
                       )}
                       <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={16} /></button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar min-h-[100px] z-10 relative">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircle size={32} className="mx-auto mb-2 text-green-400 opacity-50" />
                        You're all caught up!
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notif: any) => (
                          <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex gap-3 text-sm">
                            <div className="mt-1 flex-shrink-0">
                              <Info size={16} className="text-purple-500" />
                            </div>
                            <div>
                              <p className="text-gray-800 dark:text-gray-200 font-medium">
                                {notif.message}
                              </p>
                              {notif.timestamp && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.timestamp.seconds * 1000).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 z-10 flex-shrink-0">
                    <button
                      onClick={handleViewAllLogs}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl shadow hover:shadow-lg transition-all"
                    >
                      View All Logs
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Avatar */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {adminData?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{adminRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
