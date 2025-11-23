import React from 'react';
import { BookOpen, Globe, Shield, Users, Target, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Democratizing Knowledge</h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">QuizHub is built on a simple mission: high-quality educational tools should be free, accessible, and enjoyable for everyone, everywhere.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="text-center p-6 bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 dark:text-white">Universal Access</h3>
          <p className="text-gray-600 dark:text-gray-400">We believe in removing barriers to entry. No paywalls, no premium subscriptions, just pure learning opportunities for students worldwide.</p>
        </div>
        <div className="text-center p-6 bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 dark:text-white">Ad-Free Experience</h3>
          <p className="text-gray-600 dark:text-gray-400">Focus on what matters. Our platform is designed to be distraction-free to maximize your retention and respect your time and attention.</p>
        </div>
        <div className="text-center p-6 bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 dark:text-white">Open Source Data</h3>
          <p className="text-gray-600 dark:text-gray-400">Powered by the Open Trivia DB, contributing to the global commons of educational resources and ensuring diverse question sets.</p>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="bg-gray-50 dark:bg-darkcard rounded-3xl p-8 md:p-12 mb-16 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Philosophy</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              QuizHub was born out of the frustration with cluttered, ad-filled quiz sites. We wanted to create a "Zen" mode for testing your knowledge—whether you are preparing for a pub quiz, a school exam, or just want to learn something new.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              We leverage modern web technologies like React, Tailwind CSS, and IndexedDB to ensure your progress is never lost, even if your internet connection drops. By focusing on user experience first, we aim to make learning a habit, not a chore.
            </p>
          </div>
          <div className="md:w-1/3 w-full bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-inner">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Why we do it</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Target className="w-5 h-5 mr-3 text-red-500" /> Goal-oriented learning
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Users className="w-5 h-5 mr-3 text-blue-500" /> Community driven
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Heart className="w-5 h-5 mr-3 text-pink-500" /> Passion for education
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Team / Community */}
      <div className="text-center pb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Join the Movement</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          QuizHub is constantly evolving. We are working on new features like multiplayer challenges, custom quiz creation, and more deep-dive analytics.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium">
            Version 1.2.0
          </span>
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium">
            Active Development
          </span>
        </div>
      </div>
    </div>
  );
};

export default About;