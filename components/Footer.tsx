import React from 'react';
import { INSTAGRAM_LINK } from '../constants';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-darkcard border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">

          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} QuizHub. All rights reserved.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Questions provided by Open Trivia DB (CC BY-SA 4.0)</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Book metadata provided by Google Books API and OpenStax</p>
          </div>

          <div className="flex items-center space-x-1">
            <span>Made With</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>By</span>
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary dark:text-blue-400 hover:underline"
            >
              Ram Krishna
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;