import { doc, setDoc, serverTimestamp, collection, getDocs, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../utils/firebase";

export interface SavedBookPayload {
    title: string;
    authors: string[];
    thumbnail?: string;
    infoLink?: string;
    subjectKey: string;
}

export interface SavedBook extends SavedBookPayload {
    id: string;
    source: string;
    addedAt: any;
}

export async function saveBookForUser(
    uid: string,
    bookId: string,
    payload: SavedBookPayload
) {
    const docRef = doc(db, "users", uid, "savedBooks", bookId);
    await setDoc(docRef, {
        source: "google_books",
        title: payload.title,
        authors: payload.authors,
        thumbnail: payload.thumbnail ?? null,
        infoLink: payload.infoLink ?? null,
        subjectKey: payload.subjectKey,
        addedAt: serverTimestamp(),
    }, { merge: true });
}

export async function getSavedBooksForUser(uid: string): Promise<SavedBook[]> {
    const booksRef = collection(db, "users", uid, "savedBooks");
    const q = query(booksRef, orderBy("addedAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as SavedBook[];
}

export async function removeBookForUser(uid: string, bookId: string) {
    const docRef = doc(db, "users", uid, "savedBooks", bookId);
    await deleteDoc(docRef);
}

export async function isBookSaved(uid: string, bookId: string): Promise<boolean> {
    const booksRef = collection(db, "users", uid, "savedBooks");
    const snapshot = await getDocs(booksRef);
    return snapshot.docs.some(doc => doc.id === bookId);
}
