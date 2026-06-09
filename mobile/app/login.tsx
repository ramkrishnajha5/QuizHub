import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, LogIn, AlertTriangle, ShieldAlert } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isFirebaseConfigured } from '../utils/firebase';
import Alert from '../components/Alert';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const { isDark } = useTheme();
  const { bannedMessage, clearBannedMessage, login, loginWithGoogle } = useAuth();

  useEffect(() => {
    return () => clearBannedMessage();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      router.replace('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Google Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      <Header />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            {/* Header Section */}
            <View style={styles.logoContainer}>
              <View style={styles.badgeContainer}>
                <LinearGradient
                  colors={['#4F46E5', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.logoBadge}
                >
                  <Text style={styles.logoText}>✨ QUIZHUB</Text>
                </LinearGradient>
              </View>
              <Text style={[styles.title, isDark ? styles.textWhite : styles.textBlack]}>Welcome Back!</Text>
              <Text style={[styles.subtitle, isDark ? styles.textMuted : styles.textGray]}>Sign in to continue learning</Text>
            </View>

            {/* Banned Warning */}
            {bannedMessage && (
              <View style={styles.bannedBox}>
                <ShieldAlert size={18} color="#EF4444" />
                <Text style={styles.bannedText}>{bannedMessage}</Text>
              </View>
            )}

            {/* Firebase Warning */}
            {!isFirebaseConfigured() && (
              <View style={styles.warningBox}>
                <AlertTriangle size={18} color="#F59E0B" />
                <Text style={styles.warningText}>Firebase config missing. Add keys in constants.ts</Text>
              </View>
            )}

            {/* Email Field */}
            <View style={styles.field}>
              <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Email</Text>
              <View style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight, focusedField === 'email' && styles.inputRowActive]}>
                <TextInput
                  style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.field}>
              <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Password</Text>
              <View style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight, focusedField === 'password' && styles.inputRowActive]}>
                <TextInput
                  style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Login Button with Linear Gradient */}
            <TouchableOpacity
              style={loading && styles.disabledButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#9333EA', '#DB2777', '#EA580C']} // Matching web CTA primary gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                <LogIn size={20} color="#fff" />
                <Text style={styles.loginButtonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Continue with Google Option */}
            <TouchableOpacity
              style={[styles.googleButton, isDark ? styles.googleButtonDark : styles.googleButtonLight]}
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={[styles.googleButtonText, isDark ? styles.textWhite : styles.textBlack]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupRow}>
              <Text style={[styles.signupText, isDark ? styles.textMuted : styles.textGray]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: { paddingBottom: 0 },

  card: { marginHorizontal: 24, marginVertical: 32, padding: 28, borderRadius: 28, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  cardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },

  logoContainer: { alignItems: 'center', marginBottom: 28 },
  badgeContainer: { marginBottom: 16 },
  logoBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 30 },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },

  bannedBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#EF4444', padding: 14, borderRadius: 12, marginBottom: 16 },
  bannedText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#991B1B' },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFFBEB', borderLeftWidth: 4, borderLeftColor: '#F59E0B', padding: 14, borderRadius: 12, marginBottom: 16 },
  warningText: { flex: 1, fontSize: 13, fontWeight: '500', color: '#92400E' },

  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderRadius: 16, paddingHorizontal: 16, height: 60 },
  inputRowLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  inputRowDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  inputRowActive: { borderColor: '#3B82F6' },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
      default: {}
    })
  },

  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 16, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 14, fontWeight: '500', color: '#991B1B' },

  loginButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 8, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  loginButtonText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  disabledButton: { opacity: 0.5 },

  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signupText: { fontSize: 15 },
  signupLink: { fontSize: 15, fontWeight: '800', color: '#4F46E5' },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    marginTop: 12,
  },
  googleButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  googleButtonDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  googleButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
});
