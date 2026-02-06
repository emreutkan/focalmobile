import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { theme } from '@/src/theme';
import { signUp, signInWithEmail, signInWithGoogle } from '@/src/lib/auth';

type AuthMode = 'login' | 'register';

// Styled Input Component
function StyledInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  showPassword,
  onTogglePassword,
  keyboardType,
  autoCapitalize,
  autoComplete,
  editable = true,
  delay = 0,
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  autoComplete?: 'email' | 'current-password' | 'new-password';
  editable?: boolean;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500).springify()}>
      <View style={styles.inputContainer}>
        <View style={styles.inputShadow} />
        <View style={styles.inputWrapper}>
          <Ionicons name={icon as any} size={22} color={theme.colors.text} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            autoCorrect={false}
            editable={editable}
          />
          {onTogglePassword && (
            <TouchableOpacity
              onPress={onTogglePassword}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// Bold Button Component
function BoldButton({
  onPress,
  disabled,
  loading,
  children,
  variant = 'primary',
  delay = 0,
}: {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  delay?: number;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    translateY.value = withTiming(4);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    translateY.value = withTiming(0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const shadowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(translateY.value > 0 ? 0 : 1),
  }));

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.buttonPrimary;
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.buttonTextPrimary;
      case 'secondary':
        return styles.buttonTextSecondary;
      case 'outline':
        return styles.buttonTextOutline;
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500).springify()}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={styles.buttonOuter}
      >
        <Animated.View style={[styles.buttonShadow, shadowAnimatedStyle]} />
        <Animated.View style={[styles.buttonInner, getButtonStyle(), animatedStyle, disabled && styles.buttonDisabled]}>
          {loading ? (
            <ActivityIndicator color={variant === 'outline' ? theme.colors.text : '#fff'} size="small" />
          ) : (
            <Text style={getTextStyle()}>{children}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface AuthScreenProps {
  onAuthSuccess?: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const { top, bottom } = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLogin = mode === 'login';
  const shakeValue = useSharedValue(0);

  const triggerShake = () => {
    shakeValue.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const animatedFormStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  }, []);

  const toggleMode = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    resetForm();
  }, [resetForm]);

  const validateForm = useCallback(() => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!password) {
      setError('Please enter your password');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  }, [email, password, confirmPassword, isLogin]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isLogin) {
        await signInWithEmail(email.trim(), password);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onAuthSuccess?.();
      } else {
        await signUp(email.trim(), password);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSuccess('Account created! Check your email to verify.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLogin, validateForm, onAuthSuccess]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setIsGoogleLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signInWithGoogle();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAuthSuccess?.();
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message || 'Google sign in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [onAuthSuccess]);

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: top + 20, paddingBottom: bottom + 40 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(600).springify()}
              style={styles.header}
            >
              {/* Logo */}
              <View style={styles.logoContainer}>
                <View style={styles.logoShadow} />
                <View style={styles.logoBox}>
                  <Text style={styles.logoText}>F</Text>
                </View>
              </View>

              <Text style={styles.brandTitle}>FOCAL</Text>
              <Text style={styles.tagline}>
                {isLogin ? 'Welcome back!' : 'Join the fun!'}
              </Text>
            </Animated.View>

            {/* Mode Toggle */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(500).springify()}
              style={styles.toggleWrapper}
            >
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleOption, isLogin && styles.toggleOptionActive]}
                  onPress={() => mode !== 'login' && toggleMode()}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                    SIGN IN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleOption, !isLogin && styles.toggleOptionActive]}
                  onPress={() => mode !== 'register' && toggleMode()}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                    SIGN UP
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Form */}
            <Animated.View style={[styles.form, animatedFormStyle]}>
              {/* Success Message */}
              {success && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
                  <Text style={styles.successText}>{success}</Text>
                </Animated.View>
              )}

              {/* Error Message */}
              {error && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={22} color={theme.colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              {/* Email Input */}
              <StyledInput
                icon="mail-outline"
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
                delay={300}
              />

              {/* Password Input */}
              <StyledInput
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                autoCapitalize="none"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                editable={!isLoading}
                delay={400}
              />

              {/* Confirm Password Input (Register only) */}
              {!isLogin && (
                <StyledInput
                  icon="shield-checkmark-outline"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  editable={!isLoading}
                  delay={500}
                />
              )}

              {/* Submit Button */}
              <View style={{ marginTop: theme.spacing.sm }}>
                <BoldButton
                  onPress={handleSubmit}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="primary"
                  delay={500}
                >
                  {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </BoldButton>
              </View>

              {/* Forgot Password (Login only) */}
              {isLogin && (
                <Animated.View entering={FadeIn.delay(600).duration(400)}>
                  <TouchableOpacity style={styles.forgotButton} activeOpacity={0.7}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>

            {/* Divider */}
            <Animated.View
              entering={FadeIn.delay(700).duration(400)}
              style={styles.dividerContainer}
            >
              <View style={styles.dividerLine} />
              <View style={styles.dividerTextContainer}>
                <Text style={styles.dividerText}>OR</Text>
              </View>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* Social Login */}
            <Animated.View
              entering={FadeInUp.delay(800).duration(500).springify()}
              style={styles.socialContainer}
            >
              {/* Google Sign In Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={isGoogleLoading}
                activeOpacity={0.9}
              >
                <View style={styles.googleButtonShadow} />
                <View style={styles.googleButtonInner}>
                  {isGoogleLoading ? (
                    <ActivityIndicator color={theme.colors.text} size="small" />
                  ) : (
                    <>
                      <View style={styles.googleIconContainer}>
                        <Text style={styles.googleIcon}>G</Text>
                      </View>
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <Animated.View
              entering={FadeIn.delay(900).duration(400)}
              style={styles.footer}
            >
              <Text style={styles.footerText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
                <Text style={styles.footerLink}>{isLogin ? 'Sign up' : 'Sign in'}</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  logoShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.text,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.card.dailySummary,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 44,
    fontWeight: '900',
    color: theme.colors.text,
    marginTop: -4,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 6,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },

  // Toggle
  toggleWrapper: {
    marginBottom: theme.spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: theme.card.yellowAccent,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textTertiary,
    letterSpacing: 1,
  },
  toggleTextActive: {
    color: theme.colors.text,
  },

  // Form
  form: {
    gap: theme.spacing.md,
  },

  // Input
  inputContainer: {
    position: 'relative',
  },
  inputShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  inputIcon: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },

  // Messages
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.success,
    gap: theme.spacing.sm,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.error,
    gap: theme.spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '600',
  },

  // Buttons
  buttonOuter: {
    position: 'relative',
  },
  buttonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.xl,
  },
  buttonInner: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: theme.card.dailySummary,
  },
  buttonSecondary: {
    backgroundColor: theme.card.yellowAccent,
  },
  buttonOutline: {
    backgroundColor: theme.colors.card,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonTextPrimary: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 1,
  },
  buttonTextSecondary: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 1,
  },
  buttonTextOutline: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 1,
  },

  forgotButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.sm,
  },
  forgotText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.border,
  },
  dividerTextContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
  },
  dividerText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Social
  socialContainer: {
    marginBottom: theme.spacing.xl,
  },
  googleButton: {
    position: 'relative',
  },
  googleButtonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.xl,
  },
  googleButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    paddingVertical: 16,
    gap: theme.spacing.sm,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 15,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.card.dailySummary,
  },
});
