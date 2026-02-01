import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme";

export default function DailySummaryCard() {
  return (
    <>
    <View style={styles.container}>
      <Text>Daily Summary Card</Text>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
  },
})