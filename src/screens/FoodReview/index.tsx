import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReviewItems, { FoodItem } from '@/src/components/ReviewItems';
import { analyzeItems, RateLimitError } from '@/src/services/mealService';
import LoadingScreen from '@/src/components/LoadingScreen';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Theme } from '@/src/theme';
import { useUserStore } from '@/src/hooks/userStore';


export default function FoodReviewScreen() {
  const { items: itemsParam, mealName: mealNameParam } = useLocalSearchParams<{
    items: string;
    mealName: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const isPro = useUserStore((state) => state.isPro);

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
  const [userNotes, setUserNotes] = useState('');

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
      const nutritionResult = await analyzeItems(mealName, items, userNotes || undefined);

      console.log('Nutrition calculation completed, navigating to results...');

      router.push({
        pathname: '/nutritionResults',
        params: {
          nutritionData: encodeURIComponent(JSON.stringify(nutritionResult)),
          mealName: encodeURIComponent(mealName),
        },
      });
      setCalculating(false);
    } catch (error: any) {
      console.error('Error calculating nutrition:', error);
      setCalculating(false);
      if (error instanceof RateLimitError) {
        if (isPro) {
          Alert.alert("Limit Reached", "You've used all 30 AI calls for today. Come back tomorrow!", [{ text: "OK" }]);
        } else {
          Alert.alert(
            "Daily Limit Reached", 
            "Free users get 3 AI calls per day. Upgrade to Pro for 30 calls!",
            [
              { text: "Maybe Later", style: "cancel" },
              { text: "View Pro", onPress: () => router.push('/pro') }
            ]
          );
        }
        return;
      }
      Alert.alert('Error', 'Failed to calculate nutrition. Please try again.');
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
        userNotes={userNotes}
        onUserNotesChange={setUserNotes}
      />
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
