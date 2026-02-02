import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { theme } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { initializeModel } from "@/src/utils/ModelManagement/modelInitializer";
import { Models } from "@/src/constants";
import RNFS from "react-native-fs";
import LoadingScreen from "@/src/components/LoadingScreen";
import { identifyFoodFromImage } from "@/src/utils/foodIdentifier";

export default function ImageAnalyzerScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [progress, setProgress] = useState({ message: "", progress: 0 });
  const [error, setError] = useState<string>("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Auto-initialize model when screen loads
  useEffect(() => {
    const init = async () => {
      try {
        setInitializing(true);
        setError("");
        await initializeModel(Models.main, (message, progress) => {
          setProgress({ message, progress });
        });
      } catch (err: any) {
        setError(err.message || "Failed to initialize model");
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, []);

  // Auto-analyze image once model is initialized
  useEffect(() => {
    if (!initializing && imageUri && !analyzing && !hasAnalyzed) {
      setHasAnalyzed(true);
      analyzeImage(imageUri);
    }
  }, [initializing, imageUri, analyzing, hasAnalyzed]);

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
      const foodItems = await identifyFoodFromImage(imageFilePath);
      
      console.log('Food items identified:', foodItems.length);
      
      if (foodItems.length === 0) {
        throw new Error('No food items identified in the image');
      }

      // Navigate to review screen with extracted items
      router.push({
        pathname: "/foodReview",
        params: {
          items: encodeURIComponent(JSON.stringify(foodItems)),
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

  // Show loading screen during initialization or analysis
  if (initializing || analyzing) {
    const loadingMessage = initializing 
      ? progress.message || "Loading models..." 
      : "Analyzing your food...";
    
    return <LoadingScreen message={loadingMessage} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Analyzing Image</Text>
      
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="contain"
        />
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={[
          styles.button, 
          (!imageUri) && styles.buttonDisabled
        ]} 
        onPress={handleAnalyze}
        disabled={!imageUri}
      >
        <Text style={styles.buttonText}>Analyze Image</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  image: {
    width: "100%",
    height: 400,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
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
  errorContainer: {
    width: "100%",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error + "20",
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.error,
    textAlign: "center",
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textTertiary,
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
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