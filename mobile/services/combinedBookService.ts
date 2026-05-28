/**
 * Combined Book Service
 * Fetches books from both Open Library (free) and Google Books (mixed paid/free)
 * Returns unified results with source and payment status
 */

import { searchBooksBySubjectKey as searchOpenLibrary, Book as OpenLibraryBook, SUBJECT_QUERY_MAP as OL_SUBJECT_MAP } from './openLibrary';
import { searchBooksBySubject as searchGoogleBooks, SUBJECT_QUERY_MAP as GB_SUBJECT_MAP } from './googleBooks';

export type BookSource = 'open_library' | 'google_books';

export interface UnifiedBook {
    id: string;
    title: string;
    authors: string[];
    description?: string;
    categories?: string[];
    thumbnail?: string;
    publishYear?: number;
    // Links
    readUrl?: string;
    downloadUrl?: string;
    infoLink?: string;
    // Source and pricing
    source: BookSource;
    isFree: boolean;
    isPaid: boolean;
    // Open Library specific
    readable?: boolean;
    borrowable?: boolean;
}

/**
 * Search books from both Open Library and Google Books
 * Returns mixed results from both sources (20 from each = 40 total)
 */
export async function searchBooksFromAllSources(subjectKey: string, maxPerSource = 20): Promise<UnifiedBook[]> {
    // Check if subject exists in mappings
    const hasOpenLibraryMapping = subjectKey in OL_SUBJECT_MAP;
    const hasGoogleBooksMapping = subjectKey in GB_SUBJECT_MAP;

    if (!hasOpenLibraryMapping && !hasGoogleBooksMapping) {
        throw new Error(`Unknown subject key: ${subjectKey}`);
    }

    // Fetch from both sources in parallel
    const [openLibraryResults, googleBooksResults] = await Promise.allSettled([
        hasOpenLibraryMapping ? searchOpenLibrary(subjectKey, maxPerSource) : Promise.resolve([]),
        hasGoogleBooksMapping ? searchGoogleBooks(subjectKey, maxPerSource) : Promise.resolve([])
    ]);

    const books: UnifiedBook[] = [];

    // Process Open Library results (all free)
    if (openLibraryResults.status === 'fulfilled') {
        const olBooks = openLibraryResults.value.map((book: OpenLibraryBook): UnifiedBook => ({
            id: `ol_${book.id}`,
            title: book.title,
            authors: book.authors,
            description: book.description,
            categories: book.categories,
            thumbnail: book.thumbnail,
            publishYear: book.publishYear,
            readUrl: book.readUrl,
            downloadUrl: book.downloadUrl,
            source: 'open_library',
            isFree: true,
            isPaid: false,
            readable: book.readable,
            borrowable: book.borrowable,
        }));
        books.push(...olBooks);
    } else {
        console.error('Open Library fetch failed:', openLibraryResults.reason);
    }

    // Process Google Books results (check for free/paid)
    if (googleBooksResults.status === 'fulfilled') {
        const gbBooks = googleBooksResults.value.map((book: any): UnifiedBook => ({
            id: `gb_${book.id}`,
            title: book.title,
            authors: book.authors,
            description: book.description,
            categories: book.categories,
            thumbnail: book.thumbnail,
            infoLink: book.infoLink,
            readUrl: book.infoLink, // For Google Books, readUrl is the info page
            source: 'google_books',
            // Google Books - assume paid unless it's a preview-only type
            // We can't reliably detect free status from basic search, so mark as potentially paid
            isFree: false,
            isPaid: true,
        }));
        books.push(...gbBooks);
    } else {
        console.error('Google Books fetch failed:', googleBooksResults.reason);
    }

    // Shuffle/interleave results for mixed display
    // Alternate between Open Library and Google Books
    const olBooks = books.filter(b => b.source === 'open_library');
    const gbBooks = books.filter(b => b.source === 'google_books');

    const mixedBooks: UnifiedBook[] = [];
    const maxLen = Math.max(olBooks.length, gbBooks.length);

    for (let i = 0; i < maxLen; i++) {
        if (i < olBooks.length) mixedBooks.push(olBooks[i]);
        if (i < gbBooks.length) mixedBooks.push(gbBooks[i]);
    }

    return mixedBooks;
}
