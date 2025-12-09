import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Loader, AlertCircle, ExternalLink, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { Book, searchBooksBySubject } from '../services/googleBooks';
import { saveBookForUser, removeBookForUser, isBookSaved } from '../services/savedBooksService';
import { useAuth } from '../contexts/AuthContext';

interface Category {
    key: string;
    name: string;
    icon: string;
    color: string;
    subtopics: Subtopic[];
}

interface Subtopic {
    key: string;
    name: string;
}

const CATEGORIES: Category[] = [
    {
        key: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'bg-gradient-to-br from-blue-500 to-blue-700',
        subtopics: [
            { key: 'science-physics', name: 'Physics' },
            { key: 'science-chemistry', name: 'Chemistry' },
            { key: 'science-biology', name: 'Biology' },
            { key: 'science-mathematics', name: 'Mathematics' },
        ]
    },
    {
        key: 'cs',
        name: 'Computer Science',
        icon: '💻',
        color: 'bg-gradient-to-br from-purple-500 to-purple-700',
        subtopics: [
            { key: 'cs-languages', name: 'Programming Languages' },
            { key: 'cs-dsa', name: 'Data Structures & Algorithms' },
            { key: 'cs-software-eng', name: 'Software Engineering' },
            { key: 'cs-databases', name: 'Databases' },
            { key: 'cs-networking', name: 'Computer Networks' },
            { key: 'cs-os', name: 'Operating Systems' },
            { key: 'cs-web', name: 'Web Development' },
        ]
    },
    {
        key: 'arts',
        name: 'Arts & Humanities',
        icon: '🎨',
        color: 'bg-gradient-to-br from-pink-500 to-pink-700',
        subtopics: [
            { key: 'arts-history', name: 'History' },
            { key: 'arts-geography', name: 'Geography' },
            { key: 'arts-political', name: 'Political Science' },
            { key: 'arts-sociology', name: 'Sociology' },
            { key: 'arts-philosophy', name: 'Philosophy' },
            { key: 'arts-literature', name: 'Literature' },
            { key: 'arts-psychology', name: 'Psychology' },
        ]
    },
    {
        key: 'commerce',
        name: 'Commerce & Business',
        icon: '💼',
        color: 'bg-gradient-to-br from-green-500 to-green-700',
        subtopics: [
            { key: 'commerce-accounting', name: 'Accounting' },
            { key: 'commerce-business', name: 'Business Studies' },
            { key: 'commerce-economics', name: 'Economics' },
            { key: 'commerce-finance', name: 'Finance & Banking' },
            { key: 'commerce-marketing', name: 'Marketing' },
            { key: 'commerce-management', name: 'Management' },
        ]
    },
    {
        key: 'gk',
        name: 'General Knowledge',
        icon: '🌍',
        color: 'bg-gradient-to-br from-orange-500 to-orange-700',
        subtopics: [
            { key: 'gk-world-affairs', name: 'World Affairs & Current Events' },
            { key: 'gk-indian-history', name: 'Indian History' },
            { key: 'gk-world-history', name: 'World History' },
            { key: 'gk-geography', name: 'Geography & Environment' },
            { key: 'gk-polity', name: 'Indian Polity & Governance' },
            { key: 'gk-economy', name: 'Indian Economy' },
            { key: 'gk-science-tech', name: 'Science & Technology' },
            { key: 'gk-sports', name: 'Sports & Games' },
            { key: 'gk-awards', name: 'Awards & Honors' },
            { key: 'gk-books-authors', name: 'Books & Authors' },
        ]
    },
    {
        key: 'reasoning',
        name: 'Reasoning',
        icon: '🧩',
        color: 'bg-gradient-to-br from-teal-500 to-cyan-700',
        subtopics: [
            { key: 'reasoning-logical', name: 'Logical Reasoning' },
            { key: 'reasoning-verbal', name: 'Verbal Reasoning' },
            { key: 'reasoning-non-verbal', name: 'Non-Verbal Reasoning' },
            { key: 'reasoning-analytical', name: 'Analytical Reasoning' },
            { key: 'reasoning-critical', name: 'Critical Thinking' },
            { key: 'reasoning-puzzles', name: 'Puzzles & Brain Teasers' },
            { key: 'reasoning-data-interpretation', name: 'Data Interpretation' },
            { key: 'reasoning-pattern', name: 'Pattern Recognition' },
            { key: 'reasoning-series', name: 'Number & Letter Series' },
        ]
    },
];

const Study: React.FC = () => {
    const { currentUser } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedBookIds, setSavedBookIds] = useState<Set<string>>(new Set());
    const [savingBookId, setSavingBookId] = useState<string | null>(null);

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category);
        setSelectedSubtopic(null);
        setBooks([]);
        setError(null);
    };

    const handleSubtopicClick = async (subtopicKey: string) => {
        setSelectedSubtopic(subtopicKey);
        setError(null);
        setLoading(true);

        try {
            const results = await searchBooksBySubject(subtopicKey, 20);
            setBooks(results);

            if (currentUser) {
                // Check which books are already saved
                const savedIds = new Set<string>();
                for (const book of results) {
                    const saved = await isBookSaved(currentUser.uid, book.id);
                    if (saved) savedIds.add(book.id);
                }
                setSavedBookIds(savedIds);
            }
        } catch (err: any) {
            console.error('Error fetching books:', err);
            setError('Failed to load books. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBook = async (book: Book) => {
        if (!currentUser) {
            alert('Please log in to save books to your library');
            return;
        }

        if (!selectedSubtopic) return;

        setSavingBookId(book.id);

        try {
            if (savedBookIds.has(book.id)) {
                await removeBookForUser(currentUser.uid, book.id);
                setSavedBookIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(book.id);
                    return newSet;
                });
            } else {
                await saveBookForUser(currentUser.uid, book.id, {
                    title: book.title,
                    authors: book.authors,
                    thumbnail: book.thumbnail,
                    infoLink: book.infoLink,
                    subjectKey: selectedSubtopic,
                });
                setSavedBookIds(prev => new Set(prev).add(book.id));
            }
        } catch (error) {
            console.error('Error saving book:', error);
            alert('Failed to save book. Please try again.');
        } finally {
            setSavingBookId(null);
        }
    };

    const handleBack = () => {
        if (selectedSubtopic) {
            setSelectedSubtopic(null);
            setBooks([]);
            setError(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        }
    };

    const getCurrentSubtopicName = () => {
        if (!selectedCategory || !selectedSubtopic) return '';
        const subtopic = selectedCategory.subtopics.find(s => s.key === selectedSubtopic);
        return subtopic?.name || '';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8 px-4 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                        // Main Categories View
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Study Resources</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Explore books across different subjects from Google Books
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {CATEGORIES.map((category) => (
                                    <motion.button
                                        key={category.key}
                                        onClick={() => handleCategoryClick(category)}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`relative overflow-hidden rounded-2xl p-8 text-left shadow-lg hover:shadow-xl transition-shadow ${category.color} group`}
                                    >
                                        <div className="relative z-10">
                                            <div className="text-5xl mb-4">{category.icon}</div>
                                            <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                                            <p className="text-white/80 text-sm">
                                                {category.subtopics.length} topics available
                                            </p>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : !selectedSubtopic ? (
                        // Subtopics View - MODERN REDESIGN
                        <motion.div
                            key="subtopics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <button
                                onClick={handleBack}
                                className="flex items-center text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 group transition-all"
                            >
                                <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
                                Back to Categories
                            </button>

                            {/* Header Section */}
                            <div className="mb-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`${selectedCategory.color} w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg`}>
                                        {selectedCategory.icon}
                                    </div>
                                    <div>
                                        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">
                                            {selectedCategory.name}
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                                            Explore {selectedCategory.subtopics.length} topics • Find books and resources
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modern Grid Layout */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {selectedCategory.subtopics.map((subtopic, index) => (
                                    <motion.button
                                        key={subtopic.key}
                                        onClick={() => handleSubtopicClick(subtopic.key)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative group bg-white dark:bg-darkcard rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary/30"
                                    >
                                        {/* Gradient Overlay */}
                                        <div className={`absolute inset-0 ${selectedCategory.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                        {/* Animated Corner Accent */}
                                        <div className={`absolute top-0 right-0 w-24 h-24 ${selectedCategory.color} opacity-10 rounded-bl-full transform translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-300`} />

                                        {/* Content */}
                                        <div className="relative p-6 text-left h-full flex flex-col">
                                            {/* Icon/Number Badge */}
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${selectedCategory.color} text-white font-bold text-lg mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                                {index + 1}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors duration-300">
                                                {subtopic.name}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">
                                                Browse curated books and resources
                                            </p>

                                            {/* Book Icon with Animation */}
                                            <div className="flex items-center text-primary dark:text-blue-400 font-semibold text-sm group-hover:gap-2 gap-1 transition-all duration-300">
                                                <BookOpen className="w-4 h-4 group-hover:animate-pulse" />
                                                <span>Explore Books</span>
                                                <motion.span
                                                    className="inline-block"
                                                    initial={{ x: 0 }}
                                                    animate={{ x: [0, 4, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    →
                                                </motion.span>
                                            </div>
                                        </div>

                                        {/* Shine Effect on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        // Books View
                        <motion.div
                            key="books"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <button
                                onClick={handleBack}
                                className="flex items-center text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4 group"
                            >
                                <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
                                Back to Topics
                            </button>

                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {getCurrentSubtopicName()}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Books from Google Books
                            </p>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-6 mb-8">
                                    <div className="flex items-start">
                                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">Error Loading Books</h3>
                                            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="flex items-center justify-center py-20">
                                    <Loader className="animate-spin h-12 w-12 text-primary" />
                                </div>
                            )}

                            {!loading && !error && books.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {books.map((book) => (
                                        <motion.div
                                            key={book.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white dark:bg-darkcard rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 overflow-hidden"
                                        >
                                            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden flex items-center justify-center">
                                                {book.thumbnail ? (
                                                    <img
                                                        src={book.thumbnail}
                                                        alt={book.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                                                    {book.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                                                    {book.authors.join(', ') || 'Unknown Author'}
                                                </p>
                                                {book.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 line-clamp-2">
                                                        {book.description}
                                                    </p>
                                                )}
                                                <div className="flex gap-2">
                                                    <a
                                                        href={book.infoLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        <ExternalLink size={14} className="mr-1" />
                                                        Read
                                                    </a>
                                                    <button
                                                        onClick={() => handleSaveBook(book)}
                                                        disabled={savingBookId === book.id}
                                                        className={`flex items-center justify-center px-3 py-2 text-sm rounded-lg transition ${savedBookIds.has(book.id)
                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        {savingBookId === book.id ? (
                                                            <Loader className="animate-spin" size={14} />
                                                        ) : savedBookIds.has(book.id) ? (
                                                            <BookmarkCheck size={14} />
                                                        ) : (
                                                            <BookmarkPlus size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {!loading && !error && books.length === 0 && (
                                <div className="text-center py-20">
                                    <BookOpen className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        No books found
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Try selecting a different topic
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Study;
