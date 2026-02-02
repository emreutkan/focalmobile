import DailySummaryCard from "@/src/components/Cards/dailySummaryCard";
import { View, StyleSheet } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";

export default function MiddleSection({ scrollY }: { scrollY: SharedValue<number> }) {
  return (
    <>
      <Animated.View style={styles.container}>
        <DailySummaryCard scrollY={scrollY} />
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
  },
})