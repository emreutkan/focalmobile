import React, { useCallback, useState, useEffect } from "react";
import { View, Text, StyleSheet, RefreshControl, Alert, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { theme } from "@/src/theme";
import TopBar from "./components/topBar";
import MiddleSection from "./components/middleSection";
import MealsSection from "./components/mealsSection";
import MacroBreakdownModal from "@/src/components/MacroBreakdownModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import CardComponent from "@/src/components/Cards/cardComponent";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { initDatabase, getDailyTotals, getTodaysMeals, getMacroBreakdown, deleteMeal, getMealById } from "@/src/utils/database";
import { MediaSelection } from "./components/mediaSelection";
import * as ImagePicker from "expo-image-picker";
import { MediaPermission } from "./components/mediaPermission";
import { ShowImage } from "./components/showImage";

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
    const [dailyTotals, setDailyTotals] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });
    const [meals, setMeals] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');
    const [breakdownData, setBreakdownData] = useState<Array<{ name: string; value: number; time: string }>>([]);
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
        const hasCamera = cameraStatus.granted;
        const hasGallery = galleryStatus.granted;
  
        setCameraPermission(hasCamera);
        setGalleryPermission(hasGallery);
        if (!hasCamera && !hasGallery) {
          setShowPermissionModal(true);
          setPermissionType('none');
        }
      };


    useEffect(() => {

      checkPermissions();
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
        console.log('selectedImage set:', selectedImage);
        console.log('Setting showImageModal to true');
        setShowMediaSelection(false);
        setShowPermissionModal(false);
        setShowImageModal(true);
      }
    }, [selectedImage]);

    useEffect(() => {
      console.log('showImageModal changed:', showImageModal);
    }, [showImageModal]);
    
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
                {showImageModal && <ShowImage selectedImage={selectedImage} setShowImageModal={setShowImageModal} handleCancel={handleCancel} handleGoodToGo={handleGoodToGo} />}
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
