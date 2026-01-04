import React from 'react';
import {
  Globe, Shield, BookOpen, Users, Target, Heart, TrendingUp,
  Zap, Clock, Download, Smartphone,
  GraduationCap, Library, Brain, Quote
} from 'lucide-react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  // Core Features
  const features = [
    {
      icon: Zap,
      title: "Interactive Quizzes",
      description: "Test your knowledge with fun quizzes across many topics. Get instant results and see where you stand.",
      gradient: "from-yellow-400 via-orange-500 to-pink-500"
    },
    {
      icon: Library,
      title: "Free Books Library",
      description: "Access millions of free books from Open Library. Read online or download PDFs to study offline.",
      gradient: "from-purple-400 via-pink-500 to-rose-500"
    },
    {
      icon: Brain,
      title: "Track Your Progress",
      description: "See your quiz scores, track your learning journey, and watch yourself improve over time.",
      gradient: "from-cyan-400 via-blue-500 to-indigo-600"
    },
    {
      icon: Download,
      title: "Download & Save",
      description: "Save your favorite books to your personal library. Download PDFs to read anytime, anywhere.",
      gradient: "from-green-400 via-emerald-500 to-teal-600"
    }
  ];

  // What makes us different
  const highlights = [
    {
      icon: Globe,
      title: "100% Free",
      description: "No hidden costs, no premium plans. Everything is completely free forever.",
      gradient: "from-cyan-400 to-blue-600"
    },
    {
      icon: Shield,
      title: "No Ads",
      description: "Learn without annoying ads or pop-ups. Just pure, clean learning experience.",
      gradient: "from-green-400 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Learn Anytime",
      description: "Study at your own pace. Our platform is available 24/7, whenever you need it.",
      gradient: "from-orange-400 to-red-500"
    },
    {
      icon: Smartphone,
      title: "Works Everywhere",
      description: "Use on phone, tablet, or computer. Works great on all devices and screen sizes.",
      gradient: "from-purple-400 to-pink-600"
    }
  ];

  // Stats
  const stats = [
    { number: "24+", label: "Quiz Categories", icon: GraduationCap },
    { number: "40+", label: "Study Topics", icon: BookOpen },
    { number: "1M+", label: "Free Books", icon: Library },
    { number: "100%", label: "Free Forever", icon: Heart }
  ];

  // How it works steps
  const steps = [
    {
      step: 1,
      title: "Choose What to Learn",
      description: "Pick from 24+ categories like Science, History, Computer Science, and more.",
      icon: Target
    },
    {
      step: 2,
      title: "Take Quizzes or Read Books",
      description: "Test your knowledge with quizzes or explore millions of free books on any topic.",
      icon: BookOpen
    },
    {
      step: 3,
      title: "Track Your Progress",
      description: "See your scores, save favorite books, and watch your knowledge grow over time.",
      icon: TrendingUp
    }
  ];

  // Inspirational Quotes
  const quotes = [
    {
      text: "Practice makes a man perfect.",
      author: "— Ancient Proverb"
    },
    {
      text: "The more you read, the more things you will know. The more that you learn, the more places you'll go.",
      author: "— Dr. Seuss"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "— Nelson Mandela"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
      </div>

      {/* Hero Section - About Us Style */}
      <section className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                About
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                QuizHub
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              QuizHub is your free learning companion. Take quizzes to test your knowledge,
              read millions of books, and track your progress — all without spending a single penny.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.number}</div>
                  <div className="text-white/90 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              What Can You Do Here?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to learn, test, and grow — in one simple platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`} />

                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-b from-transparent via-purple-50/30 to-transparent dark:via-purple-950/10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Getting started is super easy — just 3 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-purple-400 to-pink-400" />
                )}

                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-xl mb-6">
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                    {item.step}
                  </span>
                  <item.icon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Why Choose QuizHub?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We believe learning should be free and accessible to everyone
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all text-center"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspirational Quotes Section */}
      <section className="relative z-10 py-20 px-4 mb-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <Quote className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              Words to Inspire You
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {quotes.map((quote, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 shadow-2xl overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '15px 15px' }} className="absolute inset-0" />
                </div>

                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-20">
                  <Quote className="w-12 h-12 text-white" />
                </div>

                <div className="relative">
                  <p className="text-white text-lg md:text-xl font-medium leading-relaxed mb-4 italic">
                    "{quote.text}"
                  </p>
                  <p className="text-white/80 text-sm font-semibold">
                    {quote.author}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Motivational Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Every quiz you take, every book you read brings you one step closer to your goals.
              <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Start your journey today!</span>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;