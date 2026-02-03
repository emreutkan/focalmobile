import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { deleteAllData } from '../utils/database';

const { width } = Dimensions.get('window');

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onDataDeleted?: () => void;
}

const DELETE_STAGES = [
  {
    emoji: '🗑️',
    title: 'DELETE MY DATA',
    subtitle: 'Tap to start fresh',
    buttonText: 'DELETE EVERYTHING',
    buttonColor: theme.colors.error,
  },
  {
    emoji: '🤔',
    title: 'ARE YOU SURE?',
    subtitle: 'This will delete all your meals',
    buttonText: 'YES, DELETE IT',
    buttonColor: '#FF6B6B',
  },
  {
    emoji: '😰',
    title: 'REALLY REALLY?',
    subtitle: "You won't get it back...",
    buttonText: 'I UNDERSTAND',
    buttonColor: '#FF5252',
  },
  {
    emoji: '😱',
    title: 'LAST CHANCE!',
    subtitle: 'All your progress will be gone forever',
    buttonText: 'GOODBYE DATA',
    buttonColor: '#FF1744',
  },
  {
    emoji: '💀',
    title: 'FINAL WARNING',
    subtitle: 'This is irreversible. No take-backsies!',
    buttonText: 'NUKE IT ALL',
    buttonColor: '#D50000',
  },
];

export default function SettingsModal({ visible, onClose, onDataDeleted }: SettingsModalProps) {
  const [deleteStage, setDeleteStage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDeletePress = async () => {
    if (deleteStage < DELETE_STAGES.length - 1) {
      setDeleteStage(prev => prev + 1);
    } else {
      // Final stage - actually delete
      try {
        setIsDeleting(true);
        await deleteAllData();
        setDeleted(true);
        onDataDeleted?.();
      } catch (error) {
        console.error('Error deleting data:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleClose = () => {
    setDeleteStage(0);
    setDeleted(false);
    onClose();
  };

  const handleNevermind = () => {
    setDeleteStage(0);
  };

  const currentStage = DELETE_STAGES[deleteStage];

  const renderContent = () => {
    if (deleted) {
      return (
        <>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>ALL GONE!</Text>
          <Text style={styles.subtitle}>
            Fresh start achieved.{'\n'}
            Time to eat some good food!
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4ecdc4' }]}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>SOUNDS GOOD</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (deleteStage > 0) {
      return (
        <>
          <Text style={styles.emoji}>{currentStage.emoji}</Text>
          <Text style={styles.title}>{currentStage.title}</Text>
          <Text style={styles.subtitle}>{currentStage.subtitle}</Text>

          <View style={styles.progressContainer}>
            {DELETE_STAGES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.progressDot,
                  idx <= deleteStage && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentStage.buttonColor }]}
            onPress={handleDeletePress}
            disabled={isDeleting}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>
              {isDeleting ? 'DELETING...' : currentStage.buttonText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nevermindButton}
            onPress={handleNevermind}
          >
            <Text style={styles.nevermindText}>Nevermind, keep my data</Text>
          </TouchableOpacity>
        </>
      );
    }

    // Initial settings view
    return (
      <>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDeletePress}
            activeOpacity={0.8}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Delete All Data</Text>
              <Text style={styles.menuItemSubtitle}>Remove all meals and start fresh</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Version</Text>
              <Text style={styles.menuItemSubtitle}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="heart-outline" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Made with love</Text>
              <Text style={styles.menuItemSubtitle}>By the Focal team</Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.container,
          deleteStage > 0 && styles.containerCentered,
        ]}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    borderWidth: 4,
    borderBottomWidth: 0,
    borderColor: theme.colors.text,
    padding: theme.spacing.xl,
    minHeight: 400,
  },
  containerCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 450,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  menuItemSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  progressDotActive: {
    backgroundColor: theme.colors.error,
  },
  actionButton: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#fff',
    letterSpacing: 1,
  },
  nevermindButton: {
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  nevermindText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
