import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, RefreshControl, Alert, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { theme } from "@/src/theme";
import TopBar from "./components/topBar";
import MiddleSection from "./components/middleSection";
import MealsSection from "./components/mealsSection";
import MacroBreakdownModal from "./components/MacroBreakdownModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import CardComponent from "@/src/components/Cards/cardComponent";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MediaSelection } from "./components/mediaSelection";
import * as ImagePicker from "expo-image-picker";
import { MediaPermission } from "./components/mediaPermission";
import { ShowImage } from "./components/showImage";
import { useMealsToday, useDeleteMeal } from "@/src/hooks/useMealQueries";

export default function HomeScreen() {
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
    const { data: mealsData, refetch, isRefetching } = useMealsToday();
    const deleteMealMutation = useDeleteMeal();

    const meals = mealsData?.meals ?? [];
    const dailyTotals = {
      total_calories: mealsData?.dailyTotals.calories ?? 0,
      total_protein: mealsData?.dailyTotals.protein ?? 0,
      total_carbs: mealsData?.dailyTotals.carbs ?? 0,
      total_fat: mealsData?.dailyTotals.fat ?? 0,
    };

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');
    const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
    const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showMediaSelection, setShowMediaSelection] = useState(false);
    const [permissionType, setPermissionType] = useState<'camera' | 'gallery' | 'both' | 'none'>('both');

    const checkPermissions = async () => {
      const [cameraStatus, galleryStatus] = await Promise.all([
          ImagePicker.getCameraPermissionsAsync(),
          ImagePicker.getMediaLibraryPermissionsAsync(),
        ]);
        setCameraPermission(cameraStatus.granted);
        setGalleryPermission(galleryStatus.granted);
      };


    React.useEffect(() => {
      checkPermissions();
    }, []);

    const onRefresh = useCallback(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await refetch();
    }, [refetch]);

    const handleCardPress = useCallback(async (type: 'calories' | 'protein' | 'carbs' | 'fat') => {
      try {
        // await deleteMeal(mealId);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.error('Error deleting meal:', error);
        Alert.alert('Error', 'Failed to delete meal');
      }
    }, []);

    const handleDeleteMeal = useCallback(async (mealId: string) => {
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
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                deleteMealMutation.mutate(mealId, {
                  onError: () => Alert.alert('Error', 'Failed to delete meal'),
                });
              } catch (error) {
                console.error('Error deleting meal:', error);
                Alert.alert('Error', 'Failed to delete meal');
              }
            },
          },
        ]
      );
    }, [deleteMealMutation]);

    const {top, bottom} = useSafeAreaInsets();
    const { width } = Dimensions.get("window");
    const FLOATING_CARD_WIDTH = Math.min(400, width - theme.spacing.xl * 2);

    const handleScanFood = useCallback(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);



      setShowMediaSelection(true);
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

    useEffect(() => {
      if (selectedImage) {
        setShowMediaSelection(false);
        setShowPermissionModal(false);
        setShowImageModal(true);
      }
    }, [selectedImage]);

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
                    <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
                  }

                >
                  <TopBar />
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

                {showPermissionModal && <MediaPermission showPermissionModal={showPermissionModal} setShowPermissionModal={setShowPermissionModal} permissionType={permissionType} />}

                {showMediaSelection &&
                <MediaSelection
                setSelectedImage={setSelectedImage}
                cameraPermission={cameraPermission}
                galleryPermission={galleryPermission}
                setCameraPermission={setCameraPermission}
                setGalleryPermission={setGalleryPermission}
                setShowPermissionModal={setShowPermissionModal}
                setShowMediaSelection={setShowMediaSelection}
                setPermissionType={setPermissionType}
                />}


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
                  items={[]}
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
                {showImageModal && <ShowImage selectedImage={selectedImage} handleCancel={handleCancel} handleGoodToGo={handleGoodToGo} />}
            </View>
        </>
    )

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
})
