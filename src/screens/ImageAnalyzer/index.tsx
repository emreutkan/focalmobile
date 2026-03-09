import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LoadingScreen from '@/src/components/LoadingScreen';
import CardComponent from '@/src/components/Cards/cardComponent';
import { analyzeImage } from '@/src/services/mealService';

const { width } = Dimensions.get('window');
const SIDE_BUTTON_WIDTH = Math.floor((width - theme.spacing.lg * 2 - theme.spacing.md) / 2) - 8;

const ERROR_FACES = ['😵‍💫', '🫠', '🤷‍♂️', '😬', '🙈'];

export default function ImageAnalyzer() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [errorFace] = useState(
    () => ERROR_FACES[Math.floor(Math.random() * ERROR_FACES.length)],
  );

  const handleNewPhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        router.replace({
          pathname: '/imageAnalyzer',
          params: { imageUri: result.assets[0].uri },
        });
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  }, [router]);

  const handleAnalyze = useCallback(async () => {
    if (!imageUri || analyzing) return;

    setAnalyzing(true);
    setError('');

    try {
      const result = await analyzeImage(imageUri);

      if (!result.isFood) {
        setError(result.message || "That doesn't look like food!");
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
      setError("Something went wrong! Let's give it another shot.");
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Ionicons name="scan" size={28} color={theme.colors.text} />
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
          <View style={styles.errorCard}>
            <Text style={styles.errorFace}>{errorFace}</Text>
            <View style={styles.errorBubble}>
              <Text style={styles.errorBubbleTitle}>Whoops!</Text>
              <Text style={styles.errorBubbleText}>{error}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {error ? (
            <View style={styles.buttonRow}>
              <CardComponent
                height={56}
                width={SIDE_BUTTON_WIDTH}
                backgroundColor={theme.card.dailySummary}
                onPress={handleAnalyze}
                showShadow={true}
                showBorder={true}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="refresh" size={22} color={theme.colors.text} />
                  <Text style={styles.buttonText}>RETRY</Text>
                </View>
              </CardComponent>
              <CardComponent
                height={56}
                width={SIDE_BUTTON_WIDTH}
                backgroundColor={theme.card.yellowAccent}
                onPress={handleNewPhoto}
                showShadow={true}
                showBorder={true}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="images" size={22} color={theme.colors.text} />
                  <Text style={styles.buttonText}>NEW PHOTO</Text>
                </View>
              </CardComponent>
            </View>
          ) : (
            <CardComponent
              height={56}
              width={SIDE_BUTTON_WIDTH * 2 + theme.spacing.md + 8}
              backgroundColor={theme.card.dailySummary}
              onPress={handleAnalyze}
              showShadow={true}
              showBorder={true}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="sparkles" size={22} color={theme.colors.text} />
                <Text style={styles.buttonText}>ANALYZE</Text>
              </View>
            </CardComponent>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
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
    borderWidth: 3,
    borderColor: theme.colors.text,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  image: {
    width: '100%',
    height: 320,
  },
  // Error state
  errorCard: {
    width: '100%',
    backgroundColor: '#FFE5E5',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 3,
    borderColor: theme.colors.text,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  errorFace: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  errorBubble: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  errorBubbleTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  errorBubbleText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Buttons
  buttonContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
});
