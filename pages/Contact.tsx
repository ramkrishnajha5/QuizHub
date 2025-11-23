import React, { useState } from 'react';
import { WEB3FORMS_ACCESS_KEY } from '../constants';
import { Mail, Send, MapPin, Phone, Instagram } from 'lucide-react';
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
      subject: `QuizHub Contact from ${formData.name}`
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-primary rounded-2xl p-10 text-white shadow-xl"
        >
          <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
          <p className="mb-8 text-blue-100">
            Reach out to us directly through any of these channels. We are always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
          </p>
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <Mail className="mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-lg">Email</p>
                <a href="mailto:ram03krishna@gmail.com" className="text-blue-100 hover:text-white transition">ram03krishna@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MapPin className="mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-lg">Location</p>
                <p className="text-blue-100">India</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Instagram className="mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-lg">Instagram</p>
                <a href="https://instagram.com/ramkrishnajha5" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white hover:underline transition">
                  @ramkrishnajha5
                </a>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-blue-500/30">
            <p className="text-blue-200 text-sm">Customer Support available 24/7. We usually respond within a few hours.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white dark:bg-darkcard rounded-2xl p-10 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          {status === 'success' ? (
            <div className="text-center h-full flex flex-col justify-center items-center text-green-600 dark:text-green-400">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Send size={32} />
              </div>
              <h3 className="text-2xl font-bold">Message Sent!</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Thanks for reaching out. We'll get back to you soon.</p>
              <button onClick={() => setStatus('idle')} className="mt-6 text-primary underline hover:text-blue-600">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 shadow-md"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
                {!status && <Send size={18} className="ml-2" />}
              </button>

              {status === 'error' && <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>}
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;