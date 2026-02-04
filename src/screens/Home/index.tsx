import React, { useCallback, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Modal, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { theme } from "@/src/theme";
import { Image } from "expo-image";
import TopBar from "./components/topBar";
import MiddleSection from "./components/middleSection";
import MealsSection from "./components/mealsSection";
import MacroBreakdownModal from "@/src/components/MacroBreakdownModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import CardComponent from "@/src/components/Cards/cardComponent";
import { Dimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { initDatabase, getDailyTotals, getTodaysMeals, getMacroBreakdown, deleteMeal, getMealById } from "@/src/utils/database";

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
    const [showPickerModal, setShowPickerModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [permissionType, setPermissionType] = useState<'camera' | 'gallery' | 'both'>('both');
    const [dailyTotals, setDailyTotals] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });
    const [meals, setMeals] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');
    const [breakdownData, setBreakdownData] = useState<Array<{ name: string; value: number; time: string }>>([]);
    const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
    const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Check permissions on mount
    useEffect(() => {
      const checkPermissions = async () => {
        const [cameraStatus, galleryStatus] = await Promise.all([
          ImagePicker.getCameraPermissionsAsync(),
          ImagePicker.getMediaLibraryPermissionsAsync(),
        ]);
        setCameraPermission(cameraStatus.granted);
        setGalleryPermission(galleryStatus.granted);
      };
      checkPermissions();
    }, []);

    const openSettings = useCallback(() => {
      Linking.openSettings();
      setShowPermissionModal(false);
    }, []);
    
    const loadData = useCallback(async () => {
      try {
        await initDatabase();
        const totals = await getDailyTotals();
        setDailyTotals(totals);
        
        const todaysMeals = await getTodaysMeals();
        const mealsWithItems = await Promise.all(
          todaysMeals.map(async (meal) => {
            const fullMeal = await getMealById(meal.id);
            return fullMeal;
          })
        );
        setMeals(mealsWithItems.filter(Boolean));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }, []);

    useEffect(() => {
      loadData();
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const handleCardPress = useCallback(async (type: 'calories' | 'protein' | 'carbs' | 'fat') => {
      try {
        const breakdown = await getMacroBreakdown(type);
        setBreakdownData(breakdown);
        setModalType(type);
        setModalVisible(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error loading breakdown:', error);
      }
    }, []);

    const handleDeleteMeal = useCallback(async (mealId: number) => {
      Alert.alert(
        'Delete Meal',
        'Are you sure you want to delete this meal?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteMeal(mealId);
                await loadData();
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch (error) {
                console.error('Error deleting meal:', error);
                Alert.alert('Error', 'Failed to delete meal');
              }
            },
          },
        ]
      );
    }, [loadData]);

    const {top, bottom} = useSafeAreaInsets();
    const { width } = Dimensions.get("window");
    const FLOATING_CARD_WIDTH = Math.min(400, width - theme.spacing.xl * 2);
    
    const handleScanFood = useCallback(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Re-check permissions
      const [cameraStatus, galleryStatus] = await Promise.all([
        ImagePicker.getCameraPermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
      ]);

      const hasCamera = cameraStatus.granted;
      const hasGallery = galleryStatus.granted;

      setCameraPermission(hasCamera);
      setGalleryPermission(hasGallery);

      // If both are denied, show error modal
      if (!hasCamera && !hasGallery) {
        // Check if we can still request (not permanently denied)
        if (!cameraStatus.canAskAgain && !galleryStatus.canAskAgain) {
          setPermissionType('both');
          setShowPermissionModal(true);
          return;
        }
      }

      setShowPickerModal(true);
    }, []);

    const handleCameraSelect = useCallback(async () => {
      setShowPickerModal(false);

      try {
        const currentPermission = await ImagePicker.getCameraPermissionsAsync();

        if (!currentPermission.granted) {
          if (currentPermission.canAskAgain) {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              setCameraPermission(false);
              setPermissionType('camera');
              setShowPermissionModal(true);
              return;
            }
            setCameraPermission(true);
          } else {
            setCameraPermission(false);
            setPermissionType('camera');
            setShowPermissionModal(true);
            return;
          }
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedImage(result.assets[0].uri);
          setShowImageModal(true);
        }
      } catch (error) {
        console.error('Error with camera:', error);
      }
    }, []);

    const handleGallerySelect = useCallback(async () => {
      setShowPickerModal(false);

      try {
        const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (!currentPermission.granted) {
          if (currentPermission.canAskAgain) {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              setGalleryPermission(false);
              setPermissionType('gallery');
              setShowPermissionModal(true);
              return;
            }
            setGalleryPermission(true);
          } else {
            setGalleryPermission(false);
            setPermissionType('gallery');
            setShowPermissionModal(true);
            return;
          }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedImage(result.assets[0].uri);
          setShowImageModal(true);
        }
      } catch (error) {
        console.error('Error with gallery:', error);
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
                {__DEV__ && (
                  <TouchableOpacity
                    style={styles.devButton}
                    onPress={() => router.push("/dev")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.devButtonText}>DEV</Text>
                  </TouchableOpacity>
                )}
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
                  <TopBar onSettingsPress={() => setShowSettingsModal(true)} />
                  <MiddleSection 
                    calories={dailyTotals.total_calories}
                    protein={dailyTotals.total_protein}
                    carbs={dailyTotals.total_carbs}
                    fat={dailyTotals.total_fat}
                    onCaloriesPress={() => handleCardPress('calories')}
                    onProteinPress={() => handleCardPress('protein')}
                    onCarbsPress={() => handleCardPress('carbs')}
                    onFatPress={() => handleCardPress('fat')}
                  />
                  <MealsSection meals={meals} onDeleteMeal={handleDeleteMeal} />
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

                {/* Image Source Picker Modal */}
                <Modal
                  visible={showPickerModal}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowPickerModal(false)}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.pickerModalContent}>
                      <Text style={styles.pickerTitle}>SCAN YOUR FOOD</Text>
                      <Text style={styles.pickerSubtitle}>Choose how to capture</Text>

                      <View style={styles.pickerOptions}>
                        <TouchableOpacity
                          style={styles.pickerOption}
                          onPress={handleCameraSelect}
                          activeOpacity={0.8}
                        >
                          <View style={[
                            styles.pickerIconBox,
                            { backgroundColor: cameraPermission === false ? theme.colors.surface : '#4ecdc4' }
                          ]}>
                            <Ionicons
                              name={cameraPermission === false ? "camera-outline" : "camera"}
                              size={40}
                              color={cameraPermission === false ? theme.colors.textTertiary : theme.colors.text}
                            />
                            {cameraPermission === false && (
                              <View style={styles.permissionBadge}>
                                <Ionicons name="lock-closed" size={14} color="#fff" />
                              </View>
                            )}
                          </View>
                          <Text style={[
                            styles.pickerOptionText,
                            cameraPermission === false && styles.pickerOptionTextDisabled
                          ]}>CAMERA</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.pickerOption}
                          onPress={handleGallerySelect}
                          activeOpacity={0.8}
                        >
                          <View style={[
                            styles.pickerIconBox,
                            { backgroundColor: galleryPermission === false ? theme.colors.surface : '#FFE66D' }
                          ]}>
                            <Ionicons
                              name={galleryPermission === false ? "images-outline" : "images"}
                              size={40}
                              color={galleryPermission === false ? theme.colors.textTertiary : theme.colors.text}
                            />
                            {galleryPermission === false && (
                              <View style={styles.permissionBadge}>
                                <Ionicons name="lock-closed" size={14} color="#fff" />
                              </View>
                            )}
                          </View>
                          <Text style={[
                            styles.pickerOptionText,
                            galleryPermission === false && styles.pickerOptionTextDisabled
                          ]}>GALLERY</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.pickerCancelButton}
                        onPress={() => setShowPickerModal(false)}
                      >
                        <Text style={styles.pickerCancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                {/* Image Preview Modal */}
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
                      <Text style={styles.modalQuestion}>READY TO ANALYZE?</Text>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.cancelButton]}
                          onPress={handleCancel}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.cancelButtonText}>RETAKE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.confirmButton]}
                          onPress={handleGoodToGo}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.confirmButtonText}>LET'S GO!</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>

                {/* Permission Error Modal */}
                <Modal
                  visible={showPermissionModal}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowPermissionModal(false)}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.permissionModalContent}>
                      <Text style={styles.permissionEmoji}>
                        {permissionType === 'camera' ? '📸' : permissionType === 'gallery' ? '🖼️' : '🙈'}
                      </Text>
                      <Text style={styles.permissionTitle}>
                        {permissionType === 'both' ? 'OOPS!' : 'NEED ACCESS!'}
                      </Text>
                      <Text style={styles.permissionMessage}>
                        {permissionType === 'camera'
                          ? "We can't use your camera without permission. Let's fix that in settings!"
                          : permissionType === 'gallery'
                          ? "We can't see your photos without permission. A quick trip to settings will sort this out!"
                          : "We need camera or photo access to scan your food. Let's set things up!"}
                      </Text>

                      <View style={styles.permissionInfo}>
                        <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
                        <Text style={styles.permissionInfoText}>
                          We only use this to analyze your food. Your photos stay on your device!
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={openSettings}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                        <Text style={styles.settingsButtonText}>OPEN SETTINGS</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.permissionCancelButton}
                        onPress={() => setShowPermissionModal(false)}
                      >
                        <Text style={styles.permissionCancelText}>Maybe Later</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <MacroBreakdownModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  title={
                    modalType === 'calories' ? 'CALORIES BREAKDOWN' :
                    modalType === 'protein' ? 'PROTEIN BREAKDOWN' :
                    modalType === 'carbs' ? 'CARBS BREAKDOWN' :
                    'FAT BREAKDOWN'
                  }
                  total={
                    modalType === 'calories' ? dailyTotals.total_calories :
                    modalType === 'protein' ? dailyTotals.total_protein :
                    modalType === 'carbs' ? dailyTotals.total_carbs :
                    dailyTotals.total_fat
                  }
                  unit={modalType === 'calories' ? 'kcal' : 'g'}
                  items={breakdownData}
                  headerColor={
                    modalType === 'calories' ? theme.card.dailySummary :
                    modalType === 'protein' ? theme.card.proteinCard :
                    modalType === 'carbs' ? theme.card.carbCard :
                    theme.card.fatCard
                  }
                  circleColor={
                    modalType === 'calories' ? theme.card.dailySummary :
                    modalType === 'protein' ? theme.card.proteinCard :
                    modalType === 'carbs' ? theme.card.carbCard :
                    theme.card.fatCard
                  }
                  progressColor={
                    modalType === 'calories' ? theme.card.dailySummary :
                    modalType === 'protein' ? theme.card.proteinCard :
                    modalType === 'carbs' ? theme.card.carbCard :
                    theme.card.fatCard
                  }
                />
{/* 
                <SettingsModal
                  visible={showSettingsModal}
                  onClose={() => setShowSettingsModal(false)}
                  onDataDeleted={loadData}
                /> */}
            </View>

        </>
    )

}   


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
    devButton: {
      position: 'absolute',
      top: theme.spacing.xl,
      right: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.text,
      zIndex: 60,
      ...theme.shadows.sm,
    },
    devButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      letterSpacing: 1,
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
      borderWidth: 4,
      borderColor: theme.colors.text,
    },
    previewImage: {
      width: '100%',
      height: 300,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 4,
      borderColor: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    modalQuestion: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      letterSpacing: 1,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      width: '100%',
    },
    modalButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      borderWidth: 4,
      borderColor: theme.colors.text,
    },
    cancelButton: {
      backgroundColor: theme.colors.surface,
    },
    confirmButton: {
      backgroundColor: '#4ecdc4',
    },
    cancelButtonText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    confirmButtonText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    pickerModalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      borderWidth: 4,
      borderColor: theme.colors.text,
    },
    pickerTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      letterSpacing: 1,
    },
    pickerSubtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
    },
    pickerOptions: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    pickerOption: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    pickerIconBox: {
      width: 100,
      height: 100,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 4,
      borderColor: theme.colors.text,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.md,
    },
    pickerOptionText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      letterSpacing: 1,
    },
    pickerCancelButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
    },
    pickerCancelText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    pickerOptionTextDisabled: {
      color: theme.colors.textTertiary,
    },
    permissionBadge: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: theme.colors.error,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.card,
    },
    permissionModalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      borderWidth: 4,
      borderColor: theme.colors.text,
    },
    permissionEmoji: {
      fontSize: 64,
      marginBottom: theme.spacing.md,
    },
    permissionTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      letterSpacing: 1,
    },
    permissionMessage: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
    },
    permissionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    permissionInfoText: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    settingsButton: {
      width: '100%',
      backgroundColor: '#4ecdc4',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 4,
      borderColor: theme.colors.text,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      ...theme.shadows.md,
    },
    settingsButtonText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      letterSpacing: 1,
    },
    permissionCancelButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      marginTop: theme.spacing.sm,
    },
    permissionCancelText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textTertiary,
    },
})  
