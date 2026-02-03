import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { theme } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RNFS from "react-native-fs";
import LoadingScreen from "@/src/components/LoadingScreen";
import { identifyFoodFromImage } from "@/src/utils/foodIdentifier";
import { useModel } from "@/src/contexts/ModelContext";

export default function ImageAnalyzerScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isModelReady } = useModel();

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Auto-analyze image once model is ready
  useEffect(() => {
    if (isModelReady && imageUri && !analyzing && !hasAnalyzed) {
      setHasAnalyzed(true);
      analyzeImage(imageUri);
    }
  }, [isModelReady, imageUri, analyzing, hasAnalyzed]);

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
        // Verify the copy was successful
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

  const analyzeImage = async (imageUri: string) => {
    try {
      setAnalyzing(true);
      setError("");

      // Convert URI to file path
      const imageFilePath = await convertUriToFilePath(imageUri);
      console.log('Image file path:', imageFilePath);
      
      // Verify file exists and is readable
      const fileExists = await RNFS.exists(imageFilePath);
      if (!fileExists) {
        throw new Error(`Image file does not exist: ${imageFilePath}`);
      }
      
      const stats = await RNFS.stat(imageFilePath);
      if (stats.size === 0) {
        throw new Error('Image file is empty');
      }
      console.log(`Image file verified: ${stats.size} bytes`);
      
      console.log('Starting food identification...');

      // Use the dedicated food identification function
      const result = await identifyFoodFromImage(imageFilePath);

      console.log('Food identification result:', result.isFood, result.items.length);

      // Check if food was detected
      if (!result.isFood || result.items.length === 0) {
        throw new Error(result.message || "No food detected in this image. Please take a photo of food.");
      }

      // Navigate to review screen with extracted items
      router.push({
        pathname: "/foodReview",
        params: {
          items: encodeURIComponent(JSON.stringify(result.items)),
          mealName: encodeURIComponent(result.mealName || ''),
        },
      });
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      const errorMessage = error.message || error.toString() || "Failed to analyze image";
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    if (imageUri) {
      analyzeImage(imageUri);
    }
  };

  // Show loading screen during analysis
  if (analyzing) {
    return <LoadingScreen message="Analyzing your food..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>ANALYZING</Text>

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
            (!imageUri) && styles.buttonDisabled
          ]}
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
    alignItems: "center",
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    letterSpacing: 2,
  },
  imageContainer: {
    width: "100%",
    borderRadius: theme.borderRadius.xl,
    borderWidth: 4,
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
    borderWidth: 4,
    borderColor: theme.colors.error,
    marginBottom: theme.spacing.lg,
    alignItems: "center",
    ...theme.shadows.md,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    letterSpacing: 1,
  },
  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#4ecdc4",
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    ...theme.shadows.md,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textTertiary,
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 1,
  },
  backButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    ...theme.shadows.md,
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 1,
  },
  progressContainer: {
    width: "100%",
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  progressText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: theme.colors.divider,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  loader: {
    marginVertical: theme.spacing.lg,
  },
  resultContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  resultTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  resultText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
});