/**
 * Upload Quiz Page
 * Two-step quiz creation: metadata → questions
 * Supports manual question entry and JSON import
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import QuestionCard from '../components/QuestionCard';
import { createAdminQuiz, AdminQuizQuestion, getAllQuizFolders, createQuizFolder, buildFolderPath, getSortedFolderTree, QuizFolder } from '../utils/adminFirestore';
import { logAdminAction } from '../utils/adminLogger';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Plus, Save, Send, Upload, FileJson, Loader, CheckCircle, AlertTriangle, FolderOpen, FolderPlus, HelpCircle, Copy, Check, Layers } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const SAMPLE_SECTION_FLAT = `[
  {
    "section": "General Knowledge",
    "question": "Who was the first President of India?",
    "options": ["Dr. Rajendra Prasad", "Jawaharlal Nehru", "Dr. S. Radhakrishnan", "Mahatma Gandhi"],
    "correct": 0,
    "explanation": "Dr. Rajendra Prasad served as the first President of India."
  },
  {
    "section": "Reasoning",
    "question": "Find the odd one out from the options:",
    "options": ["Apple", "Mango", "Carrot", "Banana"],
    "correct": 2,
    "explanation": "Carrot is a vegetable, others are fruits."
  },
  {
    "section": "Maths",
    "question": "If 2x + 6 = 20, what is the value of x?",
    "options": ["5", "7", "8", "6"],
    "correct": 1,
    "explanation": "2x = 14 => x = 7."
  },
  {
    "section": "English",
    "question": "Select the synonym of 'Abundant':",
    "options": ["Plentiful", "Scarce", "Rare", "Insufficient"],
    "correct": 0,
    "explanation": "Abundant means plentiful."
  }
]`;

const SAMPLE_SECTION_GROUPED = `{
  "sections": [
    {
      "name": "General Knowledge",
      "questions": [
        {
          "question": "Who was the first President of India?",
          "options": ["Dr. Rajendra Prasad", "Jawaharlal Nehru", "Dr. S. Radhakrishnan", "Mahatma Gandhi"],
          "correct": 0,
          "explanation": "Dr. Rajendra Prasad served as the first President."
        }
      ]
    },
    {
      "name": "Reasoning",
      "questions": [
        {
          "question": "Find the odd one out from the options:",
          "options": ["Apple", "Mango", "Carrot", "Banana"],
          "correct": 2,
          "explanation": "Carrot is a vegetable, others are fruits."
        }
      ]
    },
    {
      "name": "Maths",
      "questions": [
        {
          "question": "If 2x + 6 = 20, what is the value of x?",
          "options": ["5", "7", "8", "6"],
          "correct": 1,
          "explanation": "2x = 14 => x = 7."
        }
      ]
    },
    {
      "name": "English",
      "questions": [
        {
          "question": "Select the synonym of 'Abundant':",
          "options": ["Plentiful", "Scarce", "Rare", "Insufficient"],
          "correct": 0,
          "explanation": "Abundant means plentiful."
        }
      ]
    }
  ]
}`;

const SAMPLE_NON_SECTION = `[
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "Madrid", "Paris", "Rome"],
    "correct": 2,
    "explanation": "Paris is the capital of France."
  },
  {
    "question": "Which planet is known as the Red Planet?",
    "options": ["Earth", "Mars", "Jupiter", "Venus"],
    "correct": 1,
    "explanation": "Mars appears reddish due to iron oxide."
  }
]`;

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
  section?: string;
}

const blankQuestion = (section?: string): QuestionFormData => ({
  questionText: '',
  options: ['', '', '', ''],
  correctOption: 0,
  explanation: '',
  section: section || '',
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
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');
  const [showJsonGuide, setShowJsonGuide] = useState<boolean>(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Folder selection
  const [folders, setFolders] = useState<QuizFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Status
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load folders
  useEffect(() => {
    const loadFolders = async () => {
      const data = await getAllQuizFolders();
      setFolders(data);
    };
    loadFolders();
  }, []);

  const sortedFolderTree = useMemo(() => getSortedFolderTree(folders), [folders]);
  const selectedFolder = useMemo(() => folders.find(f => f.id === selectedFolderId), [folders, selectedFolderId]);
  const parentFolder = useMemo(() => folders.find(f => f.id === newFolderParentId), [folders, newFolderParentId]);
  const previewPath = useMemo(() => {
    if (!newFolderName.trim()) return '';
    if (!parentFolder) return newFolderName.trim();
    return `${buildFolderPath(parentFolder.id, folders)} / ${newFolderName.trim()}`;
  }, [newFolderName, parentFolder, folders]);

  const existingSections = useMemo(() => {
    const list = questions.map(q => q.section?.trim()).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [questions]);

  const filteredQuestionsWithIndices = useMemo(() => {
    return questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => {
        if (activeSectionFilter === 'all') return true;
        return (q.section?.trim() || '') === activeSectionFilter;
      });
  }, [questions, activeSectionFilter]);

  const handleCopyTemplate = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !adminUser) return;
    setCreatingFolder(true);
    try {
      const newId = await createQuizFolder(newFolderName.trim(), newFolderParentId, adminUser.uid);
      const updated = await getAllQuizFolders();
      setFolders(updated);
      setSelectedFolderId(newId);
      setNewFolderName('');
      setNewFolderParentId(null);
      setShowCreateFolder(false);
    } catch (err) {
      setErrorMsg('Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

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

  const addQuestion = (sec?: string) => {
    const defaultSec = sec || (activeSectionFilter !== 'all' ? activeSectionFilter : '');
    setQuestions([...questions, blankQuestion(defaultSec)]);
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
      const sectionsList = Array.from(
        new Set(questions.map(q => q.section?.trim()).filter(Boolean))
      ) as string[];

      const quizQuestions: AdminQuizQuestion[] = questions.map((q) => ({
        questionId: uuidv4(),
        questionText: q.questionText.trim(),
        options: q.options.map(o => o.trim()),
        correctOption: q.correctOption,
        explanation: q.explanation.trim() || undefined,
        section: q.section?.trim() || undefined,
      }));

      const folderPath = selectedFolderId ? buildFolderPath(selectedFolderId, folders) : 'Other Quizzes';

      const quizId = await createAdminQuiz({
        title: title.trim(),
        category: category.trim(),
        difficulty,
        timeLimitMinutes: Number(timeLimitMinutes) || 10,
        negativeMarking: negativeMarking === true,
        hasTimeRestriction,
        // Converting datetime-local strings to Date objects
        availableFrom: hasTimeRestriction && availableFrom ? new Date(availableFrom) : null,
        availableUntil: hasTimeRestriction && availableUntil ? new Date(availableUntil) : null,
        createdBy: adminUser?.uid || '',
        isPublished: publish,
        totalQuestions: questions.length,
        questions: quizQuestions,
        sections: sectionsList,
        folderId: selectedFolderId || null,
        folderPath,
      });

      await logAdminAction({
        action: publish ? 'QUIZ_PUBLISHED' : 'QUIZ_CREATED',
        performedBy: adminUser?.uid || '',
        performedByEmail: adminUser?.email || '',
        details: `Quiz "${title}" (${questions.length} questions${sectionsList.length > 0 ? `, ${sectionsList.length} sections` : ''}) ${publish ? 'published' : 'saved as draft'}`,
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
        const raw = JSON.parse(event.target?.result as string);
        let imported: QuestionFormData[] = [];

        // Check Format A: Grouped { sections: [ { name: "...", questions: [...] } ] }
        if (raw && typeof raw === 'object' && Array.isArray(raw.sections)) {
          for (const sec of raw.sections) {
            const secName = (sec.name || sec.title || sec.section || '').trim();
            const qList = Array.isArray(sec.questions) ? sec.questions : [];
            for (const item of qList) {
              imported.push({
                questionText: item.question || item.questionText || '',
                options: item.options || ['', '', '', ''],
                correctOption: typeof item.correct === 'number' ? item.correct : (item.correctOption || 0),
                explanation: item.explanation || '',
                section: (item.section || item.sectionName || secName || '').trim(),
              });
            }
          }
        }
        // Check Format B: Object with questions array { questions: [...] }
        else if (raw && typeof raw === 'object' && Array.isArray(raw.questions)) {
          imported = raw.questions.map((item: any) => ({
            questionText: item.question || item.questionText || '',
            options: item.options || ['', '', '', ''],
            correctOption: typeof item.correct === 'number' ? item.correct : (item.correctOption || 0),
            explanation: item.explanation || '',
            section: (item.section || item.sectionName || item.sectionTitle || '').trim(),
          }));
        }
        // Check Format C: Flat array [ { question: "...", section?: "..." } ]
        else if (Array.isArray(raw)) {
          imported = raw.map((item: any) => ({
            questionText: item.question || item.questionText || '',
            options: item.options || ['', '', '', ''],
            correctOption: typeof item.correct === 'number' ? item.correct : (item.correctOption || 0),
            explanation: item.explanation || '',
            section: (item.section || item.sectionName || item.sectionTitle || '').trim(),
          }));
        } else {
          throw new Error('Unrecognized JSON structure. Please use one of the supported formats.');
        }

        if (imported.length === 0) {
          throw new Error('No valid questions found in JSON file.');
        }

        setQuestions(imported);
        setActiveSectionFilter('all');
        setErrorMsg('');
      } catch (err: any) {
        setErrorMsg(err.message || 'Invalid JSON format. Please check the file structure.');
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

              {/* Save to Folder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <FolderOpen size={16} className="text-purple-500" />
                    Save to Folder
                  </label>
                  {selectedFolder && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">
                      📂 {buildFolderPath(selectedFolder.id, folders)}
                    </span>
                  )}
                </div>

                <select
                  value={selectedFolderId || ''}
                  onChange={(e) => setSelectedFolderId(e.target.value || null)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  <option value="">📁 Other Quizzes (Uncategorized)</option>
                  {sortedFolderTree.map(({ folder, path, depth }) => (
                    <option key={folder.id} value={folder.id}>
                      {'\u00A0\u00A0'.repeat(depth)}📂 {depth > 0 ? '└─ ' : ''}{folder.name} ({path})
                    </option>
                  ))}
                </select>

                {/* Create Folder / Subfolder Actions */}
                {!showCreateFolder ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewFolderParentId(null);
                        setNewFolderName('');
                        setShowCreateFolder(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
                    >
                      <FolderPlus size={14} /> + New Root Folder
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewFolderParentId(selectedFolderId || null);
                        setNewFolderName('');
                        setShowCreateFolder(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                    >
                      <FolderPlus size={14} />
                      {selectedFolder ? `+ New Subfolder in "${selectedFolder.name}"` : '+ New Subfolder'}
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-4 bg-purple-50/70 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <FolderPlus size={15} /> Create Folder or Subfolder
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowCreateFolder(false)}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Parent Folder (leave empty to create at Root Level)
                      </label>
                      <select
                        value={newFolderParentId || ''}
                        onChange={(e) => setNewFolderParentId(e.target.value || null)}
                        className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white font-medium"
                      >
                        <option value="">📁 None (Create as Root Level Folder)</option>
                        {sortedFolderTree.map(({ folder, path, depth }) => (
                          <option key={folder.id} value={folder.id}>
                            {'\u00A0\u00A0'.repeat(depth)}📂 {depth > 0 ? '└─ ' : ''}{path}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        To create a subfolder inside a subfolder (e.g. SSC &gt; SSC CGL &gt; Chapterwise), choose its parent here.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Folder Name *
                      </label>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="e.g. SSC CGL or Chapterwise or Full Length"
                        maxLength={50}
                        className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white font-medium focus:border-purple-500 outline-none"
                      />
                    </div>

                    {previewPath ? (
                      <div className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900/50">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-semibold">New Folder Path:</span>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">📂 {previewPath}</span>
                      </div>
                    ) : null}

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCreateFolder(false)}
                        className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateFolder}
                        disabled={creatingFolder || !newFolderName.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg disabled:opacity-50 transition flex items-center gap-1.5 shadow"
                      >
                        {creatingFolder ? <Loader className="animate-spin" size={13} /> : <FolderPlus size={13} />}
                        Create &amp; Select
                      </button>
                    </div>
                  </motion.div>
                )}
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
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                <ChevronLeft size={16} /> Back
              </button>
              <div className="hidden sm:block flex-1" />
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                <span className="font-bold text-gray-900 dark:text-white">{questions.length}</span> questions
                {existingSections.length > 0 && (
                  <span className="ml-1 text-xs text-purple-600 dark:text-purple-400 font-bold">
                    • {existingSections.length} sections
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowJsonGuide(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-bold text-sm border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
              >
                <HelpCircle size={16} /> JSON Format Guide
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleJsonImport} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-sm hover:bg-blue-200 dark:hover:bg-blue-800/40 transition"
              >
                <FileJson size={16} /> Import JSON
              </button>
            </div>

            {/* Section Filter Pills (if quiz has sections) */}
            {existingSections.length > 0 && (
              <div className="mb-6 p-3 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 px-2 flex items-center gap-1 flex-shrink-0">
                  <Layers size={14} /> Filter by Section:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSectionFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                    activeSectionFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Questions ({questions.length})
                </button>
                {existingSections.map((sec) => {
                  const count = questions.filter(q => (q.section?.trim() || '') === sec).length;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setActiveSectionFilter(sec)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                        activeSectionFilter === sec
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {sec} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Question Cards */}
            <div className="space-y-6 mb-8">
              <AnimatePresence>
                {filteredQuestionsWithIndices.map(({ q, idx }) => (
                  <QuestionCard
                    key={idx}
                    index={idx}
                    data={q}
                    onChange={handleQuestionChange}
                    onDelete={handleDeleteQuestion}
                    errors={errors[idx]}
                    availableSections={existingSections}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Add Question */}
            <button
              onClick={() => addQuestion()}
              className="w-full py-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition mb-8"
            >
              <Plus size={20} />
              {activeSectionFilter !== 'all' ? `Add Question to "${activeSectionFilter}"` : 'Add Another Question'}
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

      {/* JSON Format Guide Modal */}
      <AnimatePresence>
        {showJsonGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <FileJson className="text-purple-600" /> JSON Import Formats
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Upload Section-Wise or Regular quizzes using either of the formats below.
                  </p>
                </div>
                <button
                  onClick={() => setShowJsonGuide(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-6">
                {/* Format 1: Section Flat List */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                        Recommended
                      </span>
                      <strong className="text-sm text-gray-900 dark:text-white">Format 1: Section-Wise (with "section" key)</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(SAMPLE_SECTION_FLAT, 'sec_flat')}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg shadow hover:bg-purple-700 transition"
                    >
                      {copiedTemplate === 'sec_flat' ? <Check size={14} /> : <Copy size={14} />}
                      {copiedTemplate === 'sec_flat' ? 'Copied!' : 'Copy Template'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Add a <code className="text-purple-600 dark:text-purple-400 font-bold">"section"</code> property to each question. E.g. General Knowledge, Reasoning, Maths, English.
                  </p>
                  <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-xl overflow-x-auto font-mono">
                    {SAMPLE_SECTION_FLAT}
                  </pre>
                </div>

                {/* Format 2: Grouped sections */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm text-gray-900 dark:text-white">Format 2: Section-Wise (Grouped by Sections)</strong>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(SAMPLE_SECTION_GROUPED, 'sec_grouped')}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg shadow hover:bg-purple-700 transition"
                    >
                      {copiedTemplate === 'sec_grouped' ? <Check size={14} /> : <Copy size={14} />}
                      {copiedTemplate === 'sec_grouped' ? 'Copied!' : 'Copy Template'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    A top-level object with a <code className="text-purple-600 dark:text-purple-400 font-bold">"sections"</code> array containing section objects.
                  </p>
                  <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-xl overflow-x-auto font-mono">
                    {SAMPLE_SECTION_GROUPED}
                  </pre>
                </div>

                {/* Format 3: Non-section */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm text-gray-900 dark:text-white">Format 3: Non-Section Quiz (Standard Single List)</strong>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(SAMPLE_NON_SECTION, 'non_sec')}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg shadow hover:bg-purple-700 transition"
                    >
                      {copiedTemplate === 'non_sec' ? <Check size={14} /> : <Copy size={14} />}
                      {copiedTemplate === 'non_sec' ? 'Copied!' : 'Copy Template'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Regular quiz with no sections. Questions run continuously.
                  </p>
                  <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-xl overflow-x-auto font-mono">
                    {SAMPLE_NON_SECTION}
                  </pre>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowJsonGuide(false)}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default UploadQuiz;
