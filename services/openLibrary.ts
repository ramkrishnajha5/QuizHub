/**
 * Open Library API Service
 * Provides access to millions of free books with direct reading links
 * No API key required - completely free and open
 */

const BASE_URL = "https://openlibrary.org";
const COVERS_URL = "https://covers.openlibrary.org";

export interface Book {
    id: string;
    title: string;
    authors: string[];
    description?: string;
    categories?: string[];
    thumbnail?: string;
    publishYear?: number;
    publisher?: string[];
    pageCount?: number;
    // Open Library specific
    openLibraryKey?: string;
    readUrl?: string;      // Direct reading link
    downloadUrl?: string;  // PDF/EPUB download link (when available)
    borrowable?: boolean;
    readable?: boolean;
}

interface OpenLibraryDoc {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    publisher?: string[];
    number_of_pages_median?: number;
    subject?: string[];
    cover_i?: number;
    ia?: string[];           // Internet Archive identifiers
    lending_edition_s?: string;
    ebook_access?: string;   // 'public', 'borrowable', 'no_ebook'
}

function mapDocToBook(doc: OpenLibraryDoc): Book {
    const bookId = doc.key?.replace('/works/', '') || doc.ia?.[0] || Math.random().toString(36).substr(2, 9);
    const coverId = doc.cover_i;
    const iaIdentifier = doc.ia?.[0];

    // Determine read/download URLs
    let readUrl: string | undefined;
    let downloadUrl: string | undefined;
    let readable = false;
    let borrowable = false;

    if (doc.ebook_access === 'public' && iaIdentifier) {
        // Fully readable - public domain
        readUrl = `https://archive.org/details/${iaIdentifier}`;
        downloadUrl = `https://archive.org/download/${iaIdentifier}/${iaIdentifier}.pdf`;
        readable = true;
    } else if (doc.ebook_access === 'borrowable' || doc.lending_edition_s) {
        // Borrowable from Open Library
        readUrl = `${BASE_URL}${doc.key}`;
        borrowable = true;
    } else if (iaIdentifier) {
        // Has Internet Archive entry
        readUrl = `https://archive.org/details/${iaIdentifier}`;
    } else {
        // Fallback to Open Library page
        readUrl = `${BASE_URL}${doc.key}`;
    }

    return {
        id: bookId,
        title: doc.title || "Untitled",
        authors: doc.author_name || [],
        publishYear: doc.first_publish_year,
        publisher: doc.publisher?.slice(0, 2),
        pageCount: doc.number_of_pages_median,
        categories: doc.subject?.slice(0, 5),
        thumbnail: coverId
            ? `${COVERS_URL}/b/id/${coverId}-M.jpg`
            : undefined,
        openLibraryKey: doc.key,
        readUrl,
        downloadUrl,
        readable,
        borrowable,
    };
}

export async function searchBooks(query: string, maxResults = 20): Promise<Book[]> {
    // Filter for books with ebook access (free to read)
    const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${maxResults}&has_fulltext=true`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Open Library error: ${res.status}`);
        const data = await res.json();

        return (data.docs ?? [])
            .filter((doc: OpenLibraryDoc) => doc.title) // Filter out docs without titles
            .map(mapDocToBook);
    } catch (error) {
        console.error('Error fetching books from Open Library:', error);
        throw error;
    }
}

export async function searchBooksBySubject(query: string, maxResults = 20): Promise<Book[]> {
    // Use subject-based search for better results
    const url = `${BASE_URL}/search.json?subject=${encodeURIComponent(query)}&limit=${maxResults}&has_fulltext=true`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Open Library error: ${res.status}`);
        const data = await res.json();

        return (data.docs ?? [])
            .filter((doc: OpenLibraryDoc) => doc.title)
            .map(mapDocToBook);
    } catch (error) {
        console.error('Error fetching books by subject:', error);
        throw error;
    }
}

// Subject query mapping for all subjects and subtopics
// Optimized queries for Open Library's subject search
export const SUBJECT_QUERY_MAP: Record<string, string> = {
    // Science
    "science-physics": "physics",
    "science-chemistry": "chemistry",
    "science-biology": "biology",
    "science-mathematics": "mathematics",

    // Computer Science
    "cs-languages": "programming languages",
    "cs-dsa": "data structures algorithms",
    "cs-software-eng": "software engineering",
    "cs-databases": "database systems",
    "cs-networking": "computer networks",
    "cs-os": "operating systems",
    "cs-web": "web development",

    // Arts & Humanities
    "arts-history": "history",
    "arts-geography": "geography",
    "arts-political": "political science",
    "arts-sociology": "sociology",
    "arts-philosophy": "philosophy",
    "arts-literature": "literature",
    "arts-psychology": "psychology",

    // Commerce
    "commerce-accounting": "accounting",
    "commerce-business": "business",
    "commerce-economics": "economics",
    "commerce-finance": "finance banking",
    "commerce-marketing": "marketing",
    "commerce-management": "management",

    // General Knowledge
    "gk-world-affairs": "international relations",
    "gk-indian-history": "india history",
    "gk-world-history": "world history",
    "gk-geography": "geography environment",
    "gk-polity": "political science government",
    "gk-economy": "economics",
    "gk-science-tech": "science technology",
    "gk-sports": "sports athletics",
    "gk-awards": "awards prizes",
    "gk-books-authors": "literature authors",

    // Reasoning
    "reasoning-logical": "logic reasoning",
    "reasoning-verbal": "verbal reasoning",
    "reasoning-non-verbal": "spatial reasoning",
    "reasoning-analytical": "analytical reasoning",
    "reasoning-critical": "critical thinking",
    "reasoning-puzzles": "puzzles brain teasers",
    "reasoning-data-interpretation": "data analysis statistics",
    "reasoning-pattern": "pattern recognition",
    "reasoning-series": "mathematics sequences",
};

export async function searchBooksBySubjectKey(subjectKey: string, maxResults = 20): Promise<Book[]> {
    const query = SUBJECT_QUERY_MAP[subjectKey];
    if (!query) {
        throw new Error(`Unknown subject key: ${subjectKey}`);
    }
    return searchBooksBySubject(query, maxResults);
}

// Get book details by Open Library key
export async function getBookDetails(workKey: string): Promise<Book | null> {
    try {
        const url = `${BASE_URL}/works/${workKey}.json`;
        const res = await fetch(url);
        if (!res.ok) return null;

        const data = await res.json();

        // Get author names
        const authorPromises = (data.authors || []).map(async (author: any) => {
            const authorKey = author.author?.key;
            if (!authorKey) return null;
            try {
                const authorRes = await fetch(`${BASE_URL}${authorKey}.json`);
                const authorData = await authorRes.json();
                return authorData.name;
            } catch {
                return null;
            }
        });

        const authorNames = (await Promise.all(authorPromises)).filter(Boolean);

        return {
            id: workKey,
            title: data.title || "Untitled",
            authors: authorNames,
            description: typeof data.description === 'string'
                ? data.description
                : data.description?.value,
            categories: data.subjects?.slice(0, 5),
            thumbnail: data.covers?.[0]
                ? `${COVERS_URL}/b/id/${data.covers[0]}-M.jpg`
                : undefined,
            openLibraryKey: `/works/${workKey}`,
            readUrl: `${BASE_URL}/works/${workKey}`,
        };
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}
