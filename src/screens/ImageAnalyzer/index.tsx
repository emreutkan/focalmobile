import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { theme } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { initializeModel } from "@/src/utils/ModelManagement/modelInitializer";
import { Models } from "@/src/constants";

export default function ImageAnalyzerScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string>("");

  const analyzeImage = async (
    imageFilePath: string,
    prompt: string = "Analyze the image and provide a detailed description of the contents.",
  ) => {
    try {
      setAnalyzing(true);
      
      const llamaContext = await initializeModel(Models.main);
      
      // Images expects an array of FILE PATH STRINGS
      const completion = await llamaContext.completion({
        prompt: `USER: <image>\n${prompt}\nASSISTANT:`,
        media_paths: [imageFilePath], // ← Must be a string path, not an object
        temperature: 0.7,
        top_p: 0.9,
        n_predict: 512,
      });
      
      console.log('Result:', completion.text);
      setResult(completion.text);
      return completion.text;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    if (imageUri) {
      analyzeImage(imageUri);
    }
  };

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
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAnalyze}
        disabled={analyzing || !imageUri}
      >
        <Text style={styles.buttonText}>
          {analyzing ? 'Analyzing...' : 'Analyze Image'}
        </Text>
      </TouchableOpacity>

      {analyzing && <ActivityIndicator size="large" style={styles.loader} />}
      
      {result && (
        <ScrollView style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Analysis Result:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </ScrollView>
      )}
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
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
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
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
});