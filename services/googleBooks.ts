const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = "AIzaSyA4_L1MoM_aSqB4fZWLqDqtyb0H45X4zGo";

export interface Book {
    id: string;
    title: string;
    authors: string[];
    description?: string;
    categories?: string[];
    thumbnail?: string;
    infoLink?: string;
}

function mapVolumeToBook(volume: any): Book {
    const info = volume.volumeInfo ?? {};
    return {
        id: volume.id,
        title: info.title ?? "Untitled",
        authors: info.authors ?? [],
        description: info.description,
        categories: info.categories,
        thumbnail: info.imageLinks?.thumbnail,
        infoLink: info.infoLink,
    };
}

export async function searchBooksByQuery(query: string, maxResults = 20): Promise<Book[]> {
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${API_KEY}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Google Books error: ${res.status}`);
        const data = await res.json();
        return (data.items ?? []).map(mapVolumeToBook);
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
}

// Subject query mapping for all subjects and subtopics
export const SUBJECT_QUERY_MAP: Record<string, string> = {
    // Science
    "science-physics": "subject:physics",
    "science-chemistry": "subject:chemistry",
    "science-biology": "subject:biology",
    "science-mathematics": "subject:mathematics OR subject:math",

    // Computer Science
    "cs-languages": "programming language OR subject:programming",
    "cs-dsa": "data structures and algorithms",
    "cs-software-eng": "software engineering",
    "cs-databases": "subject:databases OR database management",
    "cs-networking": "computer networks OR networking",
    "cs-os": "operating systems",
    "cs-web": "web development",

    // Arts & Humanities
    "arts-history": "subject:history",
    "arts-geography": "subject:geography",
    "arts-political": "political science",
    "arts-sociology": "subject:sociology",
    "arts-philosophy": "subject:philosophy",
    "arts-literature": "subject:literature",
    "arts-psychology": "subject:psychology",

    // Commerce
    "commerce-accounting": "subject:accounting",
    "commerce-business": "business studies OR subject:business",
    "commerce-economics": "subject:economics",
    "commerce-finance": "subject:finance OR subject:banking",
    "commerce-marketing": "subject:marketing",
    "commerce-management": "subject:management",
};

export async function searchBooksBySubject(subjectKey: string, maxResults = 20): Promise<Book[]> {
    const query = SUBJECT_QUERY_MAP[subjectKey];
    if (!query) {
        throw new Error(`Unknown subject key: ${subjectKey}`);
    }
    return searchBooksByQuery(query, maxResults);
}
