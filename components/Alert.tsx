import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onClose: () => void;
    show: boolean;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, show }) => {
    const icons = {
        success: <CheckCircle className="w-6 h-6" />,
        error: <XCircle className="w-6 h-6" />,
        warning: <AlertCircle className="w-6 h-6" />,
        info: <Info className="w-6 h-6" />
    };

    const colors = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200'
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
                >
                    <div className={`${colors[type]} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3`}>
                        <div className="flex-shrink-0 mt-0.5">
                            {icons[type]}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium whitespace-pre-line leading-relaxed">{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 hover:opacity-70 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Alert;
