import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Trash2, ExternalLink, Library } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getSavedBooksForUser, removeBookForUser, SavedBook } from '../services/savedBooksService';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../components/CustomModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import * as WebBrowser from 'expo-web-browser';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SavedBooksScreen() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const [books, setBooks] = useState<SavedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'confirm' as const, 
    confirmText: 'Remove', 
    cancelText: 'Cancel', 
    confirmStyle: 'danger' as const, 
    onConfirm: null as (() => void) | null 
  });

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    const loadBooks = async () => {
      try {
        const savedBooks = await getSavedBooksForUser(currentUser.uid);
        setBooks(savedBooks);
      } catch (error) {
        console.error('Error loading saved books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [currentUser]);

  const handleRemove = (bookId: string) => {
    setModalState({
      isOpen: true,
      title: 'Remove Book?',
      message: 'Are you sure you want to remove this book from your library?',
      type: 'confirm',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      confirmStyle: 'danger',
      onConfirm: async () => {
        try {
          await removeBookForUser(currentUser!.uid, bookId);
          setBooks(prev => prev.filter(b => b.id !== bookId));
        } catch (error) {
          console.error('Error removing book:', error);
        }
      }
    });
  };

  const openLink = async (url?: string) => {
    if (url) {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      <Header />

      {loading ? (
        <View style={[styles.loadingContainer, isDark ? styles.containerDark : styles.containerLight]}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={[styles.loadingText, isDark ? styles.textMuted : styles.textGray]}>Loading your library...</Text>
        </View>
      ) : (
        <ScrollView 
          style={[styles.container, isDark ? styles.containerDark : styles.containerLight]} 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title Section */}
          <View style={styles.hero}>
            <View style={styles.titleRow}>
              <LinearGradient
                colors={['#4F46E5', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.titleIconBadge}
              >
                <Library size={24} color="#fff" />
              </LinearGradient>
              <Text style={[styles.title, isDark ? styles.textWhite : styles.textBlack]}>Saved Books</Text>
            </View>
            <Text style={[styles.subtitle, isDark ? styles.textMuted : styles.textGray]}>
              Your personalized digital shelf. Quick access to saved books and resources.
            </Text>
          </View>

          {books.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Library size={56} color={isDark ? '#374151' : '#D1D5DB'} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>Your Library is Empty</Text>
              <Text style={[styles.emptySubtitle, isDark ? styles.textMuted : styles.textGray]}>
                Books you save while exploring study resources will appear here on your personal shelf.
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/study')}
                activeOpacity={0.8}
                style={styles.exploreBtnWrapper}
              >
                <LinearGradient
                  colors={['#4F46E5', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.exploreBtn}
                >
                  <Text style={styles.exploreBtnText}>Explore Books</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
                      <View>
                        <Text style={[styles.bookTitle, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={2}>
                          {book.title}
                        </Text>
                        {book.authors && book.authors.length > 0 && (
                          <Text style={[styles.bookAuthor, isDark ? styles.textMuted : styles.textGray]} numberOfLines={1}>
                            {book.authors.join(', ')}
                          </Text>
                        )}
                        <Text style={styles.bookDate}>
                          Saved on {book.addedAt ? new Date(book.addedAt.seconds * 1000).toLocaleDateString() : 'recently'}
                        </Text>
                      </View>
                      
                      <View style={styles.bookActions}>
                        <TouchableOpacity 
                          style={styles.actionBtnPrimaryWrapper} 
                          onPress={() => openLink((book as any).readUrl || book.infoLink)}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['#4F46E5', '#3730A3']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionBtnPrimary}
                          >
                            <ExternalLink size={14} color="#fff" />
                            <Text style={styles.actionBtnPrimaryText}>Read Free</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.actionBtnSecondary, isDark ? styles.actionBtnSecondaryDark : styles.actionBtnSecondaryLight]} 
                          onPress={() => handleRemove(book.id)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Library Statistics Banner (Matching Web) */}
              <View style={styles.statsSection}>
                <LinearGradient
                  colors={['#4F46E5', '#EC4899', '#F97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statsGradientCard}
                >
                  <View style={styles.statsRow}>
                    <View style={styles.statsIconWrapper}>
                      <Library size={24} color="#fff" />
                    </View>
                    <View style={styles.statsTextWrapper}>
                      <Text style={styles.statsTitle}>Library Statistics</Text>
                      <Text style={styles.statsSubtitle}>
                        You have <Text style={{ fontWeight: '900' }}>{books.length}</Text> book{books.length !== 1 ? 's' : ''} saved
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </>
          )}

          {/* Footer */}
          <Footer />
        </ScrollView>
      )}

      <CustomModal {...modalState} onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))} />
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16, fontWeight: '700' },
  content: { paddingBottom: 0 },
  
  hero: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  titleIconBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22 },

  emptyContainer: { alignSelf: 'center', width: '90%', justifyContent: 'center', alignItems: 'center', paddingVertical: 64, paddingHorizontal: 24, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: '#D1D5DB', marginTop: 12, marginHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  exploreBtnWrapper: { width: '80%' },
  exploreBtn: { height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  exploreBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  booksList: { paddingHorizontal: 24, gap: 16, marginBottom: 24 },
  bookCard: { flexDirection: 'row', padding: 16, borderRadius: 24, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  bookCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  bookCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  bookCover: { width: 88, height: 132, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  bookCoverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  
  bookInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  bookTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2, lineHeight: 18 },
  bookAuthor: { fontSize: 12, marginBottom: 2 },
  bookDate: { fontSize: 11, color: '#9CA3AF', marginBottom: 8 },
  
  bookActions: { flexDirection: 'row', gap: 8 },
  actionBtnPrimaryWrapper: { flex: 1 },
  actionBtnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  actionBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  actionBtnSecondary: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  actionBtnSecondaryLight: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' },
  actionBtnSecondaryDark: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' },

  // Stats Card
  statsSection: { paddingHorizontal: 24, marginBottom: 24 },
  statsGradientCard: { borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statsIconWrapper: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsTextWrapper: { flex: 1 },
  statsTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 2 },
  statsSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },
});
