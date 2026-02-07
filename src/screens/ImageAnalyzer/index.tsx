import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { theme } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RNFS from "react-native-fs";
import LoadingScreen from "@/src/components/LoadingScreen";
import { identifyFoodFromImage } from "@/src/utils/foodIdentifier";
import { analyzeImageWithGroq } from "@/src/services/groqService";
import { useModel } from "@/src/contexts/ModelContext";
import { useUserStore } from "@/src/hooks/userStore";
  export default function ImageAnalyzer() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isPro = useUserStore((state) => state.isPro);
  const {
    isModelDownloaded,
    isModelReady,
    initializeModelForAnalysis,
    status,
    downloadMessage,
  } = useModel();

  const [analyzing, setAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your food...");
  const [error, setError] = useState<string>("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Auto-analyze when entering screen (if Pro or model ready)
  useEffect(() => {
    if (imageUri && !analyzing && !hasAnalyzed && !error) {
      // For Pro users - analyze immediately with Groq
      if (isPro) {
        setHasAnalyzed(true);
        analyzeWithGroq(imageUri);
      }
      // For non-Pro users with model ready - analyze immediately
      else if (isModelReady) {
        setHasAnalyzed(true);
        analyzeWithLocalModel(imageUri);
      }
    }
  }, [isPro, isModelReady, imageUri, analyzing, hasAnalyzed, error]);

  const convertUriToFilePath = async (uri: string): Promise<string> => {
    // If it's already a file path, verify it exists
    if (uri.startsWith('/')) {
      const exists = await RNFS.exists(uri);
      if (!exists) {
        throw new Error(`Image file not found at: ${uri}`);
      }
      return uri;
    }

    // Convert file:// URI to file path
    if (uri.startsWith('file://')) {
      const filePath = uri.replace('file://', '');
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        throw new Error(`Image file not found at: ${filePath}`);
      }
      return filePath;
    }

    // For Android content:// URIs, copy to a temp file
    if (uri.startsWith('content://')) {
      const filename = uri.split('/').pop() || 'image.jpg';
      const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;
      try {
        await RNFS.copyFile(uri, destPath);
        const exists = await RNFS.exists(destPath);
        if (!exists) {
          throw new Error('Failed to copy image file');
        }
        return destPath;
      } catch (err: any) {
        throw new Error(`Failed to copy image from content URI: ${err.message || err}`);
      }
    }

    // For other URIs (http/https), download to temp file
    const filename = uri.split('/').pop()?.split('?')[0] || 'image.jpg';
    const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;
    const downloadResult = await RNFS.downloadFile({
      fromUrl: uri,
      toFile: destPath,
    }).promise;

    if (downloadResult.statusCode === 200) {
      const exists = await RNFS.exists(destPath);
      if (!exists) {
        throw new Error('Downloaded file not found');
      }
      return destPath;
    }

    throw new Error(`Failed to download image: status ${downloadResult.statusCode}`);
  };

  /**
   * Analyze with Groq API (Pro users)
   * Fast, cloud-based analysis
   */
  const analyzeWithGroq = async (imageUri: string) => {
    try {
      setAnalyzing(true);
      setLoadingMessage("Analyzing with cloud AI...");
      setError("");

      const imageFilePath = await convertUriToFilePath(imageUri);
      console.log('Pro user - analyzing with Groq:', imageFilePath);

      const result = await analyzeImageWithGroq(imageFilePath);

      console.log('Groq result:', result);
      if (!result.isFood || result.items.length === 0) {
        throw new Error(result.message || "No food detected in this image. Please take a photo of food.");
      }

      
      router.push({
        pathname: "/foodReview",
        params: {
          items: encodeURIComponent(JSON.stringify(result.items)),
          mealName: encodeURIComponent(result.mealName || ''),
        },
      });
    } catch (error: any) {
      console.error('Error analyzing with Groq:', error);
      setError(error.message || "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Analyze with local model (non-Pro users)
   * Requires model to be initialized first
   */
  const analyzeWithLocalModel = async (imageUri: string) => {
    try {
      setAnalyzing(true);
      setError("");

      const imageFilePath = await convertUriToFilePath(imageUri);
      console.log('Local model - analyzing:', imageFilePath);

      // Verify file exists
      const fileExists = await RNFS.exists(imageFilePath);
      if (!fileExists) {
        throw new Error(`Image file does not exist: ${imageFilePath}`);
      }

      const stats = await RNFS.stat(imageFilePath);
      if (stats.size === 0) {
        throw new Error('Image file is empty');
      }

      setLoadingMessage("Analyzing your food...");

      const result = await identifyFoodFromImage(imageFilePath);

      if (!result.isFood || result.items.length === 0) {
        throw new Error(result.message || "No food detected in this image. Please take a photo of food.");
      }

      // router.push({
      
      //   pathname: "/foodReview",
      //   params: {
      //     items: encodeURIComponent(JSON.stringify(result.items)),
      //     mealName: encodeURIComponent(result.mealName || ''),
      //   },
      // });
    } catch (error: any) {
      console.error('Error analyzing with local model:', error);
      setError(error.message || "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Handle analyze button press
   * For non-Pro users, initializes model first if needed
   */
  const handleAnalyze = useCallback(async () => {
    if (!imageUri) return;

    // Pro users - use Groq API
    if (isPro) {
      analyzeWithGroq(imageUri);
      return;
    }

    // Non-Pro users - need local model
    if (!isModelDownloaded) {
      setError("Please download the AI model first from settings.");
      return;
    }

    // If model already initialized, analyze directly
    if (isModelReady) {
      analyzeWithLocalModel(imageUri);
      return;
    }

    // Initialize model first, then analyze
    setAnalyzing(true);
    setLoadingMessage("Waking up the AI...");

    const initialized = await initializeModelForAnalysis();

    if (initialized) {
      setLoadingMessage("Analyzing your food...");
      analyzeWithLocalModel(imageUri);
    } else {
      setAnalyzing(false);
      setError("Failed to initialize AI. Please try again.");
    }
  }, [imageUri, isPro, isModelDownloaded, isModelReady, initializeModelForAnalysis]);

  // Show loading screen during analysis or initialization
  if (analyzing || status === 'initializing') {
    const message = status === 'initializing' ? downloadMessage : loadingMessage;
    return <LoadingScreen message={message || "Loading..."} />;
  }

  // Determine button state
  const canAnalyze = imageUri && (isPro || isModelDownloaded);
  const buttonLabel = isPro
    ? "ANALYZE (PRO)"
    : !isModelDownloaded
      ? "DOWNLOAD MODEL FIRST"
      : "ANALYZE";

      console.log('imageUri:', imageUri);
      console.log('isPro:', isPro);
      console.log('isModelDownloaded:', isModelDownloaded);
      console.log('isModelReady:', isModelReady);
      console.log('canAnalyze:', canAnalyze);
      console.log('buttonLabel:', buttonLabel);
      console.log('analyzing:', analyzing);
      console.log('status:', status);
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>ANALYZING</Text>
        {isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
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
          style={[
            styles.button,
            isPro && styles.buttonPro,
            !canAnalyze && styles.buttonDisabled
          ]}
          onPress={handleAnalyze}
          disabled={!canAnalyze}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{buttonLabel}</Text>
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
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  proBadge: {
    backgroundColor: theme.colors.pro,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: theme.borderWidth.base,
    borderColor: theme.colors.text,
  },
  proBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  imageContainer: {
    width: "100%",
    borderRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    overflow: "hidden",
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  image: {
    width: "100%",
    height: 350,
  },
  errorContainer: {
    width: "100%",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.error,
    marginBottom: theme.spacing.lg,
    alignItems: "center",
    ...theme.shadows.md,
  },
  errorEmoji: {
    fontSize: theme.typography.fontSize["6xl"],
    marginBottom: theme.spacing.sm,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
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
  buttonPro: {
    backgroundColor: theme.colors.pro,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textTertiary,
    opacity: 0.6,
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
