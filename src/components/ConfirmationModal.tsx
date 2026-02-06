import React from 'react';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Modal } from 'react-native';
import { theme } from '../theme';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmButtonText: string;
  cancelButtonText: string;
}

export default function ConfirmationModal() {

  const [isVisible, setIsVisible] = useState(false);

  return (
    <></>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
