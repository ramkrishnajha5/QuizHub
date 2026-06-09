import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Calendar, Phone, LogOut, Camera, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Alert from '../components/Alert';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ProfileScreen() {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (m: number, y: number) => {
    return new Date(y, m, 1).getDay();
  };

  const handleSelectDay = (day: number) => {
    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setDob(formattedDate);
    setShowDatePicker(false);
  };

  const changeMonth = (direction: number) => {
    let nextMonth = selectedMonth + direction;
    let nextYear = selectedYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const cells = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.calendarDayCellEmpty} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = dob === `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[styles.calendarDayCell, isSelected && styles.calendarDayCellActive]}
          onPress={() => handleSelectDay(day)}
        >
          <Text style={[styles.calendarDayText, isDark ? styles.textWhite : styles.textBlack, isSelected && styles.calendarDayTextActive]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        setName(currentUser.displayName || '');
        const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.phone) setPhone(data.phone);
          if (data.dob) setDob(data.dob);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    
    try {
      if (name !== currentUser.displayName) {
        await updateUserProfile(name);
      }

      await setDoc(doc(db, 'users', currentUser.uid), {
        phone: phone || null,
        dob: dob || null,
        updatedAt: new Date()
      }, { merge: true });

      setAlert({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlert({ type: 'error', message: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) return null;

  return (
    <SafeAreaView style={[styles.safe, isDark ? styles.safeDark : styles.safeLight]}>
      <Header />
      {alert && <Alert type={alert.type} message={alert.message} show={!!alert} onClose={() => setAlert(null)} />}

      <ScrollView 
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Profile Cover */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#4F46E5', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase() || '?'}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.85}>
              <Camera size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.nameTitle, isDark ? styles.textWhite : styles.textBlack]}>{name || 'Learner'}</Text>
          <Text style={[styles.emailSubtitle, isDark ? styles.textMuted : styles.textGray]}>{currentUser?.email}</Text>
        </View>



        {/* Edit Info Fields */}
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.cardHeader, isDark ? styles.textWhite : styles.textBlack]}>Personal Information</Text>

          <View style={styles.field}>
            <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Name</Text>
            <View style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight, focusedField === 'name' && styles.inputRowActive]}>
              <TextInput
                style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Your Name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Email</Text>
            <View style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight, styles.inputDisabled, focusedField === 'email' && styles.inputRowActive]}>
              <TextInput
                style={[styles.input, styles.textDisabled, isDark ? styles.textMuted : styles.textGray]}
                value={currentUser?.email || ''}
                editable={false}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <Text style={styles.helpText}>Email cannot be changed</Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Phone Number</Text>
            <View style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight, focusedField === 'phone' && styles.inputRowActive]}>
              <TextInput
                style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="+911234567890"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, isDark ? styles.textMuted : styles.textGray]}>Date of Birth</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowDatePicker(true)}
              style={[styles.inputRow, isDark ? styles.inputRowDark : styles.inputRowLight]}
            >
              <TextInput
                style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                value={dob}
                editable={false}
                placeholder="Select Date of Birth"
                placeholderTextColor="#9CA3AF"
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>

          {/* Save Button with Gradient */}
          <TouchableOpacity 
            style={saving && styles.btnDisabled} 
            onPress={handleSave} 
            disabled={saving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#9333EA', '#DB2777', '#EA580C']} // Matching web CTA primary gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutBtn, isDark ? styles.logoutBtnDark : styles.logoutBtnLight]} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Dashboard CTA */}
        <View style={styles.dashboardCta}>
          <LinearGradient
            colors={['#06B6D4', '#3B82F6', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dashboardCtaGradient}
          >
            <View style={styles.dashboardCtaContent}>
              <View style={styles.dashboardCtaTextWrapper}>
                <Text style={styles.dashboardCtaEmoji}>📊</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dashboardCtaTitle}>View Performance</Text>
                  <Text style={styles.dashboardCtaSub}>Check your stats on the dashboard</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/dashboard')}
                style={styles.dashboardCtaBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.dashboardCtaBtnText}>Go to Dashboard</Text>
                <ArrowRight size={16} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Custom Calendar Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.calendarCard, isDark ? styles.cardDark : styles.cardLight]}>
              <View style={styles.calendarHeader}>
                <Text style={[styles.calendarTitle, isDark ? styles.textWhite : styles.textBlack]}>Select Date of Birth</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.calendarCloseBtn}>
                  <Text style={{ fontSize: 20, color: '#EF4444', fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Navigation Month & Year */}
              <View style={styles.calendarNavRow}>
                <View style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#374151' : '#E5E7EB', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: isDark ? '#111827' : '#F9FAFB' }}>
                  <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 16, color: '#4F46E5', fontWeight: 'bold' }}>◀</Text>
                  </TouchableOpacity>
                  <Text style={[styles.calendarNavText, isDark ? styles.textWhite : styles.textBlack]}>{months[selectedMonth]}</Text>
                  <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 16, color: '#4F46E5', fontWeight: 'bold' }}>▶</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 0.8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#374151' : '#E5E7EB', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: isDark ? '#111827' : '#F9FAFB' }}>
                  <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 16, color: '#4F46E5', fontWeight: 'bold' }}>◀</Text>
                  </TouchableOpacity>
                  <Text style={[styles.calendarNavText, isDark ? styles.textWhite : styles.textBlack]}>{selectedYear}</Text>
                  <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 16, color: '#4F46E5', fontWeight: 'bold' }}>▶</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weekdays */}
              <View style={styles.weekDaysRow}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {renderCalendarDays()}
              </View>
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
  
  header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  avatarText: { fontSize: 44, fontWeight: '900', color: '#fff' },
  cameraBtn: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#4F46E5', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  nameTitle: { fontSize: 24, fontWeight: '900', marginBottom: 4, letterSpacing: -0.5 },
  emailSubtitle: { fontSize: 15 },
  
  card: { marginHorizontal: 24, padding: 24, borderRadius: 24, borderWidth: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 2 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  cardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  
  themeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 16 },
  themeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeIconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  
  cardHeader: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
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
  inputDisabled: { opacity: 0.7 },
  textDisabled: { color: '#9CA3AF' },
  helpText: { fontSize: 12, color: '#9CA3AF', marginTop: 6, paddingHorizontal: 4 },
  
  saveBtn: { alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 16, marginTop: 8, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  btnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: 16, borderWidth: 1, marginHorizontal: 24, marginTop: 16, marginBottom: 32 },
  logoutBtnLight: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' },
  logoutBtnDark: { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.15)' },
  logoutBtnText: { color: '#EF4444', fontWeight: '800', fontSize: 16 },

  textWhite: { color: '#F9FAFB' },
  textBlack: { color: '#111827' },
  textGray: { color: '#4B5563' },
  textMuted: { color: '#9CA3AF' },

  dashboardCta: { marginHorizontal: 24, marginTop: 16, borderRadius: 24, overflow: 'hidden' },
  dashboardCtaGradient: { padding: 24 },
  dashboardCtaContent: { gap: 16 },
  dashboardCtaTextWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dashboardCtaEmoji: { fontSize: 32 },
  dashboardCtaTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 2 },
  dashboardCtaSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  dashboardCtaBtn: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  dashboardCtaBtnText: { color: '#3B82F6', fontWeight: '800', fontSize: 15 },

  // Custom Calendar Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  calendarCloseBtn: {
    padding: 4,
  },
  calendarNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  calendarNavText: {
    fontSize: 15,
    fontWeight: '700',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 10,
  },
  calendarDayCellEmpty: {
    width: '14.28%',
    height: 40,
  },
  calendarDayCellActive: {
    backgroundColor: '#4F46E5',
  },
  calendarDayText: {
    fontSize: 15,
    fontWeight: '600',
  },
  calendarDayTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
