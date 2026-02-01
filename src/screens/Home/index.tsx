import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";    
import { Stack } from "expo-router";
import { theme } from "@/src/theme";
import { GlassView } from "expo-glass-effect";
import { Image } from "expo-image";
export default function HomeScreen() {

    const [refreshing,setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Haptic Feedback on pull to refresh
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        // Simulate a refresh operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    }, [])

    // get todays date
    const today = new Date();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const dayOfMonth = today.getDate().toString().slice(0, 2);
 
    return (
        <>
          <Stack.Screen options={{title: "Home", headerShown: false}} />
            <StatusBar style="dark" />
              <SafeAreaView style={styles.container} edges={["top"]} >
                <ScrollView
                  contentContainerStyle={{
                    flex: 1,
                    backgroundColor: theme.colors.background,
                  }}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                   
                  

                >
                  <View style={styles.TopRowContainer}>
                    <Text style={styles.TopRowTitle}>Hello!</Text>
                    <Text style={styles.TopRowDate}>{month} {today.getDate()}</Text>
                  </View>


                </ScrollView>
            </SafeAreaView>
            
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
    TopRowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    TopRowTitle: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    TopRowDate: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.regular,
      color: theme.colors.textSecondary,
    },
 
})  