import React from 'react';
import { BookOpen, Globe, Shield, Users, Target, Heart, Code, Coffee } from 'lucide-react';
import { INSTAGRAM_LINK } from '../constants';

const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Mission</span>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">Democratizing Knowledge</h1>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">PrepPulse is built on a simple mission: high-quality educational tools should be free, accessible, and enjoyable for everyone, everywhere.</p>
      </div>

      {/* Core Values */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="text-center p-8 bg-white dark:bg-darkcard rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 dark:text-white">Universal Access</h3>
          <p className="text-gray-600 dark:text-gray-400">We believe in removing barriers to entry. No paywalls, no premium subscriptions, just pure learning opportunities for students worldwide.</p>
        </div>
        <div className="text-center p-8 bg-white dark:bg-darkcard rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 dark:text-white">Ad-Free Experience</h3>
          <p className="text-gray-600 dark:text-gray-400">Focus on what matters. Our platform is designed to be distraction-free to maximize your retention and respect your time and attention.</p>
        </div>
        <div className="text-center p-8 bg-white dark:bg-darkcard rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 dark:text-white">Open Source Data</h3>
          <p className="text-gray-600 dark:text-gray-400">Powered by the Open Trivia DB, contributing to the global commons of educational resources and ensuring diverse question sets.</p>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="bg-gray-50 dark:bg-darkcard rounded-3xl p-8 md:p-12 mb-20 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-start gap-10">
           <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Philosophy</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                PrepPulse was born out of the frustration with cluttered, ad-filled quiz sites. We wanted to create a "Zen" mode for testing your knowledge—whether you are preparing for a pub quiz, a school exam, or just want to learn something new.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We leverage modern web technologies like React, Tailwind CSS, and IndexedDB to ensure your progress is never lost, even if your internet connection drops. By focusing on user experience first, we aim to make learning a habit, not a chore.
              </p>
           </div>
           <div className="md:w-1/3 w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">Why we do it</h3>
              <ul className="space-y-4">
                 <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Target className="w-6 h-6 mr-3 text-red-500" /> Goal-oriented learning
                 </li>
                 <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Users className="w-6 h-6 mr-3 text-blue-500" /> Community driven
                 </li>
                 <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Heart className="w-6 h-6 mr-3 text-pink-500" /> Passion for education
                 </li>
              </ul>
           </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="max-w-4xl mx-auto mb-20">
         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">Meet the Developer</h2>
         <div className="bg-white dark:bg-darkcard rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-xl flex-shrink-0">
               <Code size={64} />
            </div>
            <div className="text-center md:text-left">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ram Krishna</h3>
               <p className="text-primary font-medium mb-4">Full Stack Developer & UI/UX Enthusiast</p>
               <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  "I built PrepPulse to provide a clean, powerful, and accessible platform for learners everywhere. I'm passionate about React, modern web performance, and creating interfaces that delight users."
               </p>
               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition shadow-md">
                     <span className="mr-2">Follow on Instagram</span>
                     @ramkrishnajha5
                  </a>
                  <a href="mailto:ram03krishna@gmail.com" className="inline-flex items-center px-6 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                     <Coffee className="w-4 h-4 mr-2" />
                     Buy me a coffee
                  </a>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Note */}
      <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-10">
         <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            PrepPulse is constantly evolving. We are working on new features like multiplayer challenges, custom quiz creation, and more deep-dive analytics.
         </p>
         <div className="mt-6 flex justify-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium">
               Version 1.2.0
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs font-medium">
               Active Development
            </span>
         </div>
      </div>
    </div>
  );
};

export default About;