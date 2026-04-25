/**
 * useCustomModal Hook
 * Easy hook to trigger CustomModal from anywhere
 */

import { useState } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'confirm' | 'alert';
  confirmText: string;
  cancelText: string;
  confirmStyle: 'danger' | 'primary' | 'success';
  onConfirm: (() => void) | null;
}

export const useCustomModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'Yes',
    cancelText: 'No',
    confirmStyle: 'danger',
    onConfirm: null,
  });

  const showConfirm = ({
    title,
    message,
    onConfirm,
    confirmText = 'Yes',
    cancelText = 'No',
    confirmStyle = 'danger',
  }: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmStyle?: 'danger' | 'primary' | 'success';
  }) => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      confirmStyle,
    });
  };

  const showAlert = ({
    title,
    message,
    confirmStyle = 'primary',
  }: {
    title: string;
    message: string;
    confirmStyle?: 'danger' | 'primary' | 'success';
  }) => {
    setModalState({
      isOpen: true,
      type: 'alert',
      title,
      message,
      confirmStyle,
      onConfirm: null,
      confirmText: 'OK',
      cancelText: 'No',
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return { modalState, showConfirm, showAlert, closeModal };
};
