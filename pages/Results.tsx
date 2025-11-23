import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { QuizAttempt } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle, XCircle, AlertCircle, Clock, RotateCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Results: React.FC = () => {
  const location = useLocation();
  const result = location.state?.result as QuizAttempt;
  const [showSolutions, setShowSolutions] = useState(false);

  if (!result) return <div className="p-8 text-center text-gray-600 dark:text-gray-400">No results found. <Link to="/" className="text-primary hover:underline">Go Home</Link></div>;

  const data = [
    { name: 'Correct', value: result.correct, color: '#10B981' },
    { name: 'Wrong', value: result.wrong, color: '#EF4444' },
    { name: 'Skipped', value: result.unattempted, color: '#9CA3AF' },
  ];

  const getGrade = (p: number) => {
    if (p >= 90) return { text: 'Excellent!', color: 'text-green-600 dark:text-green-400' };
    if (p >= 70) return { text: 'Good Job!', color: 'text-blue-600 dark:text-blue-400' };
    if (p >= 50) return { text: 'Passed', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: 'Keep Practicing', color: 'text-red-600 dark:text-red-400' };
  };

  const grade = getGrade(result.percent);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8 px-4 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-darkcard rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
        >
          <div className="bg-primary p-8 text-center text-white">
            <h1 className="text-3xl font-bold mb-2">{grade.text}</h1>
            <p className="opacity-90">You scored {result.percent.toFixed(1)}% on {result.category} ({result.difficulty})</p>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-4xl font-bold text-gray-800 dark:text-white">{result.score}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/ {result.questions.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                <div className="flex items-center text-green-700 dark:text-green-400 font-medium mb-1"><CheckCircle size={18} className="mr-2" /> Correct</div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{result.correct}</span>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center text-red-700 dark:text-red-400 font-medium mb-1"><XCircle size={18} className="mr-2" /> Wrong</div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{result.wrong}</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium mb-1"><AlertCircle size={18} className="mr-2" /> Unattempted</div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{result.unattempted}</span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center text-blue-700 dark:text-blue-400 font-medium mb-1"><Clock size={18} className="mr-2" /> Time</div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{(result.durationSeconds / 60).toFixed(1)}m</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 border-t border-gray-100 dark:border-gray-700 flex flex-wrap justify-center gap-4">
             <button 
              onClick={() => setShowSolutions(!showSolutions)}
              className="px-6 py-2 bg-white dark:bg-darkcard border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
             >
               {showSolutions ? 'Hide Solutions' : 'Review Questions'}
             </button>
             <Link to="/setup" className="px-6 py-2 bg-primary text-white rounded-lg font-medium shadow-md hover:bg-blue-700 flex items-center transition">
               <RotateCcw size={18} className="mr-2" /> Take Another
             </Link>
             <Link to="/" className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg font-medium shadow-md hover:bg-gray-900 dark:hover:bg-gray-600 flex items-center transition">
               <Home size={18} className="mr-2" /> Home
             </Link>
          </div>
        </motion.div>

        {showSolutions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detailed Solutions</h2>
            {result.questions.map((q, i) => {
               const userAnswer = result.userAnswers[i].selectedAnswer;
               const isCorrect = userAnswer === q.correct_answer;
               
               return (
                 <div key={i} className={`bg-white dark:bg-darkcard p-6 rounded-xl border-l-4 shadow-sm ${isCorrect ? 'border-green-500' : userAnswer ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                   <div className="flex justify-between mb-2">
                     <span className="font-bold text-gray-400 dark:text-gray-500">Question {i + 1}</span>
                     <span className="text-xs text-gray-500 dark:text-gray-400">Time: {result.userAnswers[i].timeSpent}s</span>
                   </div>
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4" dangerouslySetInnerHTML={{ __html: q.question }} />
                   
                   <div className="grid gap-2">
                     {q.all_answers?.map((ans, idx) => {
                       const isSelected = userAnswer === ans;
                       const isActualCorrect = ans === q.correct_answer;
                       
                       let bgClass = 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300';
                       if (isActualCorrect) bgClass = 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-300 font-bold';
                       else if (isSelected) bgClass = 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300';

                       return (
                         <div key={idx} className={`p-3 rounded-lg border ${bgClass} flex justify-between items-center transition`}>
                           <span dangerouslySetInnerHTML={{ __html: ans }} />
                           {isActualCorrect && <CheckCircle size={18} className="text-green-600 dark:text-green-400" />}
                           {isSelected && !isActualCorrect && <XCircle size={18} className="text-red-600 dark:text-red-400" />}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               );
            })}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Results;