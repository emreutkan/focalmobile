import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { theme } from '@/src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '@/src/components/LoadingScreen';
import { analyzeImage } from '@/src/services/groqService';

export default function ImageAnalyzer() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!imageUri || analyzing) return;

    setAnalyzing(true);
    setError('');

    try {
      const result = await analyzeImage(imageUri);

      if (!result.isFood) {
        setError(result.message || 'No food detected in this image.');
        setAnalyzing(false);
        return;
      }

      router.push({
        pathname: '/foodReview',
        params: {
          items: encodeURIComponent(JSON.stringify(result.items)),
          mealName: encodeURIComponent(result.mealName || ''),
        },
      });
    } catch (err: any) {
      console.error('Error analyzing image:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [imageUri, analyzing, router]);

  // Auto-analyze when entering screen
  useEffect(() => {
    if (imageUri && !hasAnalyzed && !error) {
      setHasAnalyzed(true);
      handleAnalyze();
    }
  }, [imageUri, hasAnalyzed, error, handleAnalyze]);

  if (analyzing) {
    return <LoadingScreen message="Analyzing your food..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>ANALYZING</Text>
      </View>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>🍽️</Text>
          <Text style={styles.errorTitle}>OOPS!</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {error ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>TRY AGAIN</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={handleAnalyze}
          disabled={!imageUri}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>ANALYZE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  imageContainer: {
    width: '100%',
    borderRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  image: {
    width: '100%',
    height: 350,
  },
  errorContainer: {
    width: '100%',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.error,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  errorEmoji: {
    fontSize: theme.typography.fontSize['6xl'],
    marginBottom: theme.spacing.sm,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.sm,
  },
  button: {
    backgroundColor: theme.card.dailySummary,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    ...theme.shadows.md,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  backButton: {
    backgroundColor: theme.card.fatCard,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    ...theme.shadows.md,
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
});
