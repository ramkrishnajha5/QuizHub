import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuizAttempt } from '../shared/types';
import { CheckCircle, XCircle, AlertCircle, Clock, RotateCcw, Home, Trophy, Sparkles, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ result: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const [showSolutions, setShowSolutions] = useState(false);

  if (!params.result) {
    return (
      <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
        <Header />
        <View style={styles.emptyContainer}>
          <AlertCircle size={64} color="#4F46E5" />
          <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No Results Found</Text>
          <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.8}>
            <LinearGradient
              colors={['#4F46E5', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Go Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const result: QuizAttempt = JSON.parse(params.result);

  const getGrade = (p: number) => {
    if (p >= 90) return { text: 'Outstanding!', emoji: '🏆', gradient: ['#F59E0B', '#EF4444', '#DB2777'] };
    if (p >= 70) return { text: 'Great Job!', emoji: '🎉', gradient: ['#10B981', '#06B6D4'] };
    if (p >= 50) return { text: 'Good Effort', emoji: '👍', gradient: ['#3B82F6', '#8B5CF6'] };
    return { text: 'Keep Practicing', emoji: '💪', gradient: ['#EC4899', '#DB2777', '#8B5CF6'] };
  };

  const grade = getGrade(result.percent);

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      <Header />
      <ScrollView 
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Top Grade Gradient Header Card */}
        <LinearGradient
          colors={grade.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <Text style={styles.headerEmoji}>{grade.emoji}</Text>
          <Text style={styles.headerTitle}>{grade.text}</Text>
          <Text style={styles.headerScore}>You scored {result.percent.toFixed(1)}%</Text>
          <Text style={styles.headerSubtitle}>{result.categoryName || result.category} • {result.questionCount} Questions</Text>
        </LinearGradient>

        {/* Score & Performance Circle */}
        <View style={[styles.scoreCard, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.scoreHeader}>
            <Target size={20} color="#4F46E5" />
            <Text style={[styles.scoreCardTitle, isDark ? styles.textWhite : styles.textBlack]}>Performance</Text>
          </View>
          <View style={styles.scoreCircleContainer}>
            <View style={[styles.scoreCircle, isDark ? styles.scoreCircleDark : styles.scoreCircleLight]}>
              <Text style={styles.scoreCircleValue}>{result.score}</Text>
              <Text style={styles.scoreCircleMax}>/ {result.totalQuestions || result.questions.length}</Text>
            </View>
          </View>
        </View>

        {/* Detailed Stats Cards */}
        <View style={[styles.statsGrid, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.statsTitle, isDark ? styles.textWhite : styles.textBlack]}>Detailed Stats</Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : '#F0FDF4', borderColor: isDark ? 'rgba(16,185,129,0.15)' : '#D1FAE5' }]}>
              <CheckCircle size={22} color="#10B981" />
              <Text style={[styles.statValue, { color: '#10B981' }]}>{result.correct}</Text>
              <Text style={[styles.statLabel, isDark ? styles.textMuted : styles.textGray]}>Correct</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(239,68,68,0.08)' : '#FEF2F2', borderColor: isDark ? 'rgba(239,68,68,0.15)' : '#FEE2E2' }]}>
              <XCircle size={22} color="#EF4444" />
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{result.wrong}</Text>
              <Text style={[styles.statLabel, isDark ? styles.textMuted : styles.textGray]}>Wrong</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(156,163,175,0.08)' : '#F3F4F6', borderColor: isDark ? 'rgba(156,163,175,0.15)' : '#E5E7EB' }]}>
              <AlertCircle size={22} color="#6B7280" />
              <Text style={[styles.statValue, isDark ? styles.textWhite : styles.textBlack]}>{result.unattempted}</Text>
              <Text style={[styles.statLabel, isDark ? styles.textMuted : styles.textGray]}>Skipped</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF', borderColor: isDark ? 'rgba(59,130,246,0.15)' : '#DBEAFE' }]}>
              <Clock size={22} color="#3B82F6" />
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>{(result.durationSeconds / 60).toFixed(1)}</Text>
              <Text style={[styles.statLabel, isDark ? styles.textMuted : styles.textGray]}>Minutes</Text>
            </View>
          </View>
        </View>

        {/* Action Button Panel */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.actionBtnReview, isDark ? styles.actionBtnReviewDark : styles.actionBtnReviewLight]} 
            onPress={() => setShowSolutions(!showSolutions)}
            activeOpacity={0.8}
          >
            <Sparkles size={20} color={isDark ? '#F9FAFB' : '#111827'} />
            <Text style={[styles.actionBtnText, isDark ? styles.textWhite : styles.textBlack]}>
              {showSolutions ? 'Hide Solutions' : 'Review Solutions'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionRowBtnWrapper} 
              onPress={() => router.replace('/setup')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4F46E5', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtnGradient}
              >
                <RotateCcw size={18} color="#fff" />
                <Text style={styles.actionBtnSecondaryText}>Take Another</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionRowBtnWrapper} 
              onPress={() => router.replace('/')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1F2937', '#111827']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtnGradient}
              >
                <Home size={18} color="#fff" />
                <Text style={styles.actionBtnSecondaryText}>Home</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailed Solutions Accordion */}
        {showSolutions && (
          <View style={styles.solutions}>
            <View style={styles.solutionsHeader}>
              <Trophy size={22} color="#F59E0B" />
              <Text style={[styles.solutionsTitle, isDark ? styles.textWhite : styles.textBlack]}>Solutions</Text>
            </View>
            
            {result.questions.map((q: any, i) => {
              const ua = result.userAnswers[i];
              const userSelected = ua.selectedOption || ua.selectedAnswer;
              const timeSpent = ua.timeSpentSeconds || ua.timeSpent || 0;
              const options = q.options || q.all_answers || [];
              const correctAns = q.correctAnswer || q.correct_answer;
              const isCorrect = userSelected === correctAns;

              return (
                <View key={i} style={[
                  styles.solutionCard, 
                  isDark ? styles.cardDark : styles.cardLight, 
                  { borderLeftColor: isCorrect ? '#10B981' : userSelected ? '#EF4444' : '#9CA3AF' }
                ]}>
                  <View style={styles.solutionTop}>
                    <Text style={[styles.solutionNum, isDark ? styles.textMuted : styles.textGray]}>Question {i + 1}</Text>
                    <View style={styles.solutionMeta}>
                      <Clock size={12} color="#9CA3AF" />
                      <Text style={styles.solutionTime}>{timeSpent}s spent</Text>
                      {isCorrect && <CheckCircle size={16} color="#10B981" />}
                      {!isCorrect && userSelected && <XCircle size={16} color="#EF4444" />}
                    </View>
                  </View>
                  <Text style={[styles.solutionQuestion, isDark ? styles.textWhite : styles.textBlack]}>
                    {q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}
                  </Text>
                  
                  <View style={styles.optionsList}>
                    {options.map((ans: string, idx: number) => {
                      const isSelected = userSelected === ans;
                      const isActualCorrect = ans === correctAns;
                      
                      let bgStyle = isDark ? styles.optNormalDark : styles.optNormal;
                      let textStyle = isDark ? styles.textLight : styles.textBlack;
                      
                      if (isActualCorrect) {
                        bgStyle = isDark ? styles.optCorrectDark : styles.optCorrect;
                      } else if (isSelected) {
                        bgStyle = isDark ? styles.optWrongDark : styles.optWrong;
                      }

                      return (
                        <View key={idx} style={[styles.optBase, bgStyle]}>
                          <Text style={[styles.optText, textStyle]}>
                            {ans.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}
                          </Text>
                          {isActualCorrect && <CheckCircle size={16} color="#10B981" />}
                          {isSelected && !isActualCorrect && <XCircle size={16} color="#EF4444" />}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
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
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '800' },
  primaryBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textLight: { color: '#D1D5DB' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },
  
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  cardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  
  headerCard: { margin: 24, padding: 32, borderRadius: 28, alignItems: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6 },
  headerEmoji: { fontSize: 56, marginBottom: 12 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 8, letterSpacing: -0.5 },
  headerScore: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  
  scoreCard: { marginHorizontal: 24, padding: 24, borderRadius: 24, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  scoreCardTitle: { fontSize: 18, fontWeight: '800' },
  scoreCircleContainer: { alignItems: 'center', paddingVertical: 10 },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 8, alignItems: 'center', justifyContent: 'center' },
  scoreCircleLight: { borderColor: '#4F46E5' },
  scoreCircleDark: { borderColor: '#818CF8' },
  scoreCircleValue: { fontSize: 40, fontWeight: '900', color: '#4F46E5' },
  scoreCircleMax: { fontSize: 16, fontWeight: '700', color: '#9CA3AF' },
  
  statsGrid: { marginHorizontal: 24, marginTop: 24, padding: 24, borderRadius: 24, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  statsTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statBox: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', marginTop: 8, marginBottom: 2 },
  statLabel: { fontSize: 13, fontWeight: '700' },
  
  actions: { marginHorizontal: 24, marginTop: 24, gap: 12, marginBottom: 32 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: 16 },
  actionBtnReview: { borderWidth: 2 },
  actionBtnReviewLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  actionBtnReviewDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  actionBtnText: { fontSize: 16, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionRowBtnWrapper: { flex: 1 },
  actionBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  actionBtnSecondaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  
  solutions: { marginHorizontal: 24, marginTop: 16 },
  solutionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  solutionsTitle: { fontSize: 24, fontWeight: '900' },
  solutionCard: { padding: 20, borderRadius: 24, marginBottom: 16, borderLeftWidth: 4, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  solutionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  solutionNum: { fontSize: 13, fontWeight: '700' },
  solutionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  solutionTime: { fontSize: 12, color: '#9CA3AF' },
  solutionQuestion: { fontSize: 16, fontWeight: '800', lineHeight: 24, marginBottom: 16 },
  optionsList: { gap: 8 },
  optBase: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, borderWidth: 1 },
  optText: { flex: 1, fontSize: 14, fontWeight: '600' },
  optNormal: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' },
  optNormalDark: { backgroundColor: 'rgba(31,41,55,0.5)', borderColor: '#374151' },
  optCorrect: { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' },
  optCorrectDark: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' },
  optWrong: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  optWrongDark: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' },
});
