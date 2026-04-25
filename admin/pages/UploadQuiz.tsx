/**
 * Upload Quiz Page
 * Two-step quiz creation: metadata → questions
 * Supports manual question entry and JSON import
 */

import React, { useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import QuestionCard from '../components/QuestionCard';
import { createAdminQuiz, AdminQuizQuestion } from '../utils/adminFirestore';
import { logAdminAction } from '../utils/adminLogger';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Plus, Save, Send, Upload, FileJson, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const QUIZ_CATEGORIES = [
  'General Knowledge', 'Science & Nature', 'Science: Computers',
  'Science: Mathematics', 'Entertainment: Books', 'Entertainment: Film',
  'Entertainment: Music', 'Entertainment: Television', 'Entertainment: Video Games',
  'Entertainment: Board Games', 'Geography', 'History', 'Art',
  'Celebrities', 'Animals', 'Vehicles', 'Entertainment: Comics',
  'Science: Gadgets', 'Entertainment: Anime & Manga', 'Entertainment: Cartoons',
  'Sports', 'Mythology', 'Politics', 'Custom',
];

interface QuestionFormData {
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

const blankQuestion = (): QuestionFormData => ({
  questionText: '',
  options: ['', '', '', ''],
  correctOption: 0,
  explanation: '',
});

const UploadQuiz: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — Metadata
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [hasTimeRestriction, setHasTimeRestriction] = useState(false);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [publishNow, setPublishNow] = useState(false);

  // Step 2 — Questions
  const [questions, setQuestions] = useState<QuestionFormData[]>([blankQuestion()]);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  // Status
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuestionChange = (index: number, data: QuestionFormData) => {
    const updated = [...questions];
    updated[index] = data;
    setQuestions(updated);
    // Clear errors for this question
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setQuestions([...questions, blankQuestion()]);
  };

  const validateStep1 = (): boolean => {
    if (!title.trim()) { setErrorMsg('Quiz title is required'); return false; }
    if (!category) { setErrorMsg('Please select a category'); return false; }
    setErrorMsg('');
    return true;
  };

  const validateQuestions = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};
    let valid = true;
    const questionTexts = new Set<string>();

    questions.forEach((q, i) => {
      const qErrors: Record<string, string> = {};

      if (!q.questionText.trim()) {
        qErrors.questionText = 'Question text is required';
        valid = false;
      } else if (questionTexts.has(q.questionText.trim().toLowerCase())) {
        qErrors.questionText = 'Duplicate question text';
        valid = false;
      } else {
        questionTexts.add(q.questionText.trim().toLowerCase());
      }

      q.options.forEach((opt, optIdx) => {
        if (!opt.trim()) {
          qErrors[`option${optIdx}`] = `Option ${['A', 'B', 'C', 'D'][optIdx]} is required`;
          valid = false;
        }
      });

      if (Object.keys(qErrors).length > 0) {
        newErrors[i] = qErrors;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async (publish: boolean) => {
    if (!validateQuestions()) {
      setErrorMsg('Please fix the errors in your questions');
      return;
    }

    if (publish && questions.length < 5) {
      setErrorMsg('Minimum 5 questions required to publish');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const quizQuestions: AdminQuizQuestion[] = questions.map((q) => ({
        questionId: uuidv4(),
        questionText: q.questionText.trim(),
        options: q.options.map(o => o.trim()),
        correctOption: q.correctOption,
        explanation: q.explanation.trim() || undefined,
      }));

      const quizId = await createAdminQuiz({
        title: title.trim(),
        category: category.trim(),
        difficulty,
        timeLimitMinutes: Number(timeLimitMinutes) || 10,
        negativeMarking: negativeMarking === true,
        hasTimeRestriction,
        // Converting datetime-local strings to Date objects (which firebase automatically handles or converts to Timestamp if supported directly by setDoc when passed Date)
        availableFrom: hasTimeRestriction && availableFrom ? new Date(availableFrom) : null,
        availableUntil: hasTimeRestriction && availableUntil ? new Date(availableUntil) : null,
        createdBy: adminUser?.uid || '',
        isPublished: publish,
        totalQuestions: questions.length,
        questions: quizQuestions,
      });

      await logAdminAction({
        action: publish ? 'QUIZ_PUBLISHED' : 'QUIZ_CREATED',
        performedBy: adminUser?.uid || '',
        performedByEmail: adminUser?.email || '',
        details: `Quiz "${title}" (${questions.length} questions) ${publish ? 'published' : 'saved as draft'}`,
      });

      setSuccess(true);
    } catch (error: any) {
      console.error('UPLOAD ERROR CODE:', error.code);
      console.error('UPLOAD ERROR MSG:', error.message);
      setErrorMsg("Upload failed: " + (error.code || "unknown") + " — " + (error.message || error.toString()));
    } finally {
      setSaving(false);
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error('JSON must be an array');

        const imported: QuestionFormData[] = parsed.map((item: any) => ({
          questionText: item.question || item.questionText || '',
          options: item.options || ['', '', '', ''],
          correctOption: typeof item.correct === 'number' ? item.correct : (item.correctOption || 0),
          explanation: item.explanation || '',
        }));

        setQuestions(imported);
        setErrorMsg('');
      } catch (err) {
        setErrorMsg('Invalid JSON format. Please check the file structure.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Success screen
  if (success) {
    return (
      <AdminLayout title="Upload Quiz">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Quiz Saved!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Your quiz has been saved successfully.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setSuccess(false);
                setStep(1);
                setTitle('');
                setCategory('');
                setDifficulty('medium');
                setQuestions([blankQuestion()]);
                setPublishNow(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg"
            >
              Create Another Quiz
            </button>
            <button
              onClick={() => window.location.href = '/#/admin/manage-quizzes'}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl"
            >
              View All Quizzes
            </button>
          </div>
        </motion.div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Upload Quiz">
      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= s
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {s}
            </div>
            <span className={`text-sm font-bold ${step >= s ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {s === 1 ? 'Quiz Details' : 'Add Questions'}
            </span>
            {s === 1 && <ChevronRight size={16} className="text-gray-400 mx-2" />}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">{errorMsg}</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Metadata */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8 max-w-2xl"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quiz Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title e.g. Indian History Challenge"
                  maxLength={100}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                <input
                  type="text"
                  placeholder="Enter category e.g. Science, History, Custom Topic"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={60}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Difficulty *</label>
                <div className="flex gap-3">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm capitalize transition ${
                        difficulty === d
                          ? d === 'easy' ? 'bg-green-500 text-white shadow-lg'
                            : d === 'medium' ? 'bg-yellow-500 text-white shadow-lg'
                            : 'bg-red-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Time Limit (in minutes) *</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="e.g. 15"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Negative Marking</label>
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setNegativeMarking(prev => !prev)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${negativeMarking ? "bg-purple-600" : "bg-gray-400 dark:bg-gray-600"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${negativeMarking ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">{negativeMarking ? "ON" : "OFF"}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {negativeMarking
                      ? "Correct = +1 mark | Wrong = −0.25 marks"
                      : "Correct = +1 mark | Wrong = 0 marks"}
                  </p>
                </div>
              </div>

              {/* Quiz Availability Window */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-transparent">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-gray-900 dark:text-white">Restrict quiz to a specific time window</label>
                  <button
                    type="button"
                    onClick={() => setHasTimeRestriction(prev => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${hasTimeRestriction ? "bg-purple-600" : "bg-gray-400 dark:bg-gray-600"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasTimeRestriction ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                
                {hasTimeRestriction && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Quiz opens at *</label>
                      <input
                        type="datetime-local"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Quiz closes at (optional)</label>
                      <input
                        type="datetime-local"
                        value={availableUntil}
                        onChange={(e) => setAvailableUntil(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave blank if quiz never expires</p>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <input
                  type="checkbox"
                  id="publishNow"
                  checked={publishNow}
                  onChange={(e) => setPublishNow(e.target.checked)}
                  className="w-5 h-5 accent-purple-600"
                />
                <label htmlFor="publishNow" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Publish immediately after saving
                </label>
              </div>

              <button
                onClick={() => { if (validateStep1()) setStep(2); }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition"
              >
                Next: Add Questions <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Top Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300">
                <ChevronLeft size={16} /> Back
              </button>
              <div className="hidden sm:block flex-1" />
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                <span className="font-bold text-gray-900 dark:text-white">{questions.length}</span> questions
              </div>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleJsonImport} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-sm"
              >
                <FileJson size={16} /> Import JSON
              </button>
            </div>

            {/* Question Cards */}
            <div className="space-y-6 mb-8">
              <AnimatePresence>
                {questions.map((q, i) => (
                  <QuestionCard
                    key={i}
                    index={i}
                    data={q}
                    onChange={handleQuestionChange}
                    onDelete={handleDeleteQuestion}
                    errors={errors[i]}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Add Question */}
            <button
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition mb-8"
            >
              <Plus size={20} /> Add Another Question
            </button>

            {/* Save/Publish Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition"
              >
                {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                Save as Draft
              </button>
              <button
                onClick={() => handleSave(publishNow || true)}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-xl disabled:opacity-50 transition"
              >
                {saving ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
                Publish Quiz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default UploadQuiz;
