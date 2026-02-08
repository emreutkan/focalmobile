import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { theme } from "@/src/theme";
export default function TopBar() {
  const router = useRouter();
  const today = new Date();
  const month = today.toLocaleDateString('en-US', { month: 'long' });
  const dayOfMonth = today.getDate().toString().slice(0, 2);

  return (
    <View style={styles.container}>
      <View>
      <Text style={styles.title}>
        focal<Text style={styles.dot}>.</Text>
      </Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.date}>{month} {dayOfMonth}</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  date: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.textSecondary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
});