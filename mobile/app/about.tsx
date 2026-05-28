import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { 
  Globe, Shield, BookOpen, Users, Target, Heart, TrendingUp,
  Zap, Clock, Download, Smartphone,
  GraduationCap, Library, Brain, Quote, ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_NAME } from '../shared/constants';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AboutScreen() {
  const { isDark } = useTheme();

  // Core Features
  const features = [
    {
      Icon: Zap,
      title: "Interactive Quizzes",
      description: "Test your knowledge with fun quizzes across many topics. Get instant results and see where you stand.",
      gradient: ['#F59E0B', '#EF4444', '#EC4899'] as const,
    },
    {
      Icon: Library,
      title: "Free Books Library",
      description: "Access millions of free books from Open Library. Read online or download PDFs to study offline.",
      gradient: ['#C084FC', '#EC4899', '#F43F5E'] as const,
    },
    {
      Icon: Brain,
      title: "Track Your Progress",
      description: "See your quiz scores, track your learning journey, and watch yourself improve over time.",
      gradient: ['#22D3EE', '#3B82F6', '#4F46E5'] as const,
    },
    {
      Icon: Download,
      title: "Download & Save",
      description: "Save your favorite books to your personal library. Download PDFs to read anytime, anywhere.",
      gradient: ['#34D399', '#10B981', '#14B8A6'] as const,
    },
  ];

  // What makes us different
  const highlights = [
    {
      Icon: Globe,
      title: "100% Free",
      description: "No hidden costs, no premium plans. Everything is completely free forever.",
      gradient: ['#22D3EE', '#2563EB'] as const,
    },
    {
      Icon: Shield,
      title: "No Ads",
      description: "Learn without annoying ads or pop-ups. Just pure, clean learning experience.",
      gradient: ['#34D399', '#059669'] as const,
    },
    {
      Icon: Clock,
      title: "Learn Anytime",
      description: "Study at your own pace. Our platform is available 24/7, whenever you need it.",
      gradient: ['#FB923C', '#EF4444'] as const,
    },
    {
      Icon: Smartphone,
      title: "Works Everywhere",
      description: "Use on phone, tablet, or computer. Works great on all devices and screen sizes.",
      gradient: ['#C084FC', '#DB2777'] as const,
    },
  ];

  // Stats
  const stats = [
    { number: "24+", label: "Categories", Icon: GraduationCap },
    { number: "40+", label: "Topics", Icon: BookOpen },
    { number: "1M+", label: "Free Books", Icon: Library },
    { number: "100%", label: "Free Forever", Icon: Heart },
  ];

  // How it works steps
  const steps = [
    {
      step: 1,
      title: "Choose What to Learn",
      description: "Pick from 24+ categories like Science, History, Computer Science, and more.",
      Icon: Target
    },
    {
      step: 2,
      title: "Quizzes or Books",
      description: "Test your knowledge with quizzes or explore millions of free books on any topic.",
      Icon: BookOpen
    },
    {
      step: 3,
      title: "Track Your Progress",
      description: "See your scores, save favorite books, and watch your knowledge grow over time.",
      Icon: TrendingUp
    }
  ];

  // Inspirational Quotes
  const quotes = [
    {
      text: "Practice makes a man perfect.",
      author: "Ancient Proverb"
    },
    {
      text: "The more you read, the more things you will know. The more that you learn, the more places you'll go.",
      author: "Dr. Seuss"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    }
  ];

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      <Header />
      <ScrollView 
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, isDark ? styles.textWhite : styles.textBlack, { fontSize: 44, fontWeight: '900', lineHeight: 52, marginBottom: 16, letterSpacing: -1, textAlign: 'center' }]}>
            <Text style={{ color: '#A855F7' }}>About</Text> QuizHub
          </Text>
          <Text style={[styles.heroSubtitle, isDark ? styles.textMuted : styles.textGray]}>
            QuizHub is your free learning companion. Take quizzes to test your knowledge, read millions of books, and track your progress, all without spending a single penny.
          </Text>
        </View>

        {/* Stats Banner Section */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={['#4F46E5', '#EC4899', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsGradientCard}
          >
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statBox}>
                  <View style={styles.statIconWrapper}>
                    <stat.Icon size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* What Can You Do Here? (Core Features) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            What Can You Do Here?
          </Text>
          <Text style={[styles.sectionSubtitle, isDark ? styles.textMuted : styles.textGray]}>
            Everything you need to learn, test, and grow in one simple platform
          </Text>
        </View>

        <View style={styles.grid}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
            >
              <LinearGradient
                colors={feature.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <feature.Icon size={22} color="#fff" />
              </LinearGradient>
              <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>
                {feature.title}
              </Text>
              <Text style={[styles.cardText, isDark ? styles.textMuted : styles.textGray]}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>

        {/* How It Works connector timeline */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            How It Works
          </Text>
          <Text style={[styles.sectionSubtitle, isDark ? styles.textMuted : styles.textGray]}>
            Getting started is super easy, just 3 simple steps
          </Text>
        </View>

        <View style={styles.timelineContainer}>
          {steps.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              {/* Timeline bubble and connecting line */}
              <View style={styles.timelineLeft}>
                <LinearGradient
                  colors={['#4F46E5', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.timelineBubble}
                >
                  <item.Icon size={20} color="#fff" />
                  <View style={styles.timelineStepNumberBadge}>
                    <Text style={styles.timelineStepNumberText}>{item.step}</Text>
                  </View>
                </LinearGradient>
                {index < steps.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.timelineRight}>
                <Text style={[styles.timelineTitle, isDark ? styles.textWhite : styles.textBlack]}>
                  {item.title}
                </Text>
                <Text style={[styles.timelineText, isDark ? styles.textMuted : styles.textGray]}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Why Choose Us */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Why Choose QuizHub?
          </Text>
          <Text style={[styles.sectionSubtitle, isDark ? styles.textMuted : styles.textGray]}>
            We believe learning should be free and accessible to everyone
          </Text>
        </View>

        <View style={styles.grid}>
          {highlights.map((item, index) => (
            <View
              key={index}
              style={[styles.highlightCard, isDark ? styles.cardDark : styles.cardLight]}
            >
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.highlightIconContainer}
              >
                <item.Icon size={18} color="#fff" />
              </LinearGradient>
              <Text style={[styles.highlightTitle, isDark ? styles.textWhite : styles.textBlack]}>
                {item.title}
              </Text>
              <Text style={[styles.highlightText, isDark ? styles.textMuted : styles.textGray]}>
                {item.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Inspirational Quotes Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.quoteIconTitleWrapper}>
            <LinearGradient
              colors={['#4F46E5', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quoteIconBadge}
            >
              <Quote size={20} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack, { marginTop: 8 }]}>
            Words to Inspire You
          </Text>
        </View>

        <View style={styles.quotesContainer}>
          {quotes.map((quote, index) => (
            <LinearGradient
              key={index}
              colors={['#4F46E5', '#EC4899', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quoteCard}
            >
              <View style={styles.quoteCardPattern}>
                <Quote size={32} color="rgba(255,255,255,0.15)" style={styles.quoteCardBgIcon} />
                <Text style={styles.quoteCardText}>"{quote.text}"</Text>
                <Text style={styles.quoteCardAuthor}>{quote.author}</Text>
              </View>
            </LinearGradient>
          ))}
        </View>



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
  
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  badgeContainer: { marginBottom: 16 },
  badge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 30 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  heroTitle: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 12, lineHeight: 40, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 12 },

  // Stats Section
  statsSection: { paddingHorizontal: 24, marginBottom: 32 },
  statsGradientCard: { borderRadius: 24, paddingVertical: 24, paddingHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '50%', alignItems: 'center', paddingVertical: 12 },
  statIconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statNumber: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },

  // Section Headers
  sectionHeader: { alignItems: 'center', paddingHorizontal: 24, marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  sectionSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  grid: { paddingHorizontal: 24, gap: 16, marginBottom: 24 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  cardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  cardText: { fontSize: 13, lineHeight: 18 },

  // Highlights
  highlightCard: { padding: 16, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
  highlightIconContainer: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  highlightTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  highlightText: { fontSize: 12, lineHeight: 18, textAlign: 'center' },

  // Timeline
  timelineContainer: { paddingHorizontal: 24, marginBottom: 24, marginTop: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { alignItems: 'center', marginRight: 16, width: 48 },
  timelineBubble: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineStepNumberBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  timelineStepNumberText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  timelineLine: { width: 3, flex: 1, backgroundColor: '#E5E7EB', marginVertical: 4, minHeight: 48 },
  timelineRight: { flex: 1, paddingTop: 4, paddingBottom: 24 },
  timelineTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  timelineText: { fontSize: 13, lineHeight: 18 },

  // Quotes
  quoteIconTitleWrapper: { width: 44, height: 44, borderRadius: 12, overflow: 'hidden' },
  quoteIconBadge: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  quotesContainer: { paddingHorizontal: 24, gap: 16, marginBottom: 24 },
  quoteCard: { borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  quoteCardPattern: { padding: 24, minHeight: 120, justifyContent: 'center' },
  quoteCardBgIcon: { position: 'absolute', top: 12, right: 12 },
  quoteCardText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', lineHeight: 22, fontStyle: 'italic', marginBottom: 8 },
  quoteCardAuthor: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  


  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },
});
