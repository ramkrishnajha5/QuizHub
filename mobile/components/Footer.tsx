import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Github, Instagram, Mail, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { APP_NAME } from '../shared/constants';

export default function Footer() {
  const { isDark } = useTheme();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  // Heart Pulse Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/ramkrishnajha5',
      Icon: Github,
      color: '#4B5563',
      colorDark: '#F3F4F6',
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/ramkrishnajha5',
      Icon: Instagram,
      color: '#EC4899',
      colorDark: '#F472B6',
    },
    {
      name: 'Email',
      url: 'mailto:ram03krishna@gmail.com',
      Icon: Mail,
      color: '#3B82F6',
      colorDark: '#60A5FA',
    },
  ];

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load URL", err));
  };

  const handleNavigateHome = () => {
    router.push('/');
  };

  return (
    <View style={[styles.footer, isDark ? styles.footerDark : styles.footerLight]}>
      {/* 4px Gradient Line Top Border */}
      <LinearGradient
        colors={['#9333EA', '#DB2777', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      />

      <View style={styles.content}>
        {/* Brand Header */}
        <TouchableOpacity 
          style={styles.brand} 
          onPress={handleNavigateHome}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#9333EA', '#DB2777']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Zap size={18} color="#fff" />
          </LinearGradient>
          <Text style={styles.brandText}>{APP_NAME}</Text>
        </TouchableOpacity>

        {/* Brand Description */}
        <Text style={[styles.desc, isDark ? styles.textMuted : styles.textGray]}>
          Your free learning companion. Test your knowledge with quizzes, explore millions of books, and track your progress.
        </Text>

        {/* Social Links */}
        <View style={styles.socials}>
          {socialLinks.map((social, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.socialBtn, isDark ? styles.socialBtnDark : styles.socialBtnLight]}
              onPress={() => handleOpenLink(social.url)}
              activeOpacity={0.75}
            >
              <social.Icon size={20} color={isDark ? social.colorDark : social.color} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Attribution Row */}
        <View style={[styles.bottomBar, isDark ? styles.borderDark : styles.borderLight]}>
          <View style={styles.copyrightContainer}>
            <Text style={[styles.copyright, isDark ? styles.textMuted : styles.textGray]}>
              © {currentYear} {APP_NAME}. All rights reserved.
            </Text>
            <Text style={styles.attributionText}>
              Powered by Open Library • Open Trivia DB • Google Books
            </Text>
          </View>

          <View style={styles.madeWithContainer}>
            <Text style={[styles.madeWithText, isDark ? styles.textWhite : styles.textBlack]}>
              Made with
            </Text>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Heart size={14} color="#EF4444" fill="#EF4444" />
            </Animated.View>
            <Text style={[styles.madeWithText, isDark ? styles.textWhite : styles.textBlack]}>
              by
            </Text>
            <TouchableOpacity onPress={() => handleOpenLink('https://instagram.com/ramkrishnajha5')}>
              <Text style={styles.authorText}>Ram Krishna</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'relative',
    width: '100%',
    marginTop: 16,
    borderTopWidth: 1,
  },
  footerLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  footerDark: {
    backgroundColor: '#111827',
    borderColor: '#1F2937',
  },
  gradientBorder: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4F46E5',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 12,
  },
  socials: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnLight: {
    backgroundColor: '#F3F4F6',
  },
  socialBtnDark: {
    backgroundColor: '#1F2937',
  },
  bottomBar: {
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 12,
    alignItems: 'center',
    gap: 8,
  },
  borderLight: {
    borderColor: '#F3F4F6',
  },
  borderDark: {
    borderColor: '#1F2937',
  },
  copyrightContainer: {
    alignItems: 'center',
    gap: 4,
  },
  copyright: {
    fontSize: 13,
    fontWeight: '600',
  },
  attributionText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  madeWithContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  madeWithText: {
    fontSize: 13,
    fontWeight: '500',
  },
  authorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  textWhite: {
    color: '#F9FAFB',
  },
  textBlack: {
    color: '#111827',
  },
  textGray: {
    color: '#4B5563',
  },
  textMuted: {
    color: '#9CA3AF',
  },
});
