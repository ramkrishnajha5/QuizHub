import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchQuestions } from '../shared/api';
import { saveQuizState, getQuizState, clearQuizState } from '../utils/storage';
import { Question, UserAnswer, QuizAttempt, QuizQuestion } from '../shared/types';
import { TIMERS } from '../shared/constants';
import { auth, db } from '../utils/firebase';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Alert from '../components/Alert';
import { saveQuizResult } from '../utils/saveQuizResult';
import { useAuth } from '../contexts/AuthContext';
import { useQuiz } from '../contexts/QuizContext';
import CustomModal from '../components/CustomModal';
import { useTheme } from '../contexts/ThemeContext';

export default function QuizRunnerScreen() {
  const params = useLocalSearchParams<{ config: string }>();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { setQuizInProgress } = useQuiz();
  const { isDark } = useTheme();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizStartedAt] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [categoryId, setCategoryId] = useState<number>(9);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'confirm' as const, confirmText: 'Submit', cancelText: 'Cancel', confirmStyle: 'primary' as 'primary' | 'danger', onConfirm: null as (() => void) | null });
  const [source, setSource] = useState<string>('api');
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);
  const [quizId, setQuizId] = useState<string>('');
  const [submitCooldown, setSubmitCooldown] = useState<number>(0);

  const warningShownRef = useRef(false);
  const stateRef = useRef({ questions, currentQuestionIndex, userAnswers, timeLeft });
  const initRef = useRef(false);

  useEffect(() => {
    stateRef.current = { questions, currentQuestionIndex, userAnswers, timeLeft };
  }, [questions, currentQuestionIndex, userAnswers, timeLeft]);

  // Intercept Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!loading && !isSubmitting && isInitialized) {
        setModalState({
          isOpen: true, title: 'Leave Quiz?', message: 'Your progress will be saved. You can resume later.',
          type: 'confirm', confirmText: 'Leave', cancelText: 'Stay', confirmStyle: 'danger',
          onConfirm: () => { setQuizInProgress(false); router.back(); },
        });
        return true; // prevent default
      }
      return false;
    });
    return () => backHandler.remove();
  }, [loading, isSubmitting, isInitialized]);

  // Initial Load
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      try {
        const saved = await getQuizState();
        if (saved && saved.status === 'active') {
          setQuestions(saved.questions);
          setUserAnswers(saved.userAnswers);
          setTimeLeft(saved.timeLeft);
          setCurrentQuestionIndex(saved.currentQuestionIndex);
          setCategoryId(saved.categoryId || 0);
          setQuestionCount(saved.questionCount || saved.questions.length);
          setSource(saved.source || 'api');
          setNegativeMarking(saved.negativeMarking || false);
          setQuizId(saved.quizId || '');
          setLoading(false);
          setIsInitialized(true);
          setQuizInProgress(true);
          return;
        }

        const configStr = params.config;
        if (!configStr) { router.replace('/setup'); return; }
        const state = JSON.parse(configStr);

        // ══ Admin Custom Quiz ══
        if (state?.source === 'admin' && state.questions) {
          const qs: Question[] = state.questions.map((q: any, i: number) => ({
            question: q.questionText,
            correct_answer: q.options[q.correctOption],
            incorrect_answers: q.options.filter((_: string, idx: number) => idx !== q.correctOption),
            all_answers: q.options,
            category: state.category || 'Custom Quiz',
            difficulty: state.difficulty || 'medium',
            type: 'multiple',
          }));

          setCategoryId(0);
          setQuestionCount(qs.length);
          setQuestions(qs);
          setSource('admin');
          setNegativeMarking(state.negativeMarking || false);
          setQuizId(state.quizId || '');

          const initialAnswers: UserAnswer[] = qs.map((_, i) => ({ questionIndex: i, selectedAnswer: null, isMarkedForReview: false, timeSpent: 0 }));
          setUserAnswers(initialAnswers);
          setTimeLeft((state.timeLimitMinutes || qs.length) * 60);
          setLoading(false);
          setIsInitialized(true);
          setQuizInProgress(true);
          return;
        }

        // ══ Regular OpenTDB Quiz ══
        if (!state.categoryId) { router.replace('/setup'); return; }

        setCategoryId(state.categoryId);
        setQuestionCount(state.questionCount || 15);
        setSource('api');
        setNegativeMarking(false);
        setQuizId('');

        const response = await fetchQuestions(state.categoryId, state.questionCount);
        const qs = response.questions;
        if (!qs || qs.length === 0) {
          setAlert({ type: 'error', message: 'No questions available. Try a different category.' });
          setTimeout(() => router.replace('/setup'), 3000);
          return;
        }

        setQuestions(qs);
        const initialAnswers: UserAnswer[] = qs.map((_, i) => ({ questionIndex: i, selectedAnswer: null, isMarkedForReview: false, timeSpent: 0 }));
        setUserAnswers(initialAnswers);
        setTimeLeft(TIMERS[state.questionCount] || TIMERS[15]);
        setLoading(false);
        setIsInitialized(true);
        setQuizInProgress(true);
      } catch (error: any) {
        console.error('Error initializing quiz:', error);
        setAlert({ type: 'error', message: error.message || 'Failed to load questions' });
        setTimeout(() => router.replace('/setup'), 3000);
      }
    };
    init();
  }, []);

  // Timer
  useEffect(() => {
    if (loading || timeLeft <= 0 || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); finishQuiz(); return 0; }
        if (prev === 31 && !warningShownRef.current) {
          warningShownRef.current = true;
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
        }
        setUserAnswers(prevAnswers => {
          const updated = [...prevAnswers];
          if (updated[currentQuestionIndex]) updated[currentQuestionIndex].timeSpent += 1;
          return updated;
        });
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, currentQuestionIndex, isSubmitting]);

  // Autosave
  useEffect(() => {
    const saver = setInterval(() => {
      if (!loading && !isSubmitting && questions.length > 0) {
        saveQuizState({
          status: 'active',
          category: questions[0]?.category || 'General',
          categoryId,
          questionCount,
          source,
          negativeMarking,
          quizId,
          ...stateRef.current
        });
      }
    }, 5000);
    return () => clearInterval(saver);
  }, [loading, isSubmitting, questions, categoryId, questionCount, source, negativeMarking, quizId]);

  const handleAnswer = (answer: string) => {
    const updated = [...userAnswers];
    updated[currentQuestionIndex].selectedAnswer = answer;
    setUserAnswers(updated);
  };

  const toggleMarkReview = () => {
    const updated = [...userAnswers];
    updated[currentQuestionIndex].isMarkedForReview = !updated[currentQuestionIndex].isMarkedForReview;
    setUserAnswers(updated);
  };

  const finishQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setQuizInProgress(false);

    let correct = 0, wrong = 0, unattempted = 0, score = 0;
    questions.forEach((q, i) => {
      const ans = userAnswers[i].selectedAnswer;
      if (!ans) unattempted++;
      else if (ans === q.correct_answer) { correct++; score += 1; }
      else {
        wrong++;
        if (negativeMarking) {
          score -= 0.25;
        }
      }
    });
    score = Math.max(0, score);
    const percent = (score / questions.length) * 100;
    const endedAt = Date.now();

    const quizQuestions: QuizQuestion[] = questions.map((q, i) => ({ questionId: `q_${i}`, question: q.question, options: q.all_answers || [], correctAnswer: q.correct_answer }));
    const quizUserAnswers = userAnswers.map((ua, i) => ({
      questionId: `q_${i}`,
      selectedOption: ua.selectedAnswer,
      isCorrect: ua.selectedAnswer === questions[i].correct_answer,
      timeSpent: ua.timeSpent,
      timeSpentSeconds: ua.timeSpent
    }));

    const difficulties = [...new Set(questions.map(q => String(q.difficulty || 'mixed')))];
    const quizDifficulty = difficulties.length === 1 ? String(difficulties[0]) : 'mixed';

    const attemptData: QuizAttempt = {
      id: uuidv4(), userId: currentUser?.uid || 'guest', categoryId, category: questions[0]?.category || 'General',
      categoryName: questions[0]?.category || 'General', difficulty: quizDifficulty, questionCount,
      startedAt: quizStartedAt, finishedAt: endedAt, durationSeconds: (endedAt - quizStartedAt) / 1000,
      score, percent, correct, wrong, unattempted, totalQuestions: questions.length,
      questions: quizQuestions, userAnswers: quizUserAnswers,
      ...(source === 'admin' ? {
        source: 'admin',
        quizId,
        negativeMarking
      } : {}),
    };

    if (currentUser) {
      try { await saveQuizResult(currentUser.uid, attemptData); } catch (e) { console.error("Failed to save:", e); }
    }

    await clearQuizState();
    router.replace({ pathname: '/results', params: { result: JSON.stringify(attemptData) } });
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && { backgroundColor: '#111827' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={[styles.loadingText, isDark && { color: '#9CA3AF' }]}>Preparing your quiz...</Text>
      </View>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const currentA = userAnswers[currentQuestionIndex];
  const timerColor = timeLeft < 30 ? '#EF4444' : timeLeft < 120 ? '#F97316' : isDark ? '#D1D5DB' : '#374151';

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      {alert && <Alert type={alert.type} message={alert.message} show={!!alert} onClose={() => setAlert(null)} />}

      {/* Focused HUD Quiz Top Bar */}
      <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
        <Text style={[styles.questionNum, isDark ? styles.textMuted : styles.textGray]}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <View style={styles.timer}>
          <Clock size={16} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>{formatTime(timeLeft)}</Text>
        </View>

        <TouchableOpacity
          disabled={submitCooldown > 0}
          onPress={() => {
            if (submitCooldown > 0) return;
            setModalState({
              isOpen: true,
              title: 'Submit Quiz?',
              message: 'You cannot change answers after submission.',
              type: 'confirm',
              confirmText: 'Submit',
              cancelText: 'Cancel',
              confirmStyle: 'primary',
              onConfirm: () => {
                setSubmitCooldown(5);
                const cd = setInterval(() => {
                  setSubmitCooldown(p => {
                    if (p <= 1) {
                      clearInterval(cd);
                      return 0;
                    }
                    return p - 1;
                  });
                }, 1000);
                finishQuiz();
              }
            });
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={submitCooldown > 0 ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']} // Greyed out if in cooldown
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            <Text style={styles.submitBtnText}>{submitCooldown > 0 ? `Wait ${submitCooldown}s` : 'Submit'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Question Shuffled Selector Palette */}
      <View style={[styles.paletteContainer, isDark ? styles.borderDark : styles.borderLight]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.palette, isDark ? styles.paletteDark : styles.paletteLight]} contentContainerStyle={styles.paletteContent}>
          {questions.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentQuestionIndex(i)}
              style={[
                styles.paletteBtn,
                i === currentQuestionIndex && styles.paletteBtnActive,
                userAnswers[i].isMarkedForReview && styles.paletteBtnReview,
                userAnswers[i].selectedAnswer && !userAnswers[i].isMarkedForReview && styles.paletteBtnAnswered,
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.paletteBtnText, 
                i === currentQuestionIndex && styles.paletteBtnTextActive,
                userAnswers[i].isMarkedForReview && { color: '#D97706' },
                userAnswers[i].selectedAnswer && !userAnswers[i].isMarkedForReview && { color: '#10B981' }
              ]}>
                {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Question Panel */}
      <ScrollView style={styles.questionArea} contentContainerStyle={styles.questionContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.questionCard, isDark ? styles.questionCardDark : styles.questionCardLight]}>
          <View style={styles.questionHeader}>
            <View style={[styles.categoryBadge, isDark ? styles.categoryBadgeDark : styles.categoryBadgeLight]}>
              <Text style={styles.categoryText}>{currentQ.category}</Text>
            </View>
            <TouchableOpacity 
              onPress={toggleMarkReview} 
              style={[styles.markBtn, currentA.isMarkedForReview && styles.markBtnActive, isDark && currentA.isMarkedForReview && styles.markBtnActiveDark]}
              activeOpacity={0.7}
            >
              <Flag size={14} color={currentA.isMarkedForReview ? '#D97706' : '#9CA3AF'} fill={currentA.isMarkedForReview ? '#D97706' : 'none'} />
              <Text style={[styles.markBtnText, currentA.isMarkedForReview && styles.markBtnTextActive]}>
                {currentA.isMarkedForReview ? 'Review' : 'Flag'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.questionText, isDark ? styles.textWhite : styles.textDark]}>
            {currentQ.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
          </Text>

          {currentQ.all_answers?.map((opt, idx) => {
            const isSelected = currentA.selectedAnswer === opt;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleAnswer(opt)}
                style={[
                  styles.optionBtn,
                  isDark ? styles.optionBtnDark : styles.optionBtnLight,
                  isSelected && styles.optionBtnSelected,
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.optionNumber, isSelected && styles.optionNumberSelected]}>
                  <Text style={[styles.optionNumberText, isSelected && styles.optionNumberTextSelected]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, isDark ? styles.textLight : styles.textDark]}>
                  {opt.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}
                </Text>
                {isSelected && <CheckCircle size={20} color="#4F46E5" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Back and Next Button Panel */}
      <View style={[styles.navBar, isDark ? styles.navBarDark : styles.navBarLight]}>
        <TouchableOpacity
          onPress={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
          disabled={currentQuestionIndex === 0}
          style={[
            styles.navBtn, 
            styles.navBtnPrev, 
            isDark ? styles.navBtnPrevDark : styles.navBtnPrevLight, 
            currentQuestionIndex === 0 && styles.navBtnDisabled
          ]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color={isDark ? '#D1D5DB' : '#374151'} />
          <Text style={[styles.navBtnText, isDark ? styles.textLight : styles.textDark]}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setCurrentQuestionIndex(p => Math.min(questions.length - 1, p + 1))}
          disabled={currentQuestionIndex === questions.length - 1}
          style={[styles.navBtnWrapper, currentQuestionIndex === questions.length - 1 && styles.navBtnDisabled]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4F46E5', '#3730A3']} // Premium Indigo gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.navBtnNext}
          >
            <Text style={styles.navBtnNextText}>Next</Text>
            <ChevronRight size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Time Warning */}
      {showTimeWarning && (
        <View style={styles.timeWarning}>
          <AlertTriangle size={20} color="#fff" />
          <View>
            <Text style={styles.timeWarningTitle}>⏰ Only 30 seconds left!</Text>
            <Text style={styles.timeWarningText}>Quiz will auto-submit when time runs out.</Text>
          </View>
        </View>
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
  containerDark: { backgroundColor: '#111827' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '700' },
  textWhite: { color: '#F9FAFB' },
  textDark: { color: '#111827' },
  textLight: { color: '#D1D5DB' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  topBarLight: { backgroundColor: '#FFFFFF', borderBottomColor: '#E5E7EB' },
  topBarDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  questionNum: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  submitBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  paletteContainer: { borderBottomWidth: 1 },
  borderLight: { borderBottomColor: '#E5E7EB' },
  borderDark: { borderBottomColor: '#374151' },
  palette: { maxHeight: 52 },
  paletteLight: { backgroundColor: '#F9FAFB' },
  paletteDark: { backgroundColor: '#1F2937' },
  paletteContent: { paddingHorizontal: 16, alignItems: 'center', gap: 8, paddingVertical: 8 },
  paletteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  paletteBtnActive: { borderWidth: 2, borderColor: '#4F46E5', backgroundColor: 'transparent' },
  paletteBtnReview: { backgroundColor: '#FEF3C7' },
  paletteBtnAnswered: { backgroundColor: '#D1FAE5' },
  paletteBtnText: { fontSize: 12, fontWeight: '800' },
  paletteBtnTextActive: { color: '#4F46E5' },

  questionArea: { flex: 1 },
  questionContent: { padding: 24 },
  questionCard: { padding: 24, borderRadius: 24, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  questionCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  questionCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryBadgeLight: { backgroundColor: '#EFF6FF' },
  categoryBadgeDark: { backgroundColor: 'rgba(59,130,246,0.15)' },
  categoryText: { fontSize: 10, fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 0.5 },
  markBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  markBtnActive: { backgroundColor: '#FEF3C7' },
  markBtnActiveDark: { backgroundColor: 'rgba(217,119,6,0.2)' },
  markBtnText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  markBtnTextActive: { color: '#D97706' },

  questionText: { fontSize: 18, fontWeight: '800', lineHeight: 28, marginBottom: 24 },

  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 2, borderRadius: 16, marginBottom: 12, gap: 12 },
  optionBtnLight: { borderColor: '#F3F4F6' },
  optionBtnDark: { borderColor: '#374151' },
  optionBtnSelected: { borderColor: '#4F46E5', backgroundColor: 'rgba(79,70,229,0.06)' },
  optionNumber: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  optionNumberSelected: { backgroundColor: '#4F46E5' },
  optionNumberText: { fontSize: 14, fontWeight: '800', color: '#6B7280' },
  optionNumberTextSelected: { color: '#fff' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 22 },

  navBar: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, gap: 12, borderTopWidth: 1 },
  navBarLight: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E7EB' },
  navBarDark: { backgroundColor: '#111827', borderTopColor: '#374151' },
  navBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 52, borderRadius: 16, borderWidth: 1 },
  navBtnPrev: { flex: 0.4 },
  navBtnPrevLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  navBtnPrevDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  navBtnWrapper: { flex: 0.6 },
  navBtnNext: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 52, borderRadius: 16 },
  navBtnDisabled: { opacity: 0.5 },
  navBtnText: { fontSize: 15, fontWeight: '700' },
  navBtnNextText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  timeWarning: { position: 'absolute', top: 100, left: 16, right: 16, backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8, zIndex: 100 },
  timeWarningTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  timeWarningText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
});
