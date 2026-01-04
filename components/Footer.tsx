import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Instagram, Mail, Zap } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/ramkrishnajha5',
      icon: Github,
      color: 'hover:text-gray-900 dark:hover:text-white'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/ramkrishnajha5',
      icon: Instagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'Email',
      url: 'mailto:ram03krishna@gmail.com',
      icon: Mail,
      color: 'hover:text-blue-500'
    },
  ];

  return (
    <footer className="relative bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-10">
          {/* LEFT SIDE - Brand, Description & Social */}
          <div className="text-center md:text-left space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                QuizHub
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto md:mx-0">
              Your free learning companion. Test your knowledge with quizzes, explore millions of books, and track your progress.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2 justify-center md:justify-start">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 transition-all hover:scale-110 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-6">
          {/* Desktop: Left & Right alignment, Mobile: Center stacked */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* LEFT - Copyright (centered on mobile) */}
            <div className="text-center md:text-left order-2 md:order-1">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                © {currentYear} QuizHub. All rights reserved.
              </p>
              {/* Attribution - Small */}
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                Powered by Open Library • Open Trivia DB • Google Books
              </p>
            </div>

            {/* RIGHT - Made with love (centered on mobile) */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 order-1 md:order-2">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>by</span>
              <a
                href="https://instagram.com/ramkrishnajha5"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:underline"
              >
                Ram Krishna
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;