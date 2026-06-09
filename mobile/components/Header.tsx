import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated, Dimensions, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, X, Zap, Sun, Moon, Smartphone, User, LogOut, Download } from 'lucide-react-native';
import { APP_NAME } from '../shared/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Header() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (path: any) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  const openApkDownload = () => {
    Linking.openURL('https://github.com/ramkrishnajha5/QuizHub/releases/download/v2.2.0/QuizHub.apk').catch(err =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <View style={styles.zWrapper}>
      {/* Top Header Bar */}
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
        {/* Logo */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => handleNavigate('/')}
          activeOpacity={0.7}
        >
          <Zap size={24} color="#F59E0B" fill="#F59E0B" />
          <Text style={[styles.logoText, isDark ? styles.textWhite : styles.textBlack]}>
            {APP_NAME}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Theme"
          >
            {isDark ? (
              <Sun size={20} color="#FBBF24" />
            ) : (
              <Moon size={20} color="#4B5563" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setIsMenuOpen(!isMenuOpen)}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Menu"
          >
            {isMenuOpen ? (
              <X size={24} color={isDark ? '#F3F4F6' : '#1F2937'} />
            ) : (
              <Menu size={24} color={isDark ? '#F3F4F6' : '#1F2937'} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide-Down Navigation Menu */}
      {isMenuOpen && (
        <View style={[styles.menuDropdown, isDark ? styles.menuDark : styles.menuLight]}>
          <ScrollView
            contentContainerStyle={styles.menuScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <View style={styles.menuLinks}>
              <TouchableOpacity
                style={[styles.menuItem, isDark ? styles.menuItemDark : styles.menuItemLight]}
                onPress={() => handleNavigate('/')}
              >
                <Text style={[styles.menuItemText, isDark ? styles.textWhite : styles.textBlack]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, isDark ? styles.menuItemDark : styles.menuItemLight]}
                onPress={() => handleNavigate('/study')}
              >
                <Text style={[styles.menuItemText, isDark ? styles.textWhite : styles.textBlack]}>Study</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, isDark ? styles.menuItemDark : styles.menuItemLight]}
                onPress={() => handleNavigate('/about')}
              >
                <Text style={[styles.menuItemText, isDark ? styles.textWhite : styles.textBlack]}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, isDark ? styles.menuItemDark : styles.menuItemLight]}
                onPress={() => handleNavigate('/contact')}
              >
                <Text style={[styles.menuItemText, isDark ? styles.textWhite : styles.textBlack]}>Contact Us</Text>
              </TouchableOpacity>

              {currentUser ? (
                <View style={[styles.userSection, isDark ? styles.borderDark : styles.borderLight]}>
                  <View style={styles.userInfo}>
                    {currentUser.photoURL ? (
                      <Image source={{ uri: currentUser.photoURL }} style={styles.userAvatar} />
                    ) : (
                      <View style={styles.userInitials}>
                        <User size={18} color="#fff" />
                      </View>
                    )}
                    <Text style={[styles.userName, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={1}>
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.menuItem, isDark ? styles.menuItemDark : styles.menuItemLight]}
                    onPress={() => handleNavigate('/dashboard')}
                  >
                    <Text style={[styles.menuItemText, isDark ? styles.textWhite : styles.textBlack]}>Dashboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, isDark ? styles.menuItemDark : styles.menuItemLight]}
                    onPress={() => handleNavigate('/saved-books')}
                  >
                    <Text style={[styles.menuItemText, isDark ? styles.textWhite : styles.textBlack]}>Saved Books</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, isDark ? styles.menuItemDark : styles.menuItemLight]}
                    onPress={() => handleNavigate('/profile')}
                  >
                    <Text style={[styles.menuItemText, isDark ? styles.textWhite : styles.textBlack]}>Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                  >
                    <LogOut size={16} color="#EF4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.loginContainer}>
                  <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={() => handleNavigate('/login')}
                  >
                    <Text style={styles.loginBtnText}>Login</Text>
                  </TouchableOpacity>
                </View>
              )}


            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  zWrapper: {
    zIndex: 9999,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
  },
  headerDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    shadowColor: '#000000',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWhite: {
    color: '#F9FAFB',
  },
  textBlack: {
    color: '#111827',
  },

  // Dropdown
  menuDropdown: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT - 64,
    borderTopWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 9999,
  },
  menuLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F3F4F6',
  },
  menuDark: {
    backgroundColor: '#111827',
    borderTopColor: '#374151',
  },
  menuScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  menuLinks: {
    gap: 4,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuItemLight: {
    // hover effect handled implicitly on press
  },
  menuItemDark: {},
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // User details
  userSection: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 16,
    gap: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  userInitials: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  borderLight: {
    borderTopColor: '#E5E7EB',
  },
  borderDark: {
    borderTopColor: '#374151',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  loginBtn: {
    backgroundColor: '#4F46E5',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Download section
  downloadSection: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 20,
    paddingHorizontal: 12,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    height: 52,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
