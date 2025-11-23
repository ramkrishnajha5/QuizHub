import React, { useState } from 'react';
import { WEB3FORMS_ACCESS_KEY } from '../constants';
import { Mail, Send, MapPin, Phone, Instagram, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const object = {
      access_key: WEB3FORMS_ACCESS_KEY,
      ...formData,
      subject: `PrepPulse Contact from ${formData.name}`
    };

    const json = JSON.stringify(object);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });
      const result = await res.json();
      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Get in Touch</h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Have questions, feedback, or collaboration ideas? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div 
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-primary rounded-2xl p-10 text-white shadow-xl flex flex-col justify-between"
        >
          <div>
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            <p className="mb-10 text-blue-100 leading-relaxed">
              Reach out to us directly through any of these channels. We are always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
            </p>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-lg text-white">Email</p>
                  <a href="mailto:ram03krishna@gmail.com" className="text-blue-100 hover:text-white transition">ram03krishna@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-lg text-white">Location</p>
                  <p className="text-blue-100">India</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-lg text-white">Instagram</p>
                  <a href="https://instagram.com/ramkrishnajha5" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white hover:underline transition">
                    @ramkrishnajha5
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
             <p className="text-blue-200 text-sm">Customer Support available 24/7. We usually respond within a few hours.</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white dark:bg-darkcard rounded-2xl p-10 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          {status === 'success' ? (
             <div className="text-center h-full flex flex-col justify-center items-center text-green-600 dark:text-green-400 py-10">
               <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                 <CheckCircle size={40} />
               </div>
               <h3 className="text-3xl font-bold mb-2">Message Sent!</h3>
               <p className="text-gray-600 dark:text-gray-300 mb-8">Thanks for reaching out. We'll get back to you soon.</p>
               <button 
                 onClick={() => setStatus('idle')} 
                 className="px-6 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
               >
                 Send another message
               </button>
             </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all outline-none resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  {!status && <Send size={20} className="ml-2" />}
                </button>

                {status === 'error' && (
                  <div className="flex items-center justify-center text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle size={18} className="mr-2" />
                    <p className="text-sm">Something went wrong. Please try again later.</p>
                  </div>
                )}
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;