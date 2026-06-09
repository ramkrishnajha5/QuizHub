import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, BookOpen, Clock, AlertCircle, Play, Award, Eye, X, XCircle, CheckCircle, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getRecentQuizSummaries, getQuizAttemptDetails } from '../utils/saveQuizResult';
import { getQuizState } from '../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DashboardScreen() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAttempts: 0, averageScore: 0, bestScore: '0%' });
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    const loadData = async () => {
      try {
        // Load active quiz state
        const savedState = await getQuizState();
        if (savedState && savedState.status === 'active') {
          setActiveQuiz(savedState);
        } else {
          setActiveQuiz(null);
        }

        // Load quiz summaries - fetch up to 20 attempts
        const summaries = await getRecentQuizSummaries(currentUser.uid, 20);
        setRecentQuizzes(summaries);

        // Calculate stats
        if (summaries.length > 0) {
          const totalAttempts = summaries.length;
          const avgScore = summaries.reduce((acc: number, curr: any) => acc + (curr.percent || 0), 0) / totalAttempts;
          const maxScore = Math.max(...summaries.map(s => s.percent || 0));
          const bestScore = maxScore.toFixed(0) + '%';
          setStats({ totalAttempts, averageScore: avgScore, bestScore });
        } else {
          setStats({ totalAttempts: 0, averageScore: 0, bestScore: '0%' });
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleViewDetails = async (attemptId: string) => {
    if (!currentUser) return;
    setLoadingDetails(true);
    setViewingDetails(true);
    try {
      const attempt = await getQuizAttemptDetails(currentUser.uid, attemptId);
      setSelectedAttempt(attempt);
    } catch (error) {
      console.error('Error loading attempt details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setViewingDetails(false);
    setSelectedAttempt(null);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#4F46E5'} />
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
        {/* Resume Active Quiz Banner */}
        {activeQuiz && (
          <View style={styles.resumeBanner}>
            <View style={styles.resumeContent}>
              <View style={styles.resumeIconBadge}>
                <Clock size={20} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resumeTitle}>Quiz in Progress!</Text>
                <Text style={styles.resumeSubtitle}>
                  {activeQuiz.category} • {activeQuiz.currentQuestionIndex}/{activeQuiz.questionCount} Questions
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.resumeBtn}
                onPress={() => router.push({ pathname: '/quiz', params: { config: JSON.stringify({ categoryId: activeQuiz.categoryId, questionCount: activeQuiz.questionCount }) } })}
              >
                <Text style={styles.resumeBtnText}>Resume</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* User Welcome Header */}
        <View style={styles.greeting}>
          <Text style={[styles.greetingTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Hello, {currentUser?.displayName?.split(' ')[0] || 'Learner'} 👋
          </Text>
          <Text style={[styles.greetingSubtitle, isDark ? styles.textMuted : styles.textGray]}>
            Ready to test your knowledge today?
          </Text>
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Your Performance</Text>
        <View style={styles.statsGrid}>
          {/* Start Quiz Card */}
          <TouchableOpacity
            style={[styles.premiumStatCard, isDark ? styles.statCardDark : styles.statCardLight]}
            onPress={() => router.push('/setup')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#60A5FA', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumIconBadge}
            >
              <Play size={22} color="#fff" fill="#fff" />
            </LinearGradient>
            <Text style={[styles.premiumCardTitle, isDark ? styles.textWhite : styles.textBlack]}>Start Quiz</Text>
            <Text style={[styles.premiumCardDesc, isDark ? styles.textMuted : styles.textGray]}>Begin a new challenge</Text>
            <Text style={[styles.premiumCardAction, { color: isDark ? '#60A5FA' : '#4F46E5' }]}>Get Started ➔</Text>
          </TouchableOpacity>

          {/* Best Score Card */}
          <View style={[styles.premiumStatCard, isDark ? styles.statCardDark : styles.statCardLight]}>
            <LinearGradient
              colors={['#FBBF24', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumIconBadge}
            >
              <Award size={22} color="#fff" />
            </LinearGradient>
            <Text style={[styles.premiumCardValue, { color: '#F59E0B' }]}>{stats.bestScore}</Text>
            <Text style={[styles.premiumCardTitle, isDark ? styles.textWhite : styles.textBlack]}>Best Score</Text>
            <Text style={[styles.premiumCardDesc, isDark ? styles.textMuted : styles.textGray]}>Your top performance</Text>
          </View>

          {/* Total Quizzes Card */}
          <View style={[styles.premiumStatCard, isDark ? styles.statCardDark : styles.statCardLight]}>
            <LinearGradient
              colors={['#34D399', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumIconBadge}
            >
              <TrendingUp size={22} color="#fff" />
            </LinearGradient>
            <Text style={[styles.premiumCardValue, { color: '#10B981' }]}>{stats.totalAttempts}</Text>
            <Text style={[styles.premiumCardTitle, isDark ? styles.textWhite : styles.textBlack]}>Total Quizzes</Text>
            <Text style={[styles.premiumCardDesc, isDark ? styles.textMuted : styles.textGray]}>Tests completed</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack, { marginBottom: 4 }]}>Recent Quizzes</Text>
              <Text style={[{ fontSize: 13, fontWeight: '600', color: isDark ? '#9CA3AF' : '#4B5563' }]}>Your last 20 quiz attempts</Text>
            </View>
          </View>
          
          {recentQuizzes.length === 0 ? (
            <View style={[styles.emptyState, isDark ? styles.statCardDark : styles.statCardLight]}>
              <AlertCircle size={40} color="#9CA3AF" style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No Activity Yet</Text>
              <Text style={[styles.emptySubtitle, isDark ? styles.textMuted : styles.textGray]}>Take your first quiz to see your history here.</Text>
              <TouchableOpacity onPress={() => router.push('/setup')} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#4F46E5', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyBtn}
                >
                  <Text style={styles.emptyBtnText}>Start Quiz</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activityList}>
              {recentQuizzes.map((quiz, index) => {
                const isGreat = quiz.percent >= 70;
                const isGood = quiz.percent >= 50;
                const badgeColor = isGreat ? '#10B981' : isGood ? '#3B82F6' : '#EF4444';
                const badgeBg = isGreat ? 'rgba(16,185,129,0.08)' : isGood ? 'rgba(59,130,246,0.08)' : 'rgba(239,68,68,0.08)';

                return (
                  <View key={index} style={[styles.activityItem, isDark ? styles.statCardDark : styles.statCardLight]}>
                    <View style={[styles.activityScore, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.activityScoreText, { color: badgeColor }]}>
                        {Math.round(quiz.percent)}%
                      </Text>
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityCategory, isDark ? styles.textWhite : styles.textBlack]}>
                        {quiz.categoryName}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        <Text style={[styles.diffBadge, { backgroundColor: quiz.difficulty === 'easy' ? 'rgba(16,185,129,0.1)' : quiz.difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: quiz.difficulty === 'easy' ? '#10B981' : quiz.difficulty === 'hard' ? '#EF4444' : '#F59E0B' }]}>
                          {quiz.difficulty.toUpperCase()}
                        </Text>
                        <Text style={[styles.diffBadge, { 
                          backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(79, 70, 229, 0.1)', 
                          color: isDark ? '#60A5FA' : '#4F46E5' 
                        }]}>
                          SCORE: {quiz.score !== undefined ? quiz.score : 0}
                        </Text>
                        <Text style={[styles.activityDate, isDark ? styles.textMuted : styles.textGray]}>
                          📅 {new Date(quiz.finishedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => handleViewDetails(quiz.attemptId)}
                      style={[styles.viewSolutionBtn, { backgroundColor: isDark ? 'rgba(96,165,250,0.08)' : 'rgba(79,70,229,0.06)' }]}
                      activeOpacity={0.7}
                    >
                      <Eye size={16} color={isDark ? '#60A5FA' : '#4F46E5'} />
                      <Text style={[styles.viewSolutionBtnText, { color: isDark ? '#60A5FA' : '#4F46E5' }]}>View</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Solution Details Modal */}
        <Modal
          visible={viewingDetails}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDetails}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
              
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>
                    Quiz Solutions
                  </Text>
                  {selectedAttempt && (
                    <Text style={[styles.modalSubtitle, isDark ? styles.textMuted : styles.textGray]}>
                      {selectedAttempt.categoryName} • {selectedAttempt.difficulty.toUpperCase()}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={closeDetails} style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)' }]}>
                  <X size={20} color={isDark ? '#9CA3AF' : '#4B5563'} />
                </TouchableOpacity>
              </View>

              {loadingDetails ? (
                <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#4F46E5'} />
                  <Text style={{ marginTop: 12, color: isDark ? '#9CA3AF' : '#4B5563' }}>Loading details...</Text>
                </View>
              ) : selectedAttempt ? (
                <View style={{ flex: 1 }}>
                  {/* Score summary panel */}
                  <View style={[styles.scoreSummaryPanel, { backgroundColor: isDark ? 'rgba(96,165,250,0.08)' : 'rgba(79,70,229,0.05)' }]}>
                    <Text style={styles.summaryCorrect}>✓ {selectedAttempt.correct} Correct</Text>
                    <Text style={styles.summaryWrong}>✗ {selectedAttempt.wrong} Wrong</Text>
                    <Text style={styles.summaryUnattempted}>○ {selectedAttempt.unattempted} Unattempted</Text>
                  </View>

                  <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                    <View style={{ gap: 16, paddingBottom: 40 }}>
                      {selectedAttempt.questions.map((question: any, idx: number) => {
                        const userAnswer = selectedAttempt.userAnswers[idx];
                        const isCorrect = userAnswer?.isCorrect;

                        const qText = question.question;
                        const options = question.options || question.all_answers || [];
                        const correctAns = question.correctAnswer || question.correct_answer;

                        return (
                          <View
                            key={question.questionId || idx}
                            style={[
                              styles.questionReviewCard,
                              isDark
                                ? (isCorrect
                                  ? styles.reviewCardCorrectDark
                                  : userAnswer?.selectedOption
                                    ? styles.reviewCardWrongDark
                                    : styles.reviewCardUnattemptedDark)
                                : (isCorrect
                                  ? styles.reviewCardCorrect
                                  : userAnswer?.selectedOption
                                    ? styles.reviewCardWrong
                                    : styles.reviewCardUnattempted)
                            ]}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                              <View style={[styles.reviewIndexBadge, { backgroundColor: isDark ? '#60A5FA' : '#4F46E5' }]}>
                                <Text style={[styles.reviewIndexText, { color: isDark ? '#111827' : '#ffffff' }]}>{idx + 1}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.reviewQuestionText, isDark ? styles.textWhite : styles.textBlack]}>
                                  {qText.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}
                                </Text>
                                <Text style={[styles.reviewTimeSpent, isDark ? styles.textMuted : styles.textGray]}>
                                  ⏱️ Time Spent: {userAnswer?.timeSpentSeconds || userAnswer?.timeSpent || 0}s
                                </Text>
                              </View>
                              {isCorrect ? (
                                <CheckCircle size={22} color="#10B981" />
                              ) : userAnswer?.selectedOption ? (
                                <XCircle size={22} color="#EF4444" />
                              ) : (
                                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#9CA3AF' }} />
                              )}
                            </View>

                            {/* Options */}
                            <View style={{ gap: 8, paddingLeft: 34 }}>
                              {options.map((option: string, optIdx: number) => {
                                const isUserAnswer = userAnswer?.selectedOption === option;
                                const isCorrectAnswer = correctAns === option;

                                return (
                                  <View
                                    key={optIdx}
                                    style={[
                                      styles.reviewOptionRow,
                                      isCorrectAnswer
                                        ? (isDark ? { backgroundColor: '#064E3B', borderColor: '#047857' } : styles.reviewOptionCorrect)
                                        : isUserAnswer
                                          ? (isDark ? { backgroundColor: '#7F1D1D', borderColor: '#B91C1C' } : styles.reviewOptionWrong)
                                          : (isDark ? { backgroundColor: '#111827', borderColor: '#374151' } : styles.reviewOptionDefault)
                                    ]}
                                  >
                                    <Text style={[styles.reviewOptionText, isDark ? styles.textWhite : styles.textBlack]}>
                                      {option.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}
                                    </Text>
                                    {isCorrectAnswer && (
                                      <Text style={[styles.correctLabel, isDark && { color: '#A7F3D0' }]}>✓ Correct</Text>
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <Text style={[styles.userAnswerLabel, isDark && { color: '#FCA5A5' }]}>Your Answer</Text>
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              ) : (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563' }}>Failed to load quiz details</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  resumeBanner: { marginHorizontal: 24, marginTop: 24, backgroundColor: '#FFFBEB', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#FDE68A' },
  resumeContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resumeIconBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center' },
  resumeTitle: { fontSize: 16, fontWeight: '800', color: '#92400E' },
  resumeSubtitle: { fontSize: 13, color: '#B45309' },
  resumeBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  resumeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  
  greeting: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },
  greetingTitle: { fontSize: 32, fontWeight: '900', marginBottom: 4, letterSpacing: -0.5 },
  greetingSubtitle: { fontSize: 15, lineHeight: 22 },
  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },
  
  quickActions: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  actionBtnWrapper: { flex: 1 },
  actionPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  actionSecondaryLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  actionSecondaryDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  actionBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  actionBtnTextSecondary: { fontSize: 16, fontWeight: '800' },
  
  sectionTitle: { fontSize: 20, fontWeight: '800', paddingHorizontal: 24, marginBottom: 16, letterSpacing: -0.5 },
  
  statsGrid: { flexDirection: 'column', paddingHorizontal: 24, gap: 16, marginBottom: 32 },
  premiumStatCard: { padding: 20, borderRadius: 24, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  premiumIconBadge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  premiumCardValue: { fontSize: 32, fontWeight: '900', color: '#4F46E5', marginBottom: 2, letterSpacing: -1 },
  premiumCardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  premiumCardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  premiumCardAction: { fontSize: 13, fontWeight: '800', color: '#4F46E5' },

  recentSection: { paddingHorizontal: 24 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAllText: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
  
  emptyState: { padding: 32, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#D1D5DB' },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  
  activityList: { gap: 12, marginBottom: 32 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  activityScore: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  activityScoreText: { fontSize: 15, fontWeight: '800' },
  activityInfo: { flex: 1 },
  activityCategory: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  activityDate: { fontSize: 13 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 9, fontWeight: '800' },
  viewSolutionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  viewSolutionBtnText: { fontSize: 13, fontWeight: '700' },

  // Solution review modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', paddingTop: 20, minHeight: '50%' },
  modalContentLight: { backgroundColor: '#F9FAFB' },
  modalContentDark: { backgroundColor: '#111827' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  modalSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  
  scoreSummaryPanel: { flexDirection: 'row', justifyContent: 'space-around', margin: 20, padding: 16, borderRadius: 18 },
  summaryCorrect: { fontSize: 12, fontWeight: '800', color: '#10B981' },
  summaryWrong: { fontSize: 12, fontWeight: '800', color: '#EF4444' },
  summaryUnattempted: { fontSize: 12, fontWeight: '800', color: '#6B7280' },
  
  questionReviewCard: { marginHorizontal: 0, padding: 18, borderRadius: 20, borderLeftWidth: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1, marginBottom: 12 },
  reviewCardCorrect: { backgroundColor: '#FFFFFF', borderLeftColor: '#10B981', borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  reviewCardWrong: { backgroundColor: '#FFFFFF', borderLeftColor: '#EF4444', borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  reviewCardUnattempted: { backgroundColor: '#FFFFFF', borderLeftColor: '#9CA3AF', borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  reviewCardCorrectDark: { backgroundColor: '#1F2937', borderLeftColor: '#10B981', borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#374151' },
  reviewCardWrongDark: { backgroundColor: '#1F2937', borderLeftColor: '#EF4444', borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#374151' },
  reviewCardUnattemptedDark: { backgroundColor: '#1F2937', borderLeftColor: '#9CA3AF', borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#374151' },
  
  reviewIndexBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  reviewIndexText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  reviewQuestionText: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  reviewTimeSpent: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  
  reviewOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginTop: 6, borderWidth: 1 },
  reviewOptionCorrect: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  reviewOptionWrong: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  reviewOptionDefault: { backgroundColor: '#F9FAFB', borderColor: '#F3F4F6' },
  reviewOptionText: { flex: 1, fontSize: 13, fontWeight: '600' },
  correctLabel: { fontSize: 10, fontWeight: '800', color: '#065F46' },
  userAnswerLabel: { fontSize: 10, fontWeight: '800', color: '#991B1B' },
  statCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  statCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
});
