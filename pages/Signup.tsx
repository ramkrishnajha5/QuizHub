import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('Email already registered. Please sign in.');
      else if (err.code === 'auth/weak-password') setError('Password should be at least 6 characters.');
      else if (err.code === 'auth/invalid-email') setError('Please enter a valid email.');
      else setError('Error creating account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 py-12 px-4">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 20, repeat: Infinity }} className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-orange-500/30 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 25, repeat: Infinity }} className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20">
          {/* Back Button */}
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Back to Sign In</span>
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6 shadow-xl">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">QuizHub</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Join QuizHub</h2>
            <p className="text-gray-600 dark:text-gray-400">Create account and start learning</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" required placeholder="John Doe" className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white transition font-medium" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" required placeholder="your@email.com" className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white transition font-medium" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" required placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white transition font-medium" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">At least 6 characters</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition disabled:opacity-50">
              {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : <><UserPlus className="w-5 h-5" /> Create Account</>}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">Already have an account? <Link to="/login" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;