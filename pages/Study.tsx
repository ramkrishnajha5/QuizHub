import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Loader, AlertCircle, ExternalLink, BookmarkPlus, BookmarkCheck, Library, ArrowRight } from 'lucide-react';
import { Book, searchBooksBySubject } from '../services/googleBooks';
import { saveBookForUser, removeBookForUser, isBookSaved } from '../services/savedBooksService';
import { useAuth } from '../contexts/AuthContext';

interface Category {
    key: string;
    name: string;
    icon: string;
    gradient: string;
    iconBg: string;
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
        gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
        iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-600',
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
        gradient: 'from-purple-400 via-pink-500 to-rose-500',
        iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
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
        gradient: 'from-pink-400 via-rose-500 to-red-500',
        iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
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
        gradient: 'from-green-400 via-emerald-500 to-teal-500',
        iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
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
        gradient: 'from-yellow-400 via-orange-500 to-pink-500',
        iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-600',
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
        gradient: 'from-indigo-400 via-purple-500 to-pink-500',
        iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Subtle Background Pattern - Hidden on Mobile */}
            <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                        // Main Categories View - Hero Style
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Hero Header */}
                            <div className="text-center mb-16">
                                <h1 className="text-5xl md:text-7xl font-black mb-6">
                                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                                        Study
                                    </span>
                                    <br />
                                    <span className="text-gray-900 dark:text-white">
                                        Resources
                                    </span>
                                </h1>

                                <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                    Explore millions of books across <span className="font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">60+ topics</span> from 6 major categories
                                </p>
                            </div>

                            {/* Categories Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {CATEGORIES.map((category, index) => (
                                    <motion.button
                                        key={category.key}
                                        onClick={() => handleCategoryClick(category)}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all text-left overflow-hidden"
                                    >
                                        {/* Gradient Border Effect on Hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`} />

                                        {/* Icon */}
                                        <div className={`relative w-16 h-16 ${category.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                            <span className="text-3xl">{category.icon}</span>
                                        </div>

                                        {/* Content */}
                                        <h3 className="relative text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                            {category.name}
                                        </h3>
                                        <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                            {category.subtopics.length} topics available
                                        </p>

                                        {/* Explore Link */}
                                        <div className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:gap-3 transition-all">
                                            <span>Explore</span>
                                            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                                        </div>

                                        {/* Bottom Accent */}
                                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.gradient} rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : !selectedSubtopic ? (
                        // Subtopics View - Modern Design
                        <motion.div
                            key="subtopics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Back Button */}
                            <motion.button
                                onClick={handleBack}
                                whileHover={{ x: -4 }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-lg border border-white/20 text-gray-700 dark:text-gray-300 font-medium mb-8 hover:shadow-xl transition-all"
                            >
                                <ArrowLeft size={18} />
                                Back to Categories
                            </motion.button>

                            {/* Header Section */}
                            <div className="text-center mb-12">
                                <div className={`inline-flex items-center justify-center w-24 h-24 ${selectedCategory.iconBg} rounded-3xl shadow-2xl mb-6`}>
                                    <span className="text-5xl">{selectedCategory.icon}</span>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">
                                    {selectedCategory.name}
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400">
                                    Explore <span className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">{selectedCategory.subtopics.length} topics</span> • Find books and resources
                                </p>
                            </div>

                            {/* Subtopics Grid */}
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
                                        className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 text-left"
                                    >
                                        {/* Gradient Overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${selectedCategory.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                        {/* Content */}
                                        <div className="relative p-6 flex flex-col h-full">
                                            {/* Number Badge */}
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${selectedCategory.iconBg} text-white font-bold text-lg mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                {index + 1}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                                {subtopic.name}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">
                                                Browse curated books and resources
                                            </p>

                                            {/* Explore Link */}
                                            <div className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                <BookOpen className="w-4 h-4 text-purple-600" />
                                                <span>Explore Books</span>
                                                <motion.span
                                                    animate={{ x: [0, 4, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    →
                                                </motion.span>
                                            </div>
                                        </div>

                                        {/* Bottom Accent */}
                                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedCategory.gradient} rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        // Books View - Modern Design
                        <motion.div
                            key="books"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Back Button */}
                            <motion.button
                                onClick={handleBack}
                                whileHover={{ x: -4 }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-lg border border-white/20 text-gray-700 dark:text-gray-300 font-medium mb-8 hover:shadow-xl transition-all"
                            >
                                <ArrowLeft size={18} />
                                Back to Topics
                            </motion.button>

                            {/* Header */}
                            <div className="text-center mb-12">
                                <div className={`inline-flex items-center justify-center w-20 h-20 ${selectedCategory.iconBg} rounded-2xl shadow-xl mb-6`}>
                                    <Library className="w-10 h-10 text-white" />
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                                    {getCurrentSubtopicName()}
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    Discover books from <span className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">Google Books</span>
                                </p>
                            </div>

                            {/* Error State */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-red-900 dark:text-red-200 text-lg mb-1">Error Loading Books</h3>
                                            <p className="text-red-700 dark:text-red-300">{error}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">Loading books...</p>
                                </div>
                            )}

                            {/* Books Grid */}
                            {!loading && !error && books.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {books.map((book, index) => (
                                        <motion.div
                                            key={book.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ y: -8 }}
                                            className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-white/20"
                                        >
                                            {/* Book Cover */}
                                            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden flex items-center justify-center">
                                                {book.thumbnail ? (
                                                    <img
                                                        src={book.thumbnail}
                                                        alt={book.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                                                )}
                                            </div>

                                            {/* Book Info */}
                                            <div className="p-5">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                                                    {book.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                                                    {book.authors.join(', ') || 'Unknown Author'}
                                                </p>
                                                {book.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 line-clamp-2">
                                                        {book.description}
                                                    </p>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <a
                                                        href={book.infoLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
                                                    >
                                                        <ExternalLink size={16} />
                                                        Read
                                                    </a>
                                                    <button
                                                        onClick={() => handleSaveBook(book)}
                                                        disabled={savingBookId === book.id}
                                                        className={`flex items-center justify-center px-4 py-3 text-sm rounded-xl font-bold transition-all ${savedBookIds.has(book.id)
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        {savingBookId === book.id ? (
                                                            <Loader className="animate-spin" size={16} />
                                                        ) : savedBookIds.has(book.id) ? (
                                                            <BookmarkCheck size={16} />
                                                        ) : (
                                                            <BookmarkPlus size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && !error && books.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-xl mb-6">
                                        <BookOpen className="w-12 h-12 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                                        No books found
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
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
