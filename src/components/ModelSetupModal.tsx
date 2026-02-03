import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { theme } from '../theme';
import { useModel } from '../contexts/ModelContext';

const { width } = Dimensions.get('window');

const INIT_MESSAGES = [
  { emoji: '🧠', text: 'Waking up the AI...' },
  { emoji: '🍳', text: 'Teaching AI about breakfast...' },
  { emoji: '🥗', text: 'Learning your salads...' },
  { emoji: '🍕', text: 'Memorizing pizza toppings...' },
  { emoji: '🌮', text: 'Studying taco fillings...' },
  { emoji: '🍜', text: 'Slurping noodle knowledge...' },
  { emoji: '🎂', text: 'Counting cake calories...' },
  { emoji: '✨', text: 'Almost ready...' },
];

// Cute bouncing dots component
const LoadingDots: React.FC = () => {
  const dot1 = useState(new Animated.Value(0))[0];
  const dot2 = useState(new Animated.Value(0))[0];
  const dot3 = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -10,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay),
        ])
      );
    };

    const anim1 = animateDot(dot1, 0);
    const anim2 = animateDot(dot2, 150);
    const anim3 = animateDot(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

export const ModelSetupModal: React.FC = () => {
  const {
    status,
    downloadProgress,
    downloadMessage,
    error,
    startDownload,
    checkModelStatus,
    dismissForToday,
    dismissedToday,
  } = useModel();

  const [messageIndex, setMessageIndex] = useState(0);
  const [showCloseOptions, setShowCloseOptions] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  // Rotate through cute messages during initialization
  useEffect(() => {
    if (status === 'initializing') {
      const interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % INIT_MESSAGES.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Pulse animation for the emoji
  useEffect(() => {
    if (status === 'initializing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, pulseAnim]);

  // Only show modal for not_downloaded (unless dismissed) and error states.
  const isVisible = (status === 'not_downloaded' && !dismissedToday) || status === 'error';

  const renderContent = () => {
    if (status === 'initializing') {
      const currentMessage = INIT_MESSAGES[messageIndex];
      return (
        <>
          <Animated.Text
            style={[
              styles.emoji,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            {currentMessage.emoji}
          </Animated.Text>
          <Text style={styles.title}>SETTING UP</Text>
          <Text style={styles.initMessage}>{currentMessage.text}</Text>

          <View style={styles.dotsContainer}>
            <LoadingDots />
          </View>

          <Text style={styles.hint}>
            This only takes a moment...{'\n'}
            Your AI is getting ready to help!
          </Text>
        </>
      );
    }

    if (status === 'downloading') {
      return (
        <>
          <Text style={styles.emoji}>🤖</Text>
          <Text style={styles.title}>DOWNLOADING AI</Text>
          <Text style={styles.message}>{downloadMessage}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{downloadProgress.toFixed(0)}%</Text>
          </View>

          <Text style={styles.hint}>
            This is a one-time download.{'\n'}
            Keep the app open until complete.
          </Text>
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <Text style={styles.emoji}>😅</Text>
          <Text style={styles.title}>OOPS!</Text>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={checkModelStatus}>
            <Text style={styles.buttonText}>TRY AGAIN</Text>
          </TouchableOpacity>
        </>
      );
    }

    // not_downloaded state
    if (showCloseOptions) {
      return (
        <>
          <Text style={styles.emoji}>🙈</Text>
          <Text style={styles.title}>SEE YOU LATER!</Text>
          <Text style={styles.message}>
            No worries! But remember, the app needs the AI model to analyze your food.
          </Text>

          <TouchableOpacity
            style={styles.closeOptionButton}
            onPress={() => {
              setShowCloseOptions(false);
              dismissForToday();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.closeOptionEmoji}>😴</Text>
            <View style={styles.closeOptionTextContainer}>
              <Text style={styles.closeOptionTitle}>Don't show today</Text>
              <Text style={styles.closeOptionSubtitle}>I'll set it up later</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.closeOptionButton, styles.closeOptionButtonAlt]}
            onPress={() => setShowCloseOptions(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.closeOptionEmoji}>🤔</Text>
            <View style={styles.closeOptionTextContainer}>
              <Text style={styles.closeOptionTitle}>Wait, go back!</Text>
              <Text style={styles.closeOptionSubtitle}>I want to download</Text>
            </View>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowCloseOptions(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>HEY THERE!</Text>

        <Text style={styles.message}>
          To analyze your food, we need to download an AI model that runs entirely on your device.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>WHAT YOU'RE GETTING:</Text>
          <Text style={styles.infoItem}>• Privacy-first AI (nothing leaves your phone)</Text>
          <Text style={styles.infoItem}>• Works offline after setup</Text>
          <Text style={styles.infoItem}>• ~3GB download (one-time)</Text>
        </View>

        <TouchableOpacity style={styles.downloadButton} onPress={startDownload}>
          <Text style={styles.buttonText}>DOWNLOAD AI MODEL</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.proButton} onPress={() => {/* TODO: Navigate to pro */}}>
          <Text style={styles.proButtonText}>GO PRO</Text>
        </TouchableOpacity>

        <Text style={styles.proHint}>
          Skip the download! Pro uses our cloud AI{'\n'}
          for instant analysis + advanced features.
        </Text>
      </>
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  container: {
    width: width - 48,
    maxWidth: 400,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 4,
    borderColor: theme.colors.text,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 2,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  infoBox: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  infoItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  downloadButton: {
    width: '100%',
    backgroundColor: '#4ecdc4',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.divider,
  },
  dividerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    fontWeight: theme.typography.fontWeight.bold,
    marginHorizontal: theme.spacing.md,
  },
  proButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  proButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#fff',
    letterSpacing: 1,
  },
  proHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
  progressContainer: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.text,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ecdc4',
  },
  progressText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  hint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  retryButton: {
    width: '100%',
    backgroundColor: '#ff6b6b',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  initMessage: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.lg,
    minHeight: 28,
  },
  dotsContainer: {
    marginBottom: theme.spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ecdc4',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  closeOptionButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 3,
    borderColor: theme.colors.text,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  closeOptionButtonAlt: {
    backgroundColor: '#4ecdc4',
  },
  closeOptionEmoji: {
    fontSize: 32,
  },
  closeOptionTextContainer: {
    flex: 1,
  },
  closeOptionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  closeOptionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
