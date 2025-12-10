import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Rocket, Zap, BookOpen, Target, Trophy, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: "Interactive Quizzes",
      description: "Test your knowledge with engaging quizzes across 24+ categories",
      gradient: "from-yellow-400 via-orange-500 to-pink-500",
      iconBg: "bg-gradient-to-br from-yellow-400 to-orange-500"
    },
    {
      icon: BookOpen,
      title: "Study Resources",
      description: "Access millions of books powered by Google Books API",
      gradient: "from-cyan-400 via-blue-500 to-indigo-500",
      iconBg: "bg-gradient-to-br from-cyan-400 to-blue-500"
    },
    {
      icon: Target,
      title: "Track Progress",
      description: "Monitor your performance with detailed analytics",
      gradient: "from-green-400 via-emerald-500 to-teal-500",
      iconBg: "bg-gradient-to-br from-green-400 to-emerald-500"
    },
    {
      icon: Trophy,
      title: "Achieve Goals",
      description: "Set targets and watch yourself improve every day",
      gradient: "from-purple-400 via-pink-500 to-rose-500",
      iconBg: "bg-gradient-to-br from-purple-400 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 dark:border-gray-700/50 mb-8"
            >
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Your Ultimate Learning Platform
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Master
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Your Knowledge
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Challenge yourself with interactive quizzes, explore millions of study resources, and track your progress—all completely <span className="font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">free</span>!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/setup"
                  className="group inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all"
                >
                  <Play className="w-6 h-6" fill="currentColor" />
                  Start Quiz Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/study"
                  className="inline-flex items-center gap-3 px-8 py-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-purple-200 dark:border-purple-800 text-gray-900 dark:text-white rounded-2xl font-bold text-lg shadow-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all"
                >
                  <BookOpen className="w-6 h-6" />
                  Explore Resources
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Powerful features to supercharge your learning
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all"
              >
                {/* Gradient Border Effect on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`} />

                {/* Icon */}
                <div className={`relative w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="relative text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom Accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;