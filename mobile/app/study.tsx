import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, BookOpen, ExternalLink, BookmarkPlus, ArrowLeft, ArrowRight, Library, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { searchBooksFromAllSources, UnifiedBook } from '../services/combinedBookService';
import { saveBookForUser } from '../services/savedBooksService';
import { SafeAreaView } from 'react-native-safe-area-context';
import Alert from '../components/Alert';
import Header from '../components/Header';
import Footer from '../components/Footer';
import * as WebBrowser from 'expo-web-browser';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Category {
  key: string;
  name: string;
  icon: string;
  gradient: [string, string, ...string[]];
  subtopics: { key: string; name: string }[];
}

const CATEGORIES: Category[] = [
  {
    key: 'science',
    name: 'Science',
    icon: '🔬',
    gradient: ['#22D3EE', '#3B82F6', '#4F46E5'] as const,
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
    gradient: ['#C084FC', '#EC4899', '#F43F5E'] as const,
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
    gradient: ['#F472B6', '#F43F5E', '#EF4444'] as const,
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
    gradient: ['#34D399', '#10B981', '#14B8A6'] as const,
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
    gradient: ['#F59E0B', '#F97316', '#EC4899'] as const,
    subtopics: [
      { key: 'gk-world-affairs', name: 'World Affairs' },
      { key: 'gk-indian-history', name: 'Indian History' },
      { key: 'gk-world-history', name: 'World History' },
      { key: 'gk-geography', name: 'Geography & Environment' },
      { key: 'gk-polity', name: 'Indian Polity' },
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
    gradient: ['#6366F1', '#8B5CF6', '#EC4899'] as const,
    subtopics: [
      { key: 'reasoning-logical', name: 'Logical Reasoning' },
      { key: 'reasoning-verbal', name: 'Verbal Reasoning' },
      { key: 'reasoning-non-verbal', name: 'Non-Verbal Reasoning' },
      { key: 'reasoning-analytical', name: 'Analytical Reasoning' },
      { key: 'reasoning-critical', name: 'Critical Thinking' },
      { key: 'reasoning-puzzles', name: 'Puzzles & Brain Teasers' },
      { key: 'reasoning-data-interpretation', name: 'Data Interpretation' },
      { key: 'reasoning-pattern', name: 'Pattern Recognition' },
      { key: 'reasoning-series', name: 'Series (Number/Letter)' },
    ]
  },
];

export default function StudyScreen() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<UnifiedBook[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // 3-step navigation states
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubtopic(null);
    setBooks([]);
    setQuery('');
  };

  const handleSubtopicClick = async (subtopicKey: string) => {
    setSelectedSubtopic(subtopicKey);
    setLoading(true);
    setQuery('');
    try {
      const results = await searchBooksFromAllSources(subtopicKey, 15);
      setBooks(results);
    } catch (error) {
      console.error(error);
      setAlert({ type: 'error', message: 'Failed to fetch books.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTextSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSelectedCategory(null);
    setSelectedSubtopic(null);
    try {
      const results = await searchBooksFromAllSources(query.trim(), 15);
      setBooks(results);
    } catch (error) {
      console.error(error);
      setAlert({ type: 'error', message: 'Failed to find books.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (book: UnifiedBook) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    try {
      await saveBookForUser(currentUser.uid, book.id, {
        title: book.title,
        authors: book.authors,
        thumbnail: book.thumbnail,
        readUrl: book.readUrl,
        downloadUrl: book.downloadUrl,
        subjectKey: selectedSubtopic || query || 'search',
      });
      setAlert({ type: 'success', message: 'Book saved to your library!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to save book.' });
    }
  };

  const openLink = async (url?: string) => {
    if (url) {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  const handleBack = () => {
    if (selectedSubtopic) {
      setSelectedSubtopic(null);
      setBooks([]);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else if (books.length > 0) {
      // Clear general search results
      setBooks([]);
      setQuery('');
    }
  };

  const getCurrentSubtopicName = () => {
    if (!selectedCategory || !selectedSubtopic) return '';
    const sub = selectedCategory.subtopics.find(s => s.key === selectedSubtopic);
    return sub?.name || '';
  };

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      <Header />
      {alert && <Alert type={alert.type} message={alert.message} show={!!alert} onClose={() => setAlert(null)} />}

      <ScrollView 
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Level 1: Main Category Selection */}
        {!selectedCategory && books.length === 0 && (
          <View style={styles.hero}>
            <View style={styles.titleRow}>
              <LinearGradient
                colors={['#4F46E5', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.titleIconBadge}
              >
                <BookOpen size={24} color="#fff" />
              </LinearGradient>
              <Text style={[styles.title, isDark ? styles.textWhite : styles.textBlack]}>Study Resources</Text>
            </View>
            <Text style={[styles.subtitle, isDark ? styles.textMuted : styles.textGray]}>
              Explore millions of books across 40+ topics from Open Library & Google Books
            </Text>


            {/* Categories Grid Layout */}
            <Text style={[styles.sectionHeading, isDark ? styles.textWhite : styles.textBlack]}>Categories</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.catCard, isDark ? styles.catCardDark : styles.catCardLight]}
                  onPress={() => handleCategoryClick(cat)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={cat.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.catIconWrapper}
                  >
                    <Text style={styles.catIconEmoji}>{cat.icon}</Text>
                  </LinearGradient>
                  
                  <Text style={[styles.catName, isDark ? styles.textWhite : styles.textBlack]}>{cat.name}</Text>
                  <Text style={[styles.catCount, isDark ? styles.textMuted : styles.textGray]}>
                    {cat.subtopics.length} topics available
                  </Text>
                  
                  <View style={styles.catExploreRow}>
                    <Text style={styles.catExploreText}>Explore</Text>
                    <ArrowRight size={14} color="#4F46E5" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Level 2: Subtopic Selection */}
        {selectedCategory && !selectedSubtopic && (
          <View style={styles.subtopicsContainer}>
            {/* Back Button */}
            <TouchableOpacity onPress={handleBack} style={[styles.backBtn, isDark ? styles.backBtnDark : styles.backBtnLight]}>
              <ArrowLeft size={16} color={isDark ? '#FFF' : '#374151'} />
              <Text style={[styles.backBtnText, isDark ? styles.textWhite : styles.textBlack]}>Back to Categories</Text>
            </TouchableOpacity>

            <View style={styles.subtopicHeader}>
              <LinearGradient
                colors={selectedCategory.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.subtopicHeaderIcon}
              >
                <Text style={styles.subtopicHeaderEmoji}>{selectedCategory.icon}</Text>
              </LinearGradient>
              <Text style={[styles.subtopicHeaderTitle, isDark ? styles.textWhite : styles.textBlack]}>
                {selectedCategory.name}
              </Text>
              <Text style={[styles.subtopicHeaderSub, isDark ? styles.textMuted : styles.textGray]}>
                Explore {selectedCategory.subtopics.length} topics • Find books and resources
              </Text>
            </View>

            <View style={styles.subtopicsGrid}>
              {selectedCategory.subtopics.map((sub, index) => (
                <TouchableOpacity
                  key={sub.key}
                  style={[styles.subtopicCard, isDark ? styles.subtopicCardDark : styles.subtopicCardLight]}
                  onPress={() => handleSubtopicClick(sub.key)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={selectedCategory.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.subtopicNumberBadge}
                  >
                    <Text style={styles.subtopicNumberText}>{index + 1}</Text>
                  </LinearGradient>
                  
                  <Text style={[styles.subtopicName, isDark ? styles.textWhite : styles.textBlack]}>
                    {sub.name}
                  </Text>
                  <Text style={[styles.subtopicDesc, isDark ? styles.textMuted : styles.textGray]}>
                    Curated study manuals
                  </Text>
                  <View style={styles.subtopicExploreRow}>
                    <BookOpen size={14} color="#4F46E5" />
                    <Text style={styles.subtopicExploreText}>Explore Books</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Level 3: Books List (From Subtopic or Text Search) */}
        {(selectedSubtopic || books.length > 0) && (
          <View style={styles.booksContainer}>
            {/* Back Button */}
            <TouchableOpacity onPress={handleBack} style={[styles.backBtn, isDark ? styles.backBtnDark : styles.backBtnLight]}>
              <ArrowLeft size={16} color={isDark ? '#FFF' : '#374151'} />
              <Text style={[styles.backBtnText, isDark ? styles.textWhite : styles.textBlack]}>
                {selectedSubtopic ? "Back to Topics" : "Back to Search"}
              </Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.subtopicHeader}>
              <LinearGradient
                colors={selectedCategory ? selectedCategory.gradient : ['#4F46E5', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.subtopicHeaderIcon}
              >
                <Library size={24} color="#fff" />
              </LinearGradient>
              <Text style={[styles.subtopicHeaderTitle, isDark ? styles.textWhite : styles.textBlack]}>
                {selectedSubtopic ? getCurrentSubtopicName() : `Search: "${query}"`}
              </Text>
              <Text style={[styles.subtopicHeaderSub, isDark ? styles.textMuted : styles.textGray]}>
                Curated study library powering free manuals
              </Text>
            </View>

            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={[styles.loadingText, isDark ? styles.textMuted : styles.textGray]}>Searching libraries...</Text>
              </View>
            ) : books.length > 0 ? (
              <View style={styles.booksList}>
                {books.map((book) => (
                  <View key={book.id} style={[styles.bookCard, isDark ? styles.bookCardDark : styles.bookCardLight]}>
                    {book.thumbnail ? (
                      <Image source={{ uri: book.thumbnail }} style={styles.bookCover} resizeMode="cover" />
                    ) : (
                      <View style={[styles.bookCover, styles.bookCoverPlaceholder]}>
                        <BookOpen size={24} color="#9CA3AF" />
                      </View>
                    )}
                    
                    <View style={styles.bookInfo}>
                      <View style={styles.bookHeader}>
                        <View style={[styles.sourceBadge, { backgroundColor: book.isFree ? 'rgba(16,185,129,0.08)' : 'rgba(79,70,229,0.08)' }]}>
                          <Text style={[styles.sourceText, { color: book.isFree ? '#10B981' : '#4F46E5' }]}>
                            {book.source === 'open_library' ? 'Free (Open Library)' : 'Google Books'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.bookTitle, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={2}>
                        {book.title}
                      </Text>
                      <Text style={[styles.bookAuthor, isDark ? styles.textMuted : styles.textGray]} numberOfLines={1}>
                        {book.authors.join(', ') || 'Unknown Author'}
                      </Text>
                      
                      <View style={styles.bookActions}>
                        <TouchableOpacity 
                          style={styles.actionBtnPrimaryWrapper} 
                          onPress={() => openLink(book.readUrl)}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['#4F46E5', '#3730A3']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionBtnPrimary}
                          >
                            <ExternalLink size={14} color="#fff" />
                            <Text style={styles.actionBtnPrimaryText}>Read Info</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.actionBtnSecondary, isDark ? styles.actionBtnSecondaryDark : styles.actionBtnSecondaryLight]} 
                          onPress={() => handleSaveBook(book)}
                          activeOpacity={0.7}
                        >
                          <BookmarkPlus size={18} color={isDark ? '#F3F4F6' : '#4B5563'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.centerContainer}>
                <Library size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
                <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No Books Found</Text>
                <Text style={[styles.emptySubtitle, isDark ? styles.textMuted : styles.textGray]}>
                  We couldn't find any resources for this topic. Please go back and try another topic.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  safeLight: { backgroundColor: '#FFFFFF' },
  safeDark: { backgroundColor: '#111827' },
  container: { flex: 1 },
  containerLight: { backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  content: { paddingBottom: 0 },
  
  hero: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  titleIconBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 24 },

  // Search Bar
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  searchLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  searchDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  searchIconBtn: { padding: 6 },

  // Category selection Grid
  sectionHeading: { fontSize: 18, fontWeight: '900', marginBottom: 16, letterSpacing: -0.5 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  catCard: { width: '48%', padding: 20, borderRadius: 24, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1, marginBottom: 4 },
  catCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  catCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  catIconWrapper: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  catIconEmoji: { fontSize: 22 },
  catName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  catCount: { fontSize: 12, marginBottom: 12 },
  catExploreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catExploreText: { fontSize: 12, fontWeight: '800', color: '#4F46E5' },

  // Subtopics Drilldown
  subtopicsContainer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, alignSelf: 'flex-start', borderWidth: 1, marginBottom: 24 },
  backBtnLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  backBtnDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  backBtnText: { fontSize: 13, fontWeight: '700' },

  subtopicHeader: { alignItems: 'center', marginBottom: 32 },
  subtopicHeaderIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  subtopicHeaderEmoji: { fontSize: 32 },
  subtopicHeaderTitle: { fontSize: 26, fontWeight: '900', marginBottom: 6 },
  subtopicHeaderSub: { fontSize: 13, textAlign: 'center', lineHeight: 18 },

  subtopicsGrid: { gap: 12 },
  subtopicCard: { padding: 18, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  subtopicCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  subtopicCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  subtopicNumberBadge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  subtopicNumberText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  subtopicName: { fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
  subtopicDesc: { fontSize: 11, color: '#9CA3AF', marginRight: 12, display: 'none' },
  subtopicExploreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subtopicExploreText: { fontSize: 11, fontWeight: '700', color: '#4F46E5' },

  // Books Page
  booksContainer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  loadingText: { marginTop: 16, fontSize: 15, fontWeight: '700' },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 24 },

  booksList: { gap: 16, marginBottom: 24 },
  bookCard: { flexDirection: 'row', padding: 16, borderRadius: 24, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  bookCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  bookCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  bookCover: { width: 88, height: 132, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  bookCoverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  
  bookInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  bookHeader: { flexDirection: 'row', marginBottom: 4 },
  sourceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sourceText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  bookTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2, lineHeight: 18 },
  bookAuthor: { fontSize: 12, marginBottom: 8 },
  
  bookActions: { flexDirection: 'row', gap: 8 },
  actionBtnPrimaryWrapper: { flex: 1 },
  actionBtnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  actionBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  actionBtnSecondary: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  actionBtnSecondaryLight: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  actionBtnSecondaryDark: { backgroundColor: '#111827', borderColor: '#374151' },

  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },
});
