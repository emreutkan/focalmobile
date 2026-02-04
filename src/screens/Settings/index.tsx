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
import { useRouter } from 'expo-router';
import { theme } from '@/src/theme';
import { deleteAllData } from '@/src/utils/database';


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
    buttonColor: theme.colors.errorLight,
  },
  {
    emoji: '😰',
    title: 'REALLY REALLY?',
    subtitle: "You won't get it back...",
    buttonText: 'I UNDERSTAND',
    buttonColor: theme.colors.errorMedium,
  },
  {
    emoji: '😱',
    title: 'LAST CHANCE!',
    subtitle: 'All your progress will be gone forever',
    buttonText: 'GOODBYE DATA',
    buttonColor: theme.colors.errorDark,
  },
  {
    emoji: '💀',
    title: 'FINAL WARNING',
    subtitle: 'This is irreversible. No take-backsies!',
    buttonText: 'NUKE IT ALL',
    buttonColor: theme.colors.errorDarkest,
  },
];

export default function SettingsModal({ visible, onClose, onDataDeleted }: SettingsModalProps) {
  const router = useRouter();
  const [deleteStage, setDeleteStage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleSwitchToPro = () => {
    handleClose();
  };

  const handleDeletePress = async () => {
    if (deleteStage < DELETE_STAGES.length - 1) {
      setDeleteStage(prev => prev + 1);
    } else {
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
            style={[styles.actionButton, { backgroundColor: theme.card.dailySummary }]}
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

    return (
      <>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={theme.sizes.iconLg} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPGRADE</Text>

          <TouchableOpacity
            style={styles.proCard}
            onPress={handleSwitchToPro}
            activeOpacity={0.9}
          >
            <View style={styles.proCardShadow} />
            <View style={styles.proCardInner}>
              <View style={styles.proCardHeader}>
                <View style={styles.proIconCircle}>
                  <Ionicons name="diamond" size={theme.sizes.iconLg} color={theme.colors.text} />
                </View>
                <View style={styles.proBadgeLarge}>
                  <Ionicons name="star" size={10} color={theme.colors.text} />
                  <Text style={styles.proBadgeLargeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.proCardTitle}>UNLOCK FULL POTENTIAL</Text>
              <Text style={styles.proCardSubtitle}>Unlimited scans, deep insights, cloud sync & more</Text>
              <View style={styles.proCardCta}>
                <Text style={styles.proCardCtaText}>GET STARTED</Text>
                <Ionicons name="arrow-forward" size={theme.sizes.iconSm} color={theme.colors.text} />
              </View>
            </View>
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
              <Ionicons name="trash-outline" size={theme.sizes.iconLg} color={theme.colors.error} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Delete All Data</Text>
              <Text style={styles.menuItemSubtitle}>Remove all meals and start fresh</Text>
            </View>
            <Ionicons name="chevron-forward" size={theme.sizes.iconMd} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="information-circle-outline" size={theme.sizes.iconLg} color={theme.colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Version</Text>
              <Text style={styles.menuItemSubtitle}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="heart-outline" size={theme.sizes.iconLg} color={theme.card.fatCard} />
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
    backgroundColor: theme.colors.overlayDark,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.thick,
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
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  closeButton: {
    width: theme.sizes.buttonSm,
    height: theme.sizes.buttonSm,
    borderRadius: theme.sizes.buttonSm / 2,
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
    letterSpacing: theme.typography.letterSpacing.tight,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  menuItemIcon: {
    width: theme.sizes.buttonMd,
    height: theme.sizes.buttonMd,
    borderRadius: theme.sizes.buttonMd / 2,
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
  proCard: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  proCardShadow: {
    position: 'absolute',
    top: theme.offsets.sm,
    left: theme.offsets.sm,
    right: -theme.offsets.sm,
    bottom: -theme.offsets.sm,
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.xl,
  },
  proCardInner: {
    backgroundColor: theme.colors.pro,
    borderRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    padding: theme.spacing.lg,
  },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  proIconCircle: {
    width: theme.sizes.buttonXl,
    height: theme.sizes.buttonXl,
    borderRadius: theme.sizes.buttonXl / 2,
    backgroundColor: theme.colors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: theme.borderWidth.base,
    borderColor: theme.colors.text,
  },
  proBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md - theme.spacing.xs,
    paddingVertical: theme.spacing.xs + theme.spacing.xxs,
    borderRadius: theme.borderRadius.full,
  },
  proBadgeLargeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.pro,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  proCardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.tight,
    marginBottom: theme.spacing.xs,
  },
  proCardSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  proCardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.whiteTranslucent,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.base,
    borderColor: theme.colors.text,
  },
  proCardCtaText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  emoji: {
    fontSize: theme.typography.fontSize['7xl'],
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: theme.typography.letterSpacing.normal,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.sm,
    marginBottom: theme.spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  progressDot: {
    width: theme.sizes.progressDot,
    height: theme.sizes.progressDot,
    borderRadius: theme.borderRadius.xs,
    backgroundColor: theme.colors.surface,
    borderWidth: theme.borderWidth.base,
    borderColor: theme.colors.text,
  },
  progressDotActive: {
    backgroundColor: theme.colors.error,
  },
  actionButton: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    letterSpacing: theme.typography.letterSpacing.tight,
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
