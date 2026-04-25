/**
 * Question Card Component
 * Used in Upload Quiz form for adding/editing individual questions
 */

import React from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestionData {
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface QuestionCardProps {
  index: number;
  data: QuestionData;
  onChange: (index: number, data: QuestionData) => void;
  onDelete: (index: number) => void;
  errors?: Record<string, string>;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ index, data, onChange, onDelete, errors }) => {
  const handleFieldChange = (field: keyof QuestionData, value: any) => {
    onChange(index, { ...data, [field]: value });
  };

  const handleOptionChange = (optIndex: number, value: string) => {
    const newOptions = [...data.options];
    newOptions[optIndex] = value;
    onChange(index, { ...data, options: newOptions });
  };

  const optLabels = ['A', 'B', 'C', 'D'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <GripVertical size={18} className="text-gray-400" />
          <span className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Question {index + 1}</span>
        </div>
        <button
          onClick={() => onDelete(index)}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Question Text *</label>
        <textarea
          value={data.questionText}
          onChange={(e) => handleFieldChange('questionText', e.target.value)}
          placeholder="Enter the question..."
          rows={3}
          className={`w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 ${
            errors?.questionText ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
          } rounded-xl text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
        />
        {errors?.questionText && <p className="text-xs text-red-500 mt-1">{errors.questionText}</p>}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-5">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Options *</label>
        {data.options.map((opt, optIdx) => (
          <div key={optIdx} className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              data.correctOption === optIdx
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}>
              {optLabels[optIdx]}
            </span>
            <input
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(optIdx, e.target.value)}
              placeholder={`Option ${optLabels[optIdx]}`}
              className={`flex-1 p-3 bg-gray-50 dark:bg-gray-700 border-2 ${
                errors?.[`option${optIdx}`] ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
              } rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
            />
          </div>
        ))}
      </div>

      {/* Correct Answer */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Correct Answer *</label>
        <div className="flex gap-3">
          {optLabels.map((label, optIdx) => (
            <button
              key={optIdx}
              type="button"
              onClick={() => handleFieldChange('correctOption', optIdx)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${
                data.correctOption === optIdx
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation (optional) */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Explanation <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={data.explanation}
          onChange={(e) => handleFieldChange('explanation', e.target.value)}
          placeholder="Why is this the correct answer?"
          rows={2}
          className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        />
      </div>
    </motion.div>
  );
};

export default QuestionCard;
