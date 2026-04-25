/**
 * Admin Login Page
 * Completely separate from user login — different UI, different auth flow
 */

import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { getAdminByUid, updateAdminLastLogin } from '../utils/adminFirestore';
import { logAdminAction } from '../utils/adminLogger';
import { ShieldCheck, Mail, Lock, LogIn, AlertTriangle, Loader, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAdminAuthenticated && !isAdminLoading) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdminAuthenticated, isAdminLoading, navigate]);

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (isAdminAuthenticated) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify admin status in Firestore
      const adminDoc = await getAdminByUid(user.uid);

      if (!adminDoc || (adminDoc.role !== 'superadmin' && adminDoc.role !== 'moderator')) {
        // Not an admin — sign out and deny
        await signOut(auth);
        setError('You are not authorized as an admin. This incident may be logged.');
        setLoading(false);
        return;
      }

      // Admin verified — set session flag and update last login
      sessionStorage.setItem('adminSession', 'true');
      await updateAdminLastLogin(user.uid);

      // Log the admin login
      await logAdminAction({
        action: 'ADMIN_LOGIN',
        performedBy: user.uid,
        performedByEmail: user.email || '',
        details: `Admin logged in: ${user.email}`,
      });

      // Force page reload to re-initialize AdminAuthContext
      window.location.hash = '#/admin/dashboard';
      window.location.reload();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden px-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-gray-900 to-pink-900/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-gray-800/80 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border border-gray-700/50">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-2xl">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400 text-sm">Authorized personnel only</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-900/30 border border-red-700/50 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-900/70 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white font-medium transition placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-900/70 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white font-medium transition placeholder-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition disabled:opacity-50 mt-8"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-600 text-xs">
              This area is restricted to authorized administrators.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Return to Main App
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
