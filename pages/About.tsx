import React from 'react';
import { Globe, Shield, BookOpen, Users, Target, Heart, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const values = [
    {
      icon: Globe,
      title: "Universal Access",
      description: "Free learning for everyone, everywhere. No paywalls, no subscriptions—just pure knowledge.",
      gradient: "from-cyan-400 via-blue-500 to-indigo-600"
    },
    {
      icon: Shield,
      title: "Ad-Free Experience",
      description: "Focus on learning without distractions. Clean, pure educational environment.",
      gradient: "from-green-400 via-emerald-500 to-teal-600"
    },
    {
      icon: BookOpen,
      title: "Rich Resources",
      description: "Million of books via Google Books API across 24+ subjects for comprehensive learning.",
      gradient: "from-purple-400 via-pink-500 to-rose-600"
    }
  ];

  const principles = [
    { icon: Target, text: "Goal-oriented", color: "from-orange-400 to-red-500" },
    { icon: Users, text: "Community driven", color: "from-blue-400 to-cyan-500" },
    { icon: Heart, text: "Passion for education", color: "from-pink-400 to-rose-500" },
    { icon: TrendingUp, text: "Continuous improvement", color: "from-green-400 to-emerald-500" },
    { icon: Award, text: "Quality content", color: "from-yellow-400 to-orange-500" },
    { icon: Shield, text: "Privacy focused", color: "from-indigo-400 to-purple-500" }
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 px-2">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent break-words">
                Democratizing
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Knowledge</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto px-4">
              QuizHub is built on a simple mission: high-quality educational tools should be <span className="font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">free, accessible, and enjoyable</span> for everyone, everywhere.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`} />

                <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="relative z-10 py-20 px-4 mb-20 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-4xl w-full">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-xl"
            >
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">
                Our Philosophy
              </h2>
              <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>
                  QuizHub was created to provide a <span className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">"Zen" mode</span> for testing knowledge and accessing quality study materials.
                </p>
                <p>
                  We leverage modern technologies like <span className="font-semibold">React, Firebase, and Google Books API</span> to deliver seamless experiences with saved libraries, progress tracking, and offline support.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-xl"
            >
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8">
                Our Principles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {principles.map((principle, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-2xl border border-white/20 text-center"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${principle.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <principle.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {principle.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Version Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-xl border border-white/20">
              <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-sm">
                Version 2.2.0
              </span>
              <span className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg font-bold text-sm">
                Active Development
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;