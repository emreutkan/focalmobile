import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import { Redirect, Stack } from "expo-router";
import ReviewItems, { FoodItem } from "@/src/components/ReviewItems";

const initialItems: FoodItem[] = [
  { name: "Chicken salad", quantity: "1 bowl", estimatedGrams: 280 },
  { name: "Greek yogurt", quantity: "1 cup", estimatedGrams: 150 },
];

export default function DevReviewItems() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  const [items, setItems] = useState<FoodItem[]>(initialItems);

  const updateItem = useCallback((index: number, field: keyof FoodItem, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { name: "New item", quantity: "1 serving", estimatedGrams: 100 }]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const confirm = useCallback(() => {
    Alert.alert("Confirm", "This is a dev preview action.");
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ReviewItems
        items={items}
        onUpdateItem={updateItem}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onConfirm={confirm}
      />
    </>
  );
}
