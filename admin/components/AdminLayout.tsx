/**
 * Admin Layout
 * Wraps all admin pages with sidebar + top bar
 */

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
      </div>

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="md:ml-72 relative z-10 min-h-screen flex flex-col">
        <AdminTopBar title={title} onMenuClick={() => setSidebarOpen(true)} />

        <motion.main
          key={title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 md:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
