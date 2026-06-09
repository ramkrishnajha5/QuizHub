import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Mail, MessageSquare, Send, User, MapPin, Instagram, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { WEB3FORMS_ACCESS_KEY, INSTAGRAM_LINK } from '../shared/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Alert from '../components/Alert';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactScreen() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const contactInfo = [
    { Icon: Mail, title: "Email", value: "ram03krishna@gmail.com", link: "mailto:ram03krishna@gmail.com", gradient: ['#3B82F6', '#22D3EE'] as const },
    { Icon: MapPin, title: "Location", value: "India", gradient: ['#10B981', '#34D399'] as const },
    { Icon: Instagram, title: "Instagram", value: "@ramkrishnajha5", link: INSTAGRAM_LINK, gradient: ['#EC4899', '#F43F5E'] as const },
    { Icon: Clock, title: "Support", value: "24/7", gradient: ['#8B5CF6', '#6366F1'] as const }
  ];

  const handleOpenLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(err => console.error("Couldn't open URL", err));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setAlert({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          ...formData,
          subject: `New Contact Request from QuizHub Mobile`,
        })
      });

      const result = await response.json();
      if (response.status === 200) {
        setStatus('success');
        setFormData(prev => ({ ...prev, message: '' }));
        setAlert({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setAlert({ type: 'error', message: 'Failed to send message. Please try again.' });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      <Header />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView 
          style={[styles.container, isDark ? styles.containerDark : styles.containerLight]} 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
        >
          {alert && <Alert type={alert.type} message={alert.message} show={!!alert} onClose={() => setAlert(null)} />}

          {/* Header section with badge */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#4F46E5', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBadge}
            >
              <MessageSquare size={28} color="#fff" />
            </LinearGradient>
            <Text style={[styles.title, isDark ? styles.textWhite : styles.textBlack]}>Get in Touch</Text>
            <Text style={[styles.subtitle, isDark ? styles.textMuted : styles.textGray]}>
              Have questions or feedback? We'd love to hear from you! Fill out the form or reach out directly.
            </Text>
          </View>

          {/* Contact Info Cards (Grid) */}
          <View style={styles.infoGrid}>
            {contactInfo.map((info, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.infoCard, isDark ? styles.infoCardDark : styles.infoCardLight]}
                onPress={info.link ? () => handleOpenLink(info.link) : undefined}
                disabled={!info.link}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={info.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.infoIconWrapper}
                >
                  <info.Icon size={18} color="#fff" />
                </LinearGradient>
                <Text style={[styles.infoTitle, isDark ? styles.textMuted : styles.textGray]}>{info.title}</Text>
                <Text 
                  style={[
                    styles.infoValue, 
                    isDark ? styles.textWhite : styles.textBlack,
                    info.link && styles.linkText
                  ]}
                  numberOfLines={1}
                >
                  {info.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form Card */}
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.formHeaderTitle, isDark ? styles.textWhite : styles.textBlack]}>Send Message</Text>
            <Text style={[styles.formHeaderSub, isDark ? styles.textMuted : styles.textGray]}>Fill out the form and we'll get back soon</Text>
            
            {/* Name Field */}
            <View style={styles.field}>
              <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Name</Text>
              <View style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight, focusedField === 'name' && styles.inputRowActive]}>
                <TextInput
                  style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="Your Name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.field}>
              <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Email</Text>
              <View style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight, focusedField === 'email' && styles.inputRowActive]}>
                <TextInput
                  style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Message Field */}
            <View style={styles.field}>
              <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Message</Text>
              <View style={[styles.textAreaContainer, isDark ? styles.inputRowDark : styles.inputRowLight, focusedField === 'message' && styles.inputRowActive]}>
                <TextInput
                  style={[styles.textArea, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="Your message..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={formData.message}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Submit Button with Gradient */}
            <TouchableOpacity
              style={status === 'submitting' && styles.submitBtnDisabled}
              onPress={handleSubmit}
              disabled={status === 'submitting'}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4F46E5', '#EC4899', '#F97316']} // Aligning brand gradient with Indigo base
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                {status === 'submitting' ? (
                  <Text style={styles.submitBtnText}>Sending...</Text>
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Send Message</Text>
                    <Send size={16} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
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
  content: { paddingBottom: 0 },
  
  header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  iconBadge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 12, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 12 },
  
  // Info Cards Grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  infoCard: { width: '48%', padding: 16, borderRadius: 20, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  infoCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  infoCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  infoIconWrapper: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  infoTitle: { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, fontWeight: '800' },
  linkText: { color: '#4F46E5', textDecorationLine: 'underline' },

  // Form Card
  card: { marginHorizontal: 24, padding: 24, borderRadius: 24, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1, marginBottom: 24 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  cardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  formHeaderTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  formHeaderSub: { fontSize: 13, marginBottom: 20 },

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
  
  textAreaContainer: { borderWidth: 2, borderRadius: 16, padding: 16, borderColor: '#4F46E5' },
  textArea: {
    fontSize: 18,
    fontWeight: '600',
    minHeight: 120,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
      default: {}
    })
  },
  
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },
});
