/**
 * Protected Admin Route
 * Redirects to /admin/login if not authenticated as admin
 * Shows loading spinner while checking auth
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Loader, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children, requireSuperAdmin = false }) => {
  const { isAdminAuthenticated, isAdminLoading, adminRole } = useAdminAuth();

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Loader className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Admin Panel</h2>
          <p className="text-gray-600 dark:text-gray-400">Verifying authorization...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireSuperAdmin && adminRole !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">This section requires Super Admin privileges.</p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
