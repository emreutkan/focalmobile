import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/src/theme";
import Animated, { interpolate, SharedValue, useDerivedValue } from "react-native-reanimated";

export default function TopBar({ scrollY }: { scrollY: SharedValue<number> }) {
      // get todays date
      const today = new Date();
      const month = today.toLocaleDateString('en-US', { month: 'long' });
      const dayOfMonth = today.getDate().toString().slice(0, 2);
 
  const titleOpacity = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 50], [1, 0]);
  });
  const dateOpacity = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 50], [1, 0]);
  });
    return (
      <>
        <Animated.View style={styles.container}>
          <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
            focal<Text style={styles.dot}>.</Text>
          </Animated.Text>
          <Animated.Text style={[styles.date, { opacity: dateOpacity }]}>{month} {dayOfMonth}</Animated.Text>
        </Animated.View>
      </>

    )
  }

  const styles = StyleSheet.create({

  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  dot: {
    color: theme.card.dailySummary,
  },
  date: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.textSecondary,
  },
})