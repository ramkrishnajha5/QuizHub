import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, Clock, ListChecks, Sparkles, Play, Star, Lock, Unlock, ChevronRight, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchCategories } from '../shared/api';
import { TIMERS, QUESTION_COUNTS } from '../shared/constants';
import { Category } from '../shared/types';
import { clearQuizState } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../components/CustomModal';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function QuizSetupScreen() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'alert' as const, confirmText: 'OK', cancelText: 'No', confirmStyle: 'primary' as const, onConfirm: null as (() => void) | null });
  const [customQuizzes, setCustomQuizzes] = useState<any[]>([]);
  const [infoModalQuiz, setInfoModalQuiz] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadCategories();

    const loadCustomQuizzes = async () => {
      try {
        const quizzesRef = collection(db, 'adminQuizzes');
        const q = query(quizzesRef, where('isPublished', '==', true));
        const snapshot = await getDocs(q);
        const quizzes = snapshot.docs.map(d => ({ quizId: d.id, ...d.data() } as any));
        quizzes.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        setCustomQuizzes(quizzes);
      } catch (err) {
        console.error('Could not load custom quizzes:', err);
      }
    };
    loadCustomQuizzes();
  }, []);

  const getAvailabilityStatus = (quiz: any) => {
    if (!quiz.hasTimeRestriction) {
      return { status: 'available', text: 'Available Now', color: '#10B981', locked: false, bg: 'rgba(16,185,129,0.08)' };
    }
    
    const now = new Date();
    const extractDate = (val: any) => {
      if (!val) return null;
      if (val.seconds) return new Date(val.seconds * 1000);
      if (val.toDate) return val.toDate();
      return new Date(val);
    };

    const startTime = extractDate(quiz.availableFrom);
    const endTime = extractDate(quiz.availableUntil);
    
    if (startTime && now < startTime) {
      return { 
        status: 'upcoming', 
        text: `Opens ${startTime.toLocaleDateString()}`, 
        color: '#F59E0B',
        locked: true,
        bg: 'rgba(245,158,11,0.08)'
      };
    }
    
    if (endTime && now > endTime) {
      return { 
        status: 'ended', 
        text: 'Quiz Ended', 
        color: '#EF4444',
        locked: true,
        bg: 'rgba(239,68,68,0.08)'
      };
    }
    
    return { status: 'live', text: 'Live Now', color: '#4F46E5', locked: false, bg: 'rgba(79,70,229,0.08)' };
  };

  const handleStartCustomQuiz = async (quiz: any) => {
    setInfoModalQuiz(null);
    await clearQuizState();
    checkBanAndStart({
      source: 'admin',
      quizId: quiz.quizId,
      title: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      questions: quiz.questions,
      timeLimitMinutes: quiz.timeLimitMinutes || 10,
      negativeMarking: quiz.negativeMarking || false,
      hasTimeRestriction: quiz.hasTimeRestriction || false,
      availableUntil: quiz.availableUntil || null,
    });
  };

  const checkBanAndStart = async (quizConfig: any) => {
    try {
      if (!currentUser) { router.push('/login'); return; }
      const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userSnap.exists() || userSnap.data()?.isBanned === true) {
        await signOut(auth);
        router.replace('/login');
        return;
      }
      router.push({ pathname: '/quiz', params: { config: JSON.stringify(quizConfig) } });
    } catch {
      router.push({ pathname: '/quiz', params: { config: JSON.stringify(quizConfig) } });
    }
  };

  const handleStart = async () => {
    if (selectedCategory === null) {
      setModalState({ isOpen: true, title: 'No Category Selected', message: 'Please select a category before starting the quiz.', type: 'alert', confirmText: 'OK', cancelText: 'No', confirmStyle: 'primary', onConfirm: null });
      return;
    }
    await clearQuizState();
    checkBanAndStart({ categoryId: selectedCategory, questionCount });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && { backgroundColor: '#111827' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={[styles.loadingText, isDark && { color: '#9CA3AF' }]}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      <Header />

      <ScrollView 
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block with Premium Web Gradient */}
        <LinearGradient
          colors={['#9333EA', '#DB2777', '#EA580C']} // Matching web color scheme
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <Brain size={36} color="#fff" />
            <Text style={styles.heroTitle}>Configure Your Quiz</Text>
            <Text style={styles.heroSubtitle}>Select your topic and number of questions to begin your learning journey</Text>
          </View>
        </LinearGradient>

        {/* Custom Quizzes Section */}
        {customQuizzes.length > 0 && (
          <View style={styles.customSection}>
            <LinearGradient
              colors={['#F59E0B', '#EC4899', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.customSectionTitleBar}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Star size={20} color="#fff" fill="#fff" />
                <Text style={styles.customSectionTitle}>Quizzes by QuizHub Team</Text>
              </View>
            </LinearGradient>
            
            <View style={styles.customQuizzesGrid}>
              {customQuizzes.map((quiz) => {
                const status = getAvailabilityStatus(quiz);
                const isEasy = quiz.difficulty === 'easy';
                const isHard = quiz.difficulty === 'hard';
                const difficultyColor = isEasy ? '#10B981' : isHard ? '#EF4444' : '#F59E0B';
                const difficultyBg = isEasy ? 'rgba(16,185,129,0.1)' : isHard ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';

                return (
                  <TouchableOpacity
                    key={quiz.quizId}
                    onPress={() => setInfoModalQuiz(quiz)}
                    style={[styles.customQuizCard, isDark ? styles.customQuizCardDark : styles.customQuizCardLight]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.customCardHeader}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Text style={[styles.customBadge, { backgroundColor: difficultyBg, color: difficultyColor }]}>
                          {quiz.difficulty.toUpperCase()}
                        </Text>
                        <Text style={[styles.customBadge, { backgroundColor: status.bg, color: status.color }]}>
                          {status.text}
                        </Text>
                      </View>
                      {status.locked ? (
                        <Lock size={16} color="#9CA3AF" />
                      ) : (
                        <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#4B5563'} />
                      )}
                    </View>
                    
                    <Text style={[styles.customQuizTitle, isDark ? styles.textWhite : styles.textBlack]}>
                      {quiz.title}
                    </Text>
                    <Text style={styles.customQuizCategory}>
                      {quiz.category}
                    </Text>
                    
                    <View style={styles.customQuizStats}>
                      <Text style={[styles.customStatText, isDark ? styles.textMuted : styles.textGray]}>
                        📝 {quiz.totalQuestions} Questions
                      </Text>
                      <Text style={[styles.customStatText, isDark ? styles.textMuted : styles.textGray]}>
                        ⏱️ {quiz.timeLimitMinutes || 10} Minutes
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Category Selection */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <ListChecks size={18} color="#3B82F6" />
            <Text style={[styles.sectionLabel, isDark ? styles.textWhite : styles.textBlack]}>Select Category</Text>
          </View>
          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            style={[styles.pickerTrigger, isDark ? styles.pickerTriggerDark : styles.pickerTriggerLight]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.pickerTriggerText,
              selectedCategory !== null && (isDark ? styles.textWhite : styles.textBlack),
              selectedCategory === null && styles.textMuted
            ]}>
              {selectedCategory !== null
                ? categories.find(c => c.id === selectedCategory)?.name
                : "Choose a topic..."}
            </Text>
            <Text style={{ fontSize: 14, color: isDark ? '#9CA3AF' : '#6B7280' }}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Picker Modal */}
        <Modal
          visible={pickerOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setPickerOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>Select Category</Text>
                <TouchableOpacity onPress={() => setPickerOpen(false)}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: isDark ? '#9CA3AF' : '#6B7280' }}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => { setSelectedCategory(null); setPickerOpen(false); }}
                  style={[styles.categoryItem, selectedCategory === null && styles.categoryItemSelected, isDark && styles.categoryItemDark]}
                >
                  <Text style={[styles.categoryItemText, selectedCategory === null && styles.categoryItemTextSelected, isDark && styles.textWhite]}>
                    Choose a topic...
                  </Text>
                </TouchableOpacity>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => { setSelectedCategory(c.id); setPickerOpen(false); }}
                    style={[styles.categoryItem, selectedCategory === c.id && styles.categoryItemSelected, isDark && styles.categoryItemDark]}
                  >
                    <Text style={[styles.categoryItemText, selectedCategory === c.id && styles.categoryItemTextSelected, isDark && styles.textWhite]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Custom Quiz Info Modal */}
        {infoModalQuiz && (
          <Modal
            visible={!!infoModalQuiz}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setInfoModalQuiz(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
                <View style={[styles.infoModalTitleBar, { backgroundColor: '#4F46E5' }]}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.infoModalTitle} numberOfLines={1}>{infoModalQuiz.title}</Text>
                    <Text style={styles.infoModalCategory}>{infoModalQuiz.category}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setInfoModalQuiz(null)} style={styles.infoModalClose}>
                    <X size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                  {(() => {
                    const status = getAvailabilityStatus(infoModalQuiz);
                    return (
                      <View style={{ gap: 16 }}>
                        {/* Stats Row */}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <View style={[styles.infoStatBox, isDark ? styles.infoStatBoxDark : styles.infoStatBoxLight]}>
                            <ListChecks size={22} color="#3B82F6" />
                            <Text style={styles.infoStatLabel}>QUESTIONS</Text>
                            <Text style={[styles.infoStatVal, isDark ? styles.textWhite : styles.textBlack]}>{infoModalQuiz.totalQuestions}</Text>
                          </View>
                          <View style={[styles.infoStatBox, isDark ? styles.infoStatBoxDark : styles.infoStatBoxLight]}>
                            <Clock size={22} color="#9333EA" />
                            <Text style={styles.infoStatLabel}>TIME LIMIT</Text>
                            <Text style={[styles.infoStatVal, isDark ? styles.textWhite : styles.textBlack]}>{infoModalQuiz.timeLimitMinutes || 10} min</Text>
                          </View>
                        </View>
                        
                        {/* More Details */}
                        <View style={[styles.infoDetailRow, isDark ? styles.infoDetailRowDark : styles.infoDetailRowLight]}>
                          <Text style={[styles.infoDetailLabel, isDark ? styles.textWhite : styles.textBlack]}>Difficulty</Text>
                          <Text style={[styles.customBadge, { backgroundColor: infoModalQuiz.difficulty === 'easy' ? 'rgba(16,185,129,0.1)' : infoModalQuiz.difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: infoModalQuiz.difficulty === 'easy' ? '#10B981' : infoModalQuiz.difficulty === 'hard' ? '#EF4444' : '#F59E0B' }]}>
                            {infoModalQuiz.difficulty.toUpperCase()}
                          </Text>
                        </View>
                        
                        <View style={[styles.infoDetailRow, isDark ? styles.infoDetailRowDark : styles.infoDetailRowLight]}>
                          <Text style={[styles.infoDetailLabel, isDark ? styles.textWhite : styles.textBlack]}>Negative Marking</Text>
                          <Text style={[styles.customBadge, { backgroundColor: infoModalQuiz.negativeMarking ? 'rgba(239,68,68,0.1)' : 'rgba(156,163,175,0.1)', color: infoModalQuiz.negativeMarking ? '#EF4444' : '#6B7280' }]}>
                            {infoModalQuiz.negativeMarking ? 'Yes (-0.25)' : 'No'}
                          </Text>
                        </View>
                        
                        {infoModalQuiz.hasTimeRestriction && (
                          <View style={[
                            styles.windowCard,
                            status.locked ? styles.windowCardLocked : styles.windowCardLive,
                            { padding: 16, borderRadius: 16, flexDirection: 'row', gap: 10, alignItems: 'center' }
                          ]}>
                            {status.locked ? <Lock size={20} color="#EF4444" /> : <Unlock size={20} color="#10B981" />}
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.windowTitle, { color: status.locked ? '#EF4444' : '#10B981' }]}>
                                Window Restricted
                              </Text>
                              <Text style={[styles.windowText, { color: status.locked ? '#DC2626' : '#059669' }]}>
                                {status.text}
                              </Text>
                            </View>
                          </View>
                        )}
                        
                        <TouchableOpacity
                          disabled={status.locked}
                          onPress={() => handleStartCustomQuiz(infoModalQuiz)}
                          style={[
                            styles.infoStartBtn,
                            status.locked && { opacity: 0.5 }
                          ]}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={status.locked ? ['#9CA3AF', '#6B7280'] : ['#4F46E5', '#9333EA']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.infoStartBtnGradient}
                          >
                            <Play size={20} color="#fff" fill="#fff" />
                            <Text style={styles.infoStartBtnText}>
                              {status.locked ? 'LOCKED' : 'START QUIZ NOW'}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {/* Question Count Selection */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Clock size={18} color="#4F46E5" />
            <Text style={[styles.sectionLabel, isDark ? styles.textWhite : styles.textBlack]}>Questions & Time Limit</Text>
          </View>
          <View style={styles.countGrid}>
            {QUESTION_COUNTS.map((count) => {
              const isSelected = questionCount === count;
              return (
                <TouchableOpacity
                  key={count}
                  onPress={() => setQuestionCount(count)}
                  style={[
                    styles.countCard,
                    isDark ? styles.countCardDark : styles.countCardLight,
                    isSelected && styles.countCardSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.countNumber, 
                    isDark ? styles.textWhite : styles.textBlack,
                    isSelected && styles.countNumberSelected
                  ]}>
                    {count}
                  </Text>
                  <Text style={[styles.countLabel, isDark ? styles.textMuted : styles.textGray]}>Questions</Text>
                  <View style={styles.countTime}>
                    <Clock size={12} color={isSelected ? '#4F46E5' : '#9CA3AF'} />
                    <Text style={[styles.countTimeText, isDark ? styles.textMuted : styles.textGray]}>{TIMERS[count] / 60} min</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.tip}>
            <Sparkles size={14} color="#9CA3AF" />
            <Text style={[styles.tipText, isDark ? styles.textMuted : styles.textGray]}>Questions are randomly shuffled each time</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={[styles.summary, isDark ? styles.summaryDark : styles.summaryLight]}>
          <Text style={[styles.summaryTitle, isDark ? styles.textWhite : styles.textBlack]}>📝 Quiz Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryItem, isDark ? styles.summaryItemDark : styles.summaryItemLight]}>
              <Text style={[styles.summaryItemLabel, isDark ? styles.textMuted : styles.textGray]}>Questions</Text>
              <Text style={[styles.summaryItemValue, isDark ? styles.textWhite : styles.textBlack]}>{questionCount}</Text>
            </View>
            <View style={[styles.summaryItem, isDark ? styles.summaryItemDark : styles.summaryItemLight]}>
              <Text style={[styles.summaryItemLabel, isDark ? styles.textMuted : styles.textGray]}>Time Limit</Text>
              <Text style={[styles.summaryItemValue, isDark ? styles.textWhite : styles.textBlack]}>{TIMERS[questionCount] / 60} min</Text>
            </View>
          </View>
        </View>

        {/* Start Button with Premium Linear Gradient */}
        <TouchableOpacity
          style={[styles.startBtnContainer, selectedCategory === null && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={selectedCategory === null}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#9333EA', '#DB2777', '#EA580C']} // Matching web CTA primary gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButton}
          >
            <Play size={22} color="#fff" fill="#fff" />
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <Footer />
      </ScrollView>

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
  content: { paddingBottom: 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '700' },

  hero: { paddingHorizontal: 24, paddingVertical: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: '#9333EA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  heroContent: { gap: 8, alignItems: 'center' },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  section: { paddingHorizontal: 24, marginTop: 32 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionLabel: { fontSize: 17, fontWeight: '800' },
  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },

  pickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderRadius: 16, paddingHorizontal: 16, height: 56 },
  pickerTriggerLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  pickerTriggerDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  pickerTriggerText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, maxHeight: '80%', paddingTop: 20 },
  modalContentLight: { backgroundColor: '#FFFFFF' },
  modalContentDark: { backgroundColor: '#1F2937' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', paddingBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  categoryList: { gap: 8 },
  categoryItem: { paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: 'rgba(0,0,0,0.02)' },
  categoryItemDark: { backgroundColor: 'rgba(255,255,255,0.03)' },
  categoryItemSelected: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#4F46E5' },
  categoryItemText: { fontSize: 16, fontWeight: '600' },
  categoryItemTextSelected: { color: '#4F46E5' },

  countGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  countCard: { width: '47%', borderWidth: 2, borderRadius: 20, padding: 20, alignItems: 'center' },
  countCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  countCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  countCardSelected: { borderColor: '#4F46E5', backgroundColor: 'rgba(79,70,229,0.06)' },
  countNumber: { fontSize: 32, fontWeight: '900', marginBottom: 2 },
  countNumberSelected: { color: '#4F46E5' },
  countLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  countTime: { flexDirection: 'row', alignItems: 'center', gap: 4, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 8, width: '100%', justifyContent: 'center' },
  countTimeText: { fontSize: 12, fontWeight: '600' },
  checkmark: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  checkmarkText: { color: '#fff', fontWeight: '900', fontSize: 14 },

  tip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  tipText: { fontSize: 13 },

  summary: { marginHorizontal: 24, marginTop: 32, borderRadius: 24, padding: 20, borderWidth: 1 },
  summaryLight: { backgroundColor: '#EFF6FF', borderColor: 'rgba(59,130,246,0.2)' },
  summaryDark: { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' },
  summaryTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  summaryGrid: { flexDirection: 'row', gap: 12 },
  summaryItem: { flex: 1, borderRadius: 16, padding: 16 },
  summaryItemLight: { backgroundColor: 'rgba(255,255,255,0.75)' },
  summaryItemDark: { backgroundColor: 'rgba(31,41,55,0.75)' },
  summaryItemLabel: { fontSize: 13, marginBottom: 4 },
  summaryItemValue: { fontSize: 24, fontWeight: '900' },

  startBtnContainer: { marginHorizontal: 24, marginTop: 32, marginBottom: 16 },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 16, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  startButtonDisabled: { opacity: 0.5 },
  startButtonText: { color: '#fff', fontWeight: '900', fontSize: 20 },

  customSection: { marginTop: 24 },
  customSectionTitleBar: { paddingHorizontal: 24, paddingVertical: 14, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  customSectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  customQuizzesGrid: { paddingHorizontal: 24, paddingTop: 16, gap: 12, paddingBottom: 16 },
  customQuizCard: { padding: 16, borderRadius: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  customQuizCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  customQuizCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  customCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  customBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, fontWeight: '800' },
  customQuizTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  customQuizCategory: { fontSize: 12, color: '#4F46E5', fontWeight: '700', marginBottom: 10 },
  customQuizStats: { flexDirection: 'row', gap: 16 },
  customStatText: { fontSize: 12, fontWeight: '600' },
  
  infoModalTitleBar: { padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoModalTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 2 },
  infoModalCategory: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700' },
  infoModalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  infoStatBox: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  infoStatBoxLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  infoStatBoxDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  infoStatLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', marginTop: 4, marginBottom: 2 },
  infoStatVal: { fontSize: 18, fontWeight: '900' },
  infoDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  infoDetailRowLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  infoDetailRowDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  infoDetailLabel: { fontSize: 14, fontWeight: '700' },
  windowCard: { borderWidth: 1 },
  windowCardLocked: { backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' },
  windowCardLive: { backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' },
  windowTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  windowText: { fontSize: 12, fontWeight: '600' },
  infoStartBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  infoStartBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  infoStartBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
