import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/src/theme";

export default function TopBar() {
      // get todays date
      const today = new Date();
      const month = today.toLocaleDateString('en-US', { month: 'long' });
      const dayOfMonth = today.getDate().toString().slice(0, 2);
 
    return (
      <>
        <View style={styles.container}>
          <Text style={styles.title}>Hello!</Text>
          <Text style={styles.date}>{month} {dayOfMonth}</Text>
        </View>
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
  date: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.textSecondary,
  },
})