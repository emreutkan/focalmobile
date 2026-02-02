import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Modal, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";    
import { Stack, useRouter } from "expo-router";
import { theme } from "@/src/theme";
import { GlassView } from "expo-glass-effect";
import { Image } from "expo-image";
import TopBar from "./components/topBar";
import MiddleSection from "./components/middleSection";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";  // ✅
import CardComponent from "@/src/components/Cards/cardComponent";
import { Dimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      console.log(scrollY.value);
    },
  });
    const [refreshing,setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Haptic Feedback on pull to refresh
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        // Simulate a refresh operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    }, [])

    const {top, bottom} = useSafeAreaInsets();
    const { width } = Dimensions.get("window");
    const FLOATING_CARD_WIDTH = Math.min(400, width - theme.spacing.xl * 2);
    
    const handleScanFood = useCallback(async () => {
      try {
        // Request camera permission
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        
        if (!cameraPermission.granted) {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in settings to scan food.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Show action sheet to choose camera or gallery
        Alert.alert(
          'Select Image',
          'Choose an option',
          [
            {
              text: 'Camera',
              onPress: async () => {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 0.3,
                });

                if (!result.canceled && result.assets[0]) {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setSelectedImage(result.assets[0].uri);
                  setShowImageModal(true);
                }
              },
            },
            {
              text: 'Gallery',
              onPress: async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 0.3,
                });

                if (!result.canceled && result.assets[0]) {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setSelectedImage(result.assets[0].uri);
                  setShowImageModal(true);
                }
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } catch (error) {
        console.error('Error selecting image:', error);
        Alert.alert('Error', 'Failed to select image.');
      }
    }, []);

    const handleGoodToGo = useCallback(() => {
      if (selectedImage) {
        setShowImageModal(false);
        router.push({
          pathname: "/imageAnalyzer",
          params: { imageUri: selectedImage },
        });
        setSelectedImage(null);
      }
    }, [selectedImage, router]);

    const handleCancel = useCallback(() => {
      setShowImageModal(false);
      setSelectedImage(null);
    }, []);
    
    return (
        <>
          <Stack.Screen options={{title: "Home", headerShown: false}} />
            <StatusBar style="dark" />  
              <View style={styles.container} >
                <Animated.ScrollView
                  scrollEventThrottle={16}
                  contentContainerStyle={{
                    flex: 1,
                    paddingTop: top,
                  }}
                  onScroll={scrollHandler}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }

                >
                  <TopBar scrollY={scrollY} />
                  <MiddleSection scrollY={scrollY} />
                </Animated.ScrollView>
                
                <View style={[styles.floatingButtonContainer, { bottom: bottom + theme.spacing.xl }]}>
                  <CardComponent
                    height={64}
                    width={FLOATING_CARD_WIDTH}
                    backgroundColor="#FFE66D"
                    onPress={handleScanFood}
                    showShadow={true}
                  >
                    <View style={styles.scanButtonContent}>
                      <Ionicons name="scan" size={32} color={theme.colors.text} />
                      <Text style={styles.scanButtonText}>SCAN FOOD</Text>
                    </View>
                  </CardComponent>
                </View>

                <Modal
                  visible={showImageModal}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={handleCancel}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      {selectedImage && (
                        <Image
                          source={{ uri: selectedImage }}
                          style={styles.previewImage}
                          contentFit="contain"
                        />
                      )}
                      <Text style={styles.modalQuestion}>Good to go?</Text>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.cancelButton]}
                          onPress={handleCancel}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.confirmButton]}
                          onPress={handleGoodToGo}
                        >
                          <Text style={styles.confirmButtonText}>Yes</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
            </View>
            
        </>
    )

}   

// Notes:
// SafeAreaView 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
    floatingButtonContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 40,
    },
    scanButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
    },
    scanButtonText: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
    },
    previewImage: {
      width: '100%',
      height: 300,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
    },
    modalQuestion: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      width: '100%',
    },
    modalButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.surface,
    },
    confirmButton: {
      backgroundColor: theme.colors.primary,
    },
    cancelButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    confirmButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: '#FFFFFF',
    },
 
})  