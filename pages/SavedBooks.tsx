import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, ExternalLink, Trash2, Loader, BookOpen } from 'lucide-react';
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
        if (!currentUser) return;

        if (!window.confirm('Are you sure you want to remove this book from your library?')) {
            return;
        }

        setDeleting(bookId);
        try {
            await removeBookForUser(currentUser.uid, bookId);
            setBooks(books.filter(b => b.id !== bookId));
        } catch (error) {
            console.error('Error removing book:', error);
            alert('Failed to remove book. Please try again.');
        } finally {
            setDeleting(null);
        }
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8 px-4 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                        <BookMarked className="mr-3" size={36} />
                        Saved Books
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your personal collection of saved books from Google Books
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="animate-spin h-12 w-12 text-primary" />
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            No saved books yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start exploring and save books to build your personal library
                        </p>
                        <button
                            onClick={() => navigate('/study')}
                            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition"
                        >
                            Browse Books
                        </button>
                    </div>
                ) : (
                    <>
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                        >
                            {books.map((book) => (
                                <motion.div
                                    key={book.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    className="bg-white dark:bg-darkcard rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 overflow-hidden group"
                                >
                                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden flex items-center justify-center">
                                        {book.thumbnail ? (
                                            <img
                                                src={book.thumbnail}
                                                alt={book.title}
                                                loading="lazy"
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
                                        {book.authors && book.authors.length > 0 && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                                                {book.authors.join(', ')}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                            {book.subjectKey.split('-').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </p>

                                        <div className="flex flex-col gap-2">
                                            <a
                                                href={book.infoLink || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                            >
                                                <ExternalLink size={14} className="mr-1" />
                                                Read / Preview
                                            </a>
                                            <button
                                                onClick={() => handleRemoveBook(book.id)}
                                                disabled={deleting === book.id}
                                                className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                            >
                                                {deleting === book.id ? (
                                                    <>
                                                        <Loader className="animate-spin mr-1" size={14} />
                                                        Removing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 size={14} className="mr-1" />
                                                        Remove
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="mt-8 p-6 bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Library Statistics</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                You have <span className="font-bold text-primary">{books.length}</span> book{books.length !== 1 ? 's' : ''} saved in your library
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SavedBooks;
