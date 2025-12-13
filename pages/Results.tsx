import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { QuizAttempt } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle, XCircle, AlertCircle, Clock, RotateCcw, Home, Trophy, Sparkles, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Results: React.FC = () => {
  const location = useLocation();
  const result = location.state?.result as QuizAttempt;
  const [showSolutions, setShowSolutions] = useState(false);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
        <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/20">
          <AlertCircle className="w-16 h-16 mx-auto mb-6 text-purple-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Results Found</p>
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-xl">Go Home</Link>
        </div>
      </div>
    );
  }

  const data = [
    { name: 'Correct', value: result.correct, color: '#10B981' },
    { name: 'Wrong', value: result.wrong, color: '#EF4444' },
    { name: 'Skipped', value: result.unattempted, color: '#9CA3AF' },
  ];

  const getGrade = (p: number) => {
    if (p >= 90) return { text: 'Outstanding!', emoji: '🏆', gradient: 'from-yellow-400 via-orange-500 to-red-500' };
    if (p >= 70) return { text: 'Great Job!', emoji: '🎉', gradient: 'from-green-400 via-emerald-500 to-teal-500' };
    if (p >= 50) return { text: 'Good Effort', emoji: '👍', gradient: 'from-blue-400 via-cyan-500 to-indigo-500' };
    return { text: 'Keep Practicing', emoji: '💪', gradient: 'from-purple-400 via-pink-500 to-rose-500' };
  };

  const grade = getGrade(result.percent);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Subtle Background Pattern - Hidden on Mobile */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`relative bg-gradient-to-r ${grade.gradient} rounded-3xl shadow-2xl overflow-hidden mb-8 p-12`}>
          <div className="absolute inset-0 opacity-20"><div style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '20px 20px' }} className="absolute inset-0" /></div>
          <div className="relative text-center text-white">
            <div className="text-7xl mb-4">{grade.emoji}</div>
            <h1 className="text-5xl font-black mb-3">{grade.text}</h1>
            <p className="text-2xl font-bold mb-2">You scored {result.percent.toFixed(1)}%</p>
            <p className="text-xl opacity-90">{result.category} • {result.questionCount} Questions</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Target className="w-6 h-6 text-purple-600" /> Performance</h3>
            <div className="h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-5xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">{result.score}</div>
                  <div className="text-lg text-gray-500 dark:text-gray-400">/ {result.questions.length}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Detailed Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-900/30">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                <div className="text-4xl font-black bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">{result.correct}</div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Correct</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-900/30">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
                <div className="text-4xl font-black bg-gradient-to-br from-red-600 to-pink-600 bg-clip-text text-transparent mb-1">{result.wrong}</div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Wrong</div>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <AlertCircle className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">{result.unattempted}</div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Skipped</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/30">
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                <div className="text-4xl font-black bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">{(result.durationSeconds / 60).toFixed(1)}</div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Minutes</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap justify-center gap-4 mb-8">
          <button onClick={() => setShowSolutions(!showSolutions)} className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-purple-200 dark:border-purple-800 text-gray-900 dark:text-white font-bold rounded-xl shadow-xl hover:border-purple-400 dark:hover:border-purple-600 transition flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> {showSolutions ? 'Hide' : 'Review'} Questions
          </button>
          <Link to="/setup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition flex items-center gap-2">
            <RotateCcw className="w-5 h-5" /> Take Another
          </Link>
          <Link to="/" className="px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition flex items-center gap-2">
            <Home className="w-5 h-5" /> Home
          </Link>
        </motion.div>

        {/* Solutions */}
        <AnimatePresence>
          {showSolutions && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
              <div className="flex items-center gap-3"><Trophy className="w-8 h-8 text-yellow-500" /><h2 className="text-3xl font-black text-gray-900 dark:text-white">Solutions</h2></div>
              {result.questions.map((q: any, i) => {
                const ua = result.userAnswers[i];
                const userSelected = ua.selectedOption || ua.selectedAnswer;
                const timeSpent = ua.timeSpentSeconds || ua.timeSpent || 0;
                const options = q.options || q.all_answers || [];
                const correctAns = q.correctAnswer || q.correct_answer;
                const isCorrect = userSelected === correctAns;

                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border-l-4 shadow-xl ${isCorrect ? 'border-green-500' : userSelected ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-lg font-bold text-gray-400">Question {i + 1}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 flex items-center gap-1"><Clock size={14} /> {timeSpent}s</span>
                        {isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                        {!isCorrect && userSelected && <XCircle className="w-6 h-6 text-red-500" />}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6" dangerouslySetInnerHTML={{ __html: q.question }} />
                    <div className="grid gap-3">
                      {options.map((ans: string, idx: number) => {
                        const isSelected = userSelected === ans;
                        const isActualCorrect = ans === correctAns;
                        let bgClass = 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
                        if (isActualCorrect) bgClass = 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700 shadow-md';
                        else if (isSelected) bgClass = 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-red-300 dark:border-red-700 shadow-md';

                        return (
                          <div key={idx} className={`p-4 rounded-xl border-2 ${bgClass} flex justify-between items-center transition-all`}>
                            <span className="font-medium text-gray-900 dark:text-white" dangerouslySetInnerHTML={{ __html: ans }} />
                            {isActualCorrect && <CheckCircle size={20} className="text-green-600 dark:text-green-400" />}
                            {isSelected && !isActualCorrect && <XCircle size={20} className="text-red-600 dark:text-red-400" />}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Results;