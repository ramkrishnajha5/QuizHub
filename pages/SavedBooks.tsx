import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, ExternalLink, Trash2, Loader, BookOpen, Library, Download, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSavedBooksForUser, removeBookForUser, SavedBook } from '../services/savedBooksService';

const SavedBooks: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState<SavedBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        loadSavedBooks();
    }, [currentUser]);

    const loadSavedBooks = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const savedBooks = await getSavedBooksForUser(currentUser.uid);
            setBooks(savedBooks);
        } catch (error) {
            console.error('Error loading saved books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBook = async (bookId: string) => {
        if (!currentUser || !window.confirm('Remove this book from your library?')) return;
        setDeleting(bookId);
        try {
            await removeBookForUser(currentUser.uid, bookId);
            setBooks(books.filter(b => b.id !== bookId));
        } catch (error) {
            console.error('Error removing book:', error);
            alert('Failed to remove book.');
        } finally {
            setDeleting(null);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
            {/* Subtle Background Pattern - Hidden on Mobile */}
            <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-3 flex items-center gap-4">
                        <BookMarked className="w-12 h-12 text-purple-600" />
                        Saved Books
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">Your personal collection of <span className="font-bold text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text">free books</span></p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : books.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <Library className="w-16 h-16 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">No saved books yet</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Start exploring and save books to build your library</p>
                        <button onClick={() => navigate('/study')} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition">
                            <BookOpen className="w-5 h-5" /> Browse Books
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
                            {books.map((book) => (
                                <motion.div key={book.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -8 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-white/20 overflow-hidden group">
                                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden flex items-center justify-center">
                                        {book.thumbnail ? (
                                            <img src={book.thumbnail} alt={book.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                        ) : (
                                            <BookOpen className="w-16 h-16 text-gray-400" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{book.title}</h3>
                                        {book.authors && book.authors.length > 0 && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">{book.authors.join(', ')}</p>
                                        )}
                                        <p className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                                            {book.subjectKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </p>

                                        <div className="flex flex-col gap-2">
                                            {/* Read Button */}
                                            <a
                                                href={(book as any).readUrl || book.infoLink || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition"
                                            >
                                                <Eye size={14} className="mr-2" /> Read Free
                                            </a>

                                            <div className="flex gap-2">
                                                {/* Download PDF Button (if available) */}
                                                {(book as any).downloadUrl && (
                                                    <a
                                                        href={(book as any).downloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition"
                                                    >
                                                        <Download size={14} className="mr-2" /> PDF
                                                    </a>
                                                )}

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => handleRemoveBook(book.id)}
                                                    disabled={deleting === book.id}
                                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
                                                >
                                                    {deleting === book.id ? <><Loader className="animate-spin mr-2" size={14} /> Removing...</> : <><Trash2 size={14} className="mr-2" /> Remove</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Stats */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 opacity-20"><div style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '20px 20px' }} className="absolute inset-0" /></div>
                            <div className="relative flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <Library className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white mb-1">Library Statistics</h3>
                                    <p className="text-white/90 text-lg">You have <span className="font-black">{books.length}</span> book{books.length !== 1 ? 's' : ''} saved</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SavedBooks;
