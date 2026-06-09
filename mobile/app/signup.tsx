import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const { isDark } = useTheme();
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signup(email, password, name);
      router.replace('/');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      <Header />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
              <Text style={[styles.title, isDark ? styles.textWhite : styles.textBlack]}>Create Account</Text>
              <Text style={[styles.subtitle, isDark ? styles.textMuted : styles.textGray]}>Start your learning journey today</Text>
            </View>

            {/* Name */}
            <View style={styles.field}>
              <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Name</Text>
              <View style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight, focusedField === 'name' && styles.inputRowActive]}>
                <TextInput 
                  style={[styles.input, isDark ? styles.textWhite : styles.textBlack]} 
                  placeholder="Your Name" 
                  placeholderTextColor="#9CA3AF" 
                  value={name} 
                  onChangeText={setName} 
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words" 
                />
              </View>
            </View>

            {/* Email */}
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
                />
              </View>
            </View>

            {/* Password */}
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

            {/* Confirm Password */}
            <View style={styles.field}>
              <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Confirm Password</Text>
              <View style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight, focusedField === 'confirmPassword' && styles.inputRowActive]}>
                <TextInput 
                  style={[styles.input, isDark ? styles.textWhite : styles.textBlack]} 
                  placeholder="••••••••" 
                  placeholderTextColor="#9CA3AF" 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                  onFocus={() => setFocusedField('confirmPassword')}
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

            {/* Signup Button with Linear Gradient */}
            <TouchableOpacity 
              style={loading && styles.disabledButton} 
              onPress={handleSignup} 
              disabled={loading} 
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#9333EA', '#DB2777', '#EA580C']} // Matching web CTA primary gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signupButton}
              >
                <UserPlus size={20} color="#fff" />
                <Text style={styles.signupButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={[styles.loginText, isDark ? styles.textMuted : styles.textGray]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
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

  field: { marginBottom: 16 },
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

  signupButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 8, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  signupButtonText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  disabledButton: { opacity: 0.5 },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 15 },
  loginLink: { fontSize: 15, fontWeight: '800', color: '#4F46E5' },
});
