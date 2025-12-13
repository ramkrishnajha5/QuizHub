import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../utils/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Mail, Lock, Sparkles, LogIn, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-12 px-4">
      {/* Subtle Background Pattern - Hidden on Mobile */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
      </div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6 shadow-xl">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">QuizHub</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Welcome Back!</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to continue learning</p>
          </div>

          {/* Firebase Warning */}
          {!isFirebaseConfigured() && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Firebase config missing. Add keys in <code className="font-mono bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">constants.ts</code></p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" required placeholder="your.email@example.com" className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition font-medium" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" required placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition font-medium" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition disabled:opacity-50">
              {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</> : <><LogIn className="w-5 h-5" /> Sign In</>}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-medium">Or continue with</span></div>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm disabled:opacity-50">
            <Chrome className="w-5 h-5 text-blue-600" /> <span className="text-gray-700 dark:text-gray-200">Continue with Google</span>
          </button>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">Don't have an account? <Link to="/signup" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">Sign Up</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;