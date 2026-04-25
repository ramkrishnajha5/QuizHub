/**
 * Custom Modal Component
 * Beautiful replacement for window.alert() and window.confirm()
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (() => void) | null;
  title?: string;
  message?: string;
  type?: 'confirm' | 'alert';
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'danger' | 'primary' | 'success';
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm',
  confirmText = 'Yes',
  cancelText = 'No',
  confirmStyle = 'danger',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const confirmColors: Record<string, string> = {
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Box */}
          <motion.div
            className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900/95 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top right X close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Icon based on confirmStyle */}
            <div className="text-center mb-4">
              {confirmStyle === 'danger' && <div className="text-4xl mb-2">⚠️</div>}
              {confirmStyle === 'success' && <div className="text-4xl mb-2">✅</div>}
              {confirmStyle === 'primary' && <div className="text-4xl mb-2">💬</div>}
            </div>

            {/* Title */}
            {title && (
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                {title}
              </h3>
            )}

            {/* Message */}
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              {/* Cancel / No button */}
              {type === 'confirm' && (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white transition-all border border-gray-200 dark:border-white/10"
                >
                  {cancelText}
                </button>
              )}

              {/* Confirm / OK button */}
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg ${confirmColors[confirmStyle]}`}
              >
                {type === 'alert' ? 'OK' : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomModal;
