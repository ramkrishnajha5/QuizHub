import React, { useState } from 'react';
import { WEB3FORMS_ACCESS_KEY } from '../constants';
import { Mail, Send, MapPin, Instagram, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          ...formData,
          subject: `QuizHub Contact from ${formData.name}`
        })
      });
      const result = await res.json();
      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const contactInfo = [
    { icon: Mail, title: "Email", value: "ram03krishna@gmail.com", link: "mailto:ram03krishna@gmail.com", gradient: "from-blue-400 to-cyan-500" },
    { icon: MapPin, title: "Location", value: "India", gradient: "from-green-400 to-emerald-500" },
    { icon: Instagram, title: "Instagram", value: "@ramkrishnajha5", link: "https://instagram.com/ramkrishnajha5", gradient: "from-pink-400 to-rose-500" },
    { icon: Clock, title: "Support", value: "24/7", gradient: "from-purple-400 to-indigo-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      {/* Subtle Background Pattern - Hidden on Mobile */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-xl border border-white/20 mb-8">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">Contact Us</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">Get in Touch</span>
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">Have questions or feedback? We'd love to hear from you!</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative z-10 py-12 px-4 mb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${info.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <info.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{info.title}</div>
                {info.link ? (
                  <a href={info.link} target={info.link.startsWith('http') ? '_blank' : undefined} rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined} className={`text-lg font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent hover:underline`}>
                    {info.value}
                  </a>
                ) : (
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{info.value}</div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-xl">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Message Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Thanks for reaching out. We'll get back to you soon.</p>
                  <button onClick={() => setStatus('idle')} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl">
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Send Message</h3>
                    <p className="text-gray-600 dark:text-gray-400">Fill out the form and we'll get back soon</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input type="text" required placeholder="Your Name" className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input type="email" required placeholder="your@email.com" className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                    <textarea required rows={5} placeholder="Your message..." className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition resize-none" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>

                  <button type="submit" disabled={status === 'submitting'} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition disabled:opacity-50">
                    {status === 'submitting' ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-5 h-5" /> Send Message</>
                    )}
                  </button>

                  {status === 'error' && <p className="text-red-500 text-center font-semibold">Something went wrong. Try again.</p>}
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;