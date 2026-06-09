import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, BookOpen, Target, Trophy, Play, ArrowRight, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_NAME } from '../shared/constants';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomeScreen() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const features = [
    {
      Icon: Zap,
      title: "Interactive Quizzes",
      description: "Test your knowledge with engaging quizzes across 24+ categories",
      gradient: ['#F59E0B', '#EF4444'], // Yellow-400 to Orange-500
    },
    {
      Icon: BookOpen,
      title: "Study Resources",
      description: "Access millions of books powered by Google Books API",
      gradient: ['#22D3EE', '#3B82F6'], // Cyan-400 to Blue-500
    },
    {
      Icon: Target,
      title: "Track Progress",
      description: "Monitor your performance with detailed analytics",
      gradient: ['#34D399', '#10B981'], // Green-400 to Emerald-500
    },
    {
      Icon: Trophy,
      title: "Achieve Goals",
      description: "Set targets and watch yourself improve every day",
      gradient: ['#A78BFA', '#EC4899'], // Purple-400 to Pink-500
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      {/* Premium Web-Aligned Custom Header */}
      <Header />

      <ScrollView
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={['#4F46E5', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badge}
            >
              <Zap size={14} color="#fff" fill="#fff" />
              <Text style={styles.badgeText}>{APP_NAME}</Text>
            </LinearGradient>
          </View>

          {/* Master Your Knowledge Header */}
          <Text style={[styles.heroTitle, isDark ? styles.textWhite : styles.textBlack]}>
            <Text style={styles.heroTitleGradient}>Master</Text>{'\n'}
            Your Knowledge
          </Text>

          <Text style={[styles.heroSubtitle, isDark ? styles.textMuted : styles.textGray]}>
            Challenge yourself with interactive quizzes, explore millions of study resources, and track your progress — all completely{' '}
            <Text style={{ fontWeight: '800', color: '#10B981' }}>free</Text>!
          </Text>

          {/* CTA Buttons */}
          <TouchableOpacity
            onPress={() => router.push('/setup')}
            activeOpacity={0.85}
            style={styles.ctaButtonWrapper}
          >
            <LinearGradient
              colors={['#9333EA', '#DB2777', '#EA580C']} // Purple-600 via Pink-600 to Orange-500
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Play size={20} color="#fff" fill="#fff" />
              <Text style={styles.primaryButtonText}>Start Quiz Now</Text>
              <ArrowRight size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, isDark ? styles.secondaryButtonDark : styles.secondaryButtonLight]}
            onPress={() => router.push(currentUser ? '/study' : '/signup')}
            activeOpacity={0.85}
          >
            {currentUser ? (
              <>
                <BookOpen size={20} color={isDark ? '#fff' : '#111827'} />
                <Text style={[styles.secondaryButtonText, isDark ? styles.textWhite : styles.textBlack]}>Explore Resources</Text>
              </>
            ) : (
              <>
                <UserPlus size={20} color={isDark ? '#fff' : '#111827'} />
                <Text style={[styles.secondaryButtonText, isDark ? styles.textWhite : styles.textBlack]}>Create an Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Everything You Need
          </Text>
          <Text style={[styles.sectionSubtitle, isDark ? styles.textMuted : styles.textGray]}>
            Powerful features to supercharge your learning
          </Text>

          {features.map((feature, index) => (
            <View
              key={index}
              style={[styles.featureCard, isDark ? styles.featureCardDark : styles.featureCardLight]}
            >
              {/* Premium Gradient Icon Container */}
              <LinearGradient
                colors={feature.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featureIcon}
              >
                <feature.Icon size={24} color="#fff" />
              </LinearGradient>

              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, isDark ? styles.textWhite : styles.textBlack]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDesc, isDark ? styles.textMuted : styles.textGray]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Navigation - Premium User Dashboard Nav */}
        {currentUser && (
          <View style={styles.quickNav}>
            <TouchableOpacity
              style={styles.quickNavItemWrapper}
              onPress={() => router.push('/dashboard')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4F46E5', '#3730A3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.quickNavItem}
              >
                <Target size={20} color="#fff" />
                <Text style={styles.quickNavText}>Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickNavItemWrapper}
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.quickNavItem}
              >
                <UserPlus size={20} color="#fff" />
                <Text style={styles.quickNavText}>Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Premium Custom Footer */}
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

  // Hero
  hero: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32, alignItems: 'center' },
  badgeContainer: { marginBottom: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 30, alignSelf: 'center' },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroTitle: { fontSize: 44, fontWeight: '900', lineHeight: 52, marginBottom: 16, letterSpacing: -1, textAlign: 'center' },
  heroTitleGradient: { color: '#9333EA' }, // Styled solid matching primary purple gradient
  heroSubtitle: { fontSize: 16, lineHeight: 26, marginBottom: 32, textAlign: 'center' },
  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },

  // Buttons
  ctaButtonWrapper: { marginBottom: 12, width: '100%', alignSelf: 'stretch' },
  primaryButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 16, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  primaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 16, borderWidth: 2, width: '100%', alignSelf: 'stretch' },
  secondaryButtonLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  secondaryButtonDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  secondaryButtonText: { fontWeight: '800', fontSize: 18 },

  // Features
  features: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 },
  sectionTitle: { fontSize: 32, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  sectionSubtitle: { fontSize: 16, marginBottom: 24 },
  featureCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  featureCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  featureCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  featureIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  featureDesc: { fontSize: 14, lineHeight: 20 },

  // Quick Nav
  quickNav: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 16 },
  quickNavItemWrapper: { flex: 1 },
  quickNavItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  quickNavText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
