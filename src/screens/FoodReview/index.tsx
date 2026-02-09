import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReviewItems, { FoodItem } from '@/src/components/ReviewItems';
import { calculateNutrition } from '@/src/services/groqService';
import LoadingScreen from '@/src/components/LoadingScreen';
import { theme } from '@/src/theme';

export default function FoodReviewScreen() {
  const { items: itemsParam, mealName: mealNameParam } = useLocalSearchParams<{
    items: string;
    mealName: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<FoodItem[]>(() => {
    try {
      return itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [];
    } catch {
      return [];
    }
  });
  const [mealName] = useState(() => {
    try {
      return mealNameParam ? decodeURIComponent(mealNameParam) : '';
    } catch {
      return '';
    }
  });
  const [calculating, setCalculating] = useState(false);

  const handleUpdateItem = (
    index: number,
    field: keyof FoodItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: '', estimatedGrams: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (items.length === 0) {
      return;
    }

    try {
      console.log(
        'Items being sent to nutrition calculator:',
        JSON.stringify(items, null, 2),
      );

      setCalculating(true);
      const nutritionResult = await calculateNutrition(items);

      console.log('Nutrition calculation completed, navigating to results...');

      router.push({
        pathname: '/nutritionResults',
        params: {
          nutritionData: encodeURIComponent(JSON.stringify(nutritionResult)),
          foodItems: encodeURIComponent(JSON.stringify(items)),
          mealName: encodeURIComponent(mealName),
        },
      });
    } catch (error: any) {
      console.error('Error calculating nutrition:', error);
      setCalculating(false);
    }
  };

  if (calculating) {
    return <LoadingScreen message="Calculating nutrition..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ReviewItems
        items={items}
        onUpdateItem={handleUpdateItem}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onConfirm={handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
