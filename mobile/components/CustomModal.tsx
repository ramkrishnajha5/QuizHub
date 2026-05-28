import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'confirm' | 'alert';
  confirmText: string;
  cancelText: string;
  confirmStyle: 'danger' | 'primary' | 'success';
  onConfirm: (() => void) | null;
  onClose: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  title,
  message,
  type,
  confirmText,
  cancelText,
  confirmStyle,
  onConfirm,
  onClose,
}) => {
  const { isDark } = useTheme();

  const getConfirmColor = () => {
    switch (confirmStyle) {
      case 'danger': return '#EF4444';
      case 'success': return '#10B981';
      default: return '#4F46E5';
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, isDark && styles.modalDark]}>
          <Text style={[styles.title, isDark && styles.textDark]}>{title}</Text>
          <Text style={[styles.message, isDark && styles.textMuted]}>{message}</Text>

          <View style={styles.buttonRow}>
            {type === 'confirm' && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, isDark && styles.cancelButtonDark]}
                onPress={onClose}
              >
                <Text style={[styles.cancelText, isDark && styles.textMuted]}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: getConfirmColor() }]}
              onPress={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalDark: {
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  textDark: {
    color: '#F9FAFB',
  },
  textMuted: {
    color: '#9CA3AF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonDark: {
    backgroundColor: '#374151',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  confirmButton: {},
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

export default CustomModal;
