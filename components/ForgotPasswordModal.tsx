import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      await resetPassword(email);
      setMessage({ type: 'success', text: 'Password reset link sent! Check your inbox.' });
      setTimeout(() => {
        onClose();
        setEmail('');
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send reset link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl z-[70] overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Reset Password</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                  <X size={24} />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20' : 'bg-red-50 text-red-700 dark:bg-red-900/20'
                }`}>
                  {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || message?.type === 'success'}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : 'Send Reset Link'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
