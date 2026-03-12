import React, { useCallback, useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, RefreshControl, Alert, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
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
import { useNutritionGaps } from "@/src/hooks/useUserQueries";
import { HomeSkeleton } from "@/src/components/Skeletons";

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
    const { data: mealsData, refetch: refetchMeals, isRefetching: isRefetchingMeals, isLoading: isLoadingMeals } = useMealsToday();
    const { data: gapsData, refetch: refetchGaps, isRefetching: isRefetchingGaps, isLoading: isLoadingGaps } = useNutritionGaps();
    const deleteMealMutation = useDeleteMeal();

    const isLoading = isLoadingMeals || isLoadingGaps;
    const isRefetching = isRefetchingMeals || isRefetchingGaps;

    const meals = (mealsData?.meals ?? []).map(m => ({
      id: m.id,
      meal_name: m.meal_name,
      calories: m.foodItems.reduce((acc, item) => acc + item.macros.calories, 0),
      protein: m.foodItems.reduce((acc, item) => acc + item.macros.protein, 0),
      carbs: m.foodItems.reduce((acc, item) => acc + item.macros.carbs, 0),
      fat: m.foodItems.reduce((acc, item) => acc + item.macros.fat, 0),
      health_score: m.healthScore,
      created_at: m.createdAt,
      foodItems: m.foodItems.map(fi => ({ 
        name: fi.itemName,
        macros: fi.macros,
        micros: fi.micros
      }))
    }));

    const dailyTotals = mealsData?.dailyTotals ?? {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      saturatedFat: 0,
      cholesterol: 0,
      sodium: 0,
      micros: [],
      animalProtein: 0,
      plantProtein: 0,
    };

    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<string>('calories');
    const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
    const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showMediaSelection, setShowMediaSelection] = useState(false);
    const [permissionType, setPermissionType] = useState<'camera' | 'gallery' | 'both' | 'none'>('both');
    const [isAddingMore, setIsAddingMore] = useState(false);

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
        await Promise.all([refetchMeals(), refetchGaps()]);
    }, [refetchMeals, refetchGaps]);

    const handleCardPress = useCallback(async (type: string) => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setModalType(type);
        setModalVisible(true);
      } catch (error) {
        console.error('Error opening breakdown:', error);
      }
    }, []);

    const breakdownItems = useMemo(() => {
      if (!mealsData?.meals) return [];
      const items: { name: string; value: number; time: string }[] = [];
      
      console.log('Calculating breakdown for:', modalType);

      mealsData.meals.forEach(meal => {
        const date = new Date(meal.createdAt);
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        meal.foodItems.forEach(food => {
          let value = 0;
          const normalizedType = modalType.toLowerCase().replace(/_/g, '');
          
          if (normalizedType === 'calories') value = food.macros?.calories ?? 0;
          else if (normalizedType === 'protein') value = food.macros?.protein ?? 0;
          else if (normalizedType === 'carbs') value = food.macros?.carbs ?? 0;
          else if (normalizedType === 'fat') value = food.macros?.fat ?? 0;
          else if (normalizedType === 'fiber') value = food.macros?.fiber ?? 0;
          else if (normalizedType === 'sugar') value = food.macros?.sugar ?? 0;
          else if (normalizedType === 'saturatedfat') value = food.macros?.saturatedFat ?? 0;
          else if (normalizedType === 'cholesterol') value = food.macros?.cholesterol ?? 0;
          else if (normalizedType === 'sodium') value = food.macros?.sodium ?? 0;
          else {
            // Check both micro.name and micro.nutrient_id
            const micro = food.micros?.find((m: any) => 
              m.name?.toLowerCase().replace(/_/g, '') === normalizedType ||
              m.nutrient_id?.toLowerCase().replace(/_/g, '') === normalizedType
            );
            if (micro) value = micro.amount;
          }

          if (value > 0) {
            items.push({ name: food.itemName, value, time });
          }
        });
      });
      console.log('Found items:', items.length);
      return items.sort((a, b) => b.value - a.value);
    }, [mealsData, modalType]);

    const modalProps = useMemo(() => {
      let title = `${modalType.toUpperCase()} BREAKDOWN`;
      let total = 0;
      let unit = 'g';
      let color = theme.card.dailySummary;

      const gap = gapsData?.find(g => 
        g.nutrient_id.toLowerCase().replace(/_/g, '') === modalType.toLowerCase().replace(/_/g, '')
      );

      if (modalType === 'calories') { total = dailyTotals.calories; unit = 'kcal'; color = theme.card.dailySummary; }
      else if (modalType === 'protein') { total = dailyTotals.protein; color = theme.card.proteinCard; }
      else if (modalType === 'carbs') { total = dailyTotals.carbs; color = theme.card.carbCard; }
      else if (modalType === 'fat') { total = dailyTotals.fat; color = theme.card.fatCard; }
      else if (modalType === 'fiber') { total = dailyTotals.fiber; color = theme.colors.primary; }
      else if (modalType === 'sugar') { total = dailyTotals.sugar; color = theme.colors.primary; }
      else if (modalType === 'saturatedFat') { total = dailyTotals.saturatedFat; title = 'SAT FAT BREAKDOWN'; color = theme.colors.primary; }
      else if (modalType === 'cholesterol') { total = dailyTotals.cholesterol; unit = 'mg'; color = theme.colors.primary; }
      else if (modalType === 'sodium') { total = dailyTotals.sodium; unit = 'mg'; color = theme.colors.primary; }
      else {
        const micro = dailyTotals.micros?.find(m => m.name === modalType);
        if (micro) {
          total = micro.amount;
          unit = micro.unit;
          title = `${modalType.replace(/_/g, ' ').toUpperCase()} BREAKDOWN`;
          color = theme.colors.primary;
        }
      }

      if (gap) {
        total = gap.intake;
        unit = gap.unit;
      }

      return { title, total, unit, color };
    }, [modalType, dailyTotals, gapsData, theme]);

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
    const FLOATING_CARD_WIDTH = useMemo(() => Math.min(400, width - theme.spacing.xl * 2), [width, theme.spacing.xl]);

    const handleScanFood = useCallback(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsAddingMore(false);
      setShowMediaSelection(true);
    }, []);

    const handleAddMore = useCallback(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsAddingMore(true);
      setShowMediaSelection(true);
    }, []);

    const handleSelectedImages = useCallback((uris: string[]) => {
      if (isAddingMore) {
        setSelectedImages(prev => {
          const newUris = [...prev, ...uris].slice(0, 5);
          return newUris;
        });
      } else {
        setSelectedImages(uris);
      }
      setShowMediaSelection(false);
      setShowPermissionModal(false);
    }, [isAddingMore]);

    const handleRemoveImage = useCallback((index: number) => {
      setSelectedImages(prev => {
        const newImages = [...prev];
        newImages.splice(index, 1);
        return newImages;
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    const handleGoodToGo = useCallback(() => {
      if (selectedImages.length > 0) {
        router.push({
          pathname: "/imageAnalyzer",
          params: { imageUris: JSON.stringify(selectedImages) },
        });
        setSelectedImages([]);
      }
    }, [selectedImages, router]);

    const handleCancel = useCallback(() => {
      setSelectedImages([]);
    }, []);

    return (
        <>
          <Stack.Screen options={{title: "Home", headerShown: false}} />
            <StatusBar style={isDark ? "light" : "dark"} />
              <View style={styles.container} >
                <Animated.ScrollView
                  scrollEventThrottle={16}
                  contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: top,
                  }}
                  onScroll={scrollHandler}
                  alwaysBounceVertical={true}
                  overScrollMode="always"
                  refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
                  }

                >
                  <TopBar />
                  {isLoading ? (
                    <HomeSkeleton />
                  ) : (
                    <>
                      <MiddleSection
                        dailyTotals={dailyTotals}
                        gaps={gapsData ?? []}
                        onCaloriesPress={() => handleCardPress('calories')}
                        onProteinPress={() => handleCardPress('protein')}
                        onCarbsPress={() => handleCardPress('carbs')}
                        onFatPress={() => handleCardPress('fat')}
                        onNutrientPress={(nutrient) => handleCardPress(nutrient)}
                      />
                      <MealsSection meals={meals} onDeleteMeal={handleDeleteMeal} />
                    </>
                  )}
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
                setSelectedImages={handleSelectedImages}
                cameraPermission={cameraPermission}
                galleryPermission={galleryPermission}
                setCameraPermission={setCameraPermission}
                setGalleryPermission={setGalleryPermission}
                setShowPermissionModal={setShowPermissionModal}
                setShowMediaSelection={setShowMediaSelection}
                setPermissionType={setPermissionType}
                compact={isAddingMore}
                />}


                <MacroBreakdownModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  title={modalProps.title}
                  total={modalProps.total}
                  unit={modalProps.unit}
                  items={breakdownItems}
                  headerColor={modalProps.color}
                  circleColor={modalProps.color}
                  progressColor={modalProps.color}
                />
                {selectedImages.length > 0 && !showMediaSelection && <ShowImage selectedImages={selectedImages} handleCancel={handleCancel} handleGoodToGo={handleGoodToGo} onAddMore={handleAddMore} onRemoveImage={handleRemoveImage} />}
            </View>
        </>
    )

}


const getStyles = (theme: Theme) => StyleSheet.create({
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
