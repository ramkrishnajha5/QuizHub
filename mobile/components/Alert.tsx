import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react-native';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  show: boolean;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, show, onClose }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [show]);

  const config = {
    success: { bg: '#F0FDF4', border: '#10B981', text: '#166534', Icon: CheckCircle, iconColor: '#10B981' },
    error: { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', Icon: XCircle, iconColor: '#EF4444' },
    warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', Icon: AlertTriangle, iconColor: '#F59E0B' },
    info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', Icon: Info, iconColor: '#3B82F6' },
  }[type];

  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bg, borderLeftColor: config.border, transform: [{ translateY }], opacity },
      ]}
    >
      <config.Icon size={20} color={config.iconColor} />
      <Text style={[styles.message, { color: config.text }]} numberOfLines={3}>{message}</Text>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <X size={18} color={config.text} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default Alert;
