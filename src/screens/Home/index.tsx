import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";    
import { Stack } from "expo-router";
import { theme } from "@/src/theme";
import { GlassView } from "expo-glass-effect";
import { Image } from "expo-image";
import TopBar from "./components/topBar";
import MiddleSection from "./components/middleSection";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";  // ✅

export default function HomeScreen() {
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      console.log(scrollY.value);
    },
  });
    const [refreshing,setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Haptic Feedback on pull to refresh
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        // Simulate a refresh operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    }, [])

    const {top} = useSafeAreaInsets();
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

 
})  