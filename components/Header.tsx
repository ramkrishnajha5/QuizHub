import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebase';
import { Menu, X, User, LogOut, Zap, Sun, Moon, Smartphone, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../contexts/QuizContext';

const Header: React.FC = () => {
  const [user] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const { attemptNavigation } = useQuiz();

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setIsProfileOpen(false);
    navigate('/');
  };


  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-darkcard shadow-sm z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">


          {/* Logo */}
          <Link to="/" onClick={(e) => { e.preventDefault(); attemptNavigation(() => navigate('/')); }} className="flex items-center space-x-2 text-primary font-bold text-xl tracking-tight">
            <Zap className="w-6 h-6 text-accent" fill="currentColor" />
            <span className="dark:text-white">QuizHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" onClick={(e) => { e.preventDefault(); attemptNavigation(() => navigate('/')); }} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Home</Link>
            <Link to="/study" onClick={(e) => { e.preventDefault(); attemptNavigation(() => navigate('/study')); }} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Study</Link>
            <Link to="/about" onClick={(e) => { e.preventDefault(); attemptNavigation(() => navigate('/about')); }} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">About Us</Link>
            <Link to="/contact" onClick={(e) => { e.preventDefault(); attemptNavigation(() => navigate('/contact')); }} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Contact Us</Link>

            <a href="https://github.com/ramkrishnajha5/QuizHub/releases/download/v2.2.0/QuizHub.apk" className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              <Download size={16} />
              <span>App</span>
            </a>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary focus:outline-none"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <User size={18} />
                    </div>
                  )}
                  <span className="font-medium">{user.displayName || user.email?.split('@')[0]}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-100 dark:border-gray-700"
                    >
                      <Link to="/" onClick={(e) => { e.preventDefault(); setIsProfileOpen(false); attemptNavigation(() => navigate('/')); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Home</Link>
                      <Link to="/dashboard" onClick={(e) => { e.preventDefault(); setIsProfileOpen(false); attemptNavigation(() => navigate('/dashboard')); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Dashboard</Link>
                      <Link to="/saved-books" onClick={(e) => { e.preventDefault(); setIsProfileOpen(false); attemptNavigation(() => navigate('/saved-books')); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Saved Books</Link>
                      <Link to="/profile" onClick={(e) => { e.preventDefault(); setIsProfileOpen(false); attemptNavigation(() => navigate('/profile')); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Profile</Link>
                      <button onClick={(e) => { e.preventDefault(); setIsProfileOpen(false); attemptNavigation(() => handleLogout()); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2">
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="bg-primary text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition shadow-sm">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-gray-200 hover:text-primary">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); attemptNavigation(() => navigate('/')); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">Home</Link>
              <Link to="/study" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); attemptNavigation(() => navigate('/study')); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">Study</Link>
              <Link to="/about" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); attemptNavigation(() => navigate('/about')); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">About Us</Link>
              <Link to="/contact" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); attemptNavigation(() => navigate('/contact')); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">Contact Us</Link>

              {user ? (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex items-center px-3 mb-4">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full mr-3" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                        <User size={18} />
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">{user.displayName}</span>
                  </div>
                  <Link to="/dashboard" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); attemptNavigation(() => navigate('/dashboard')); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">Dashboard</Link>
                  <Link to="/saved-books" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); attemptNavigation(() => navigate('/saved-books')); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">Saved Books</Link>
                  <Link to="/profile" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); attemptNavigation(() => navigate('/profile')); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">Profile</Link>
                  <button onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); attemptNavigation(() => handleLogout()); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
                </div>
              ) : (
                <div className="mt-4">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-center bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">Login</Link>
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                <a href="https://github.com/ramkrishnajha5/QuizHub/releases/download/v2.2.0/QuizHub.apk" className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">
                  <Smartphone size={20} />
                  <span>Download Android App</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;