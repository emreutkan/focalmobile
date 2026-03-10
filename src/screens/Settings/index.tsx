import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@/src/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/src/hooks/userStore';
import { deleteAllMeals } from '@/src/services/mealService';

export default function SettingsScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const setIsAuthenticated = useUserStore((state) => state.setIsAuthenticated);
  const isPro = useUserStore((state) => state.isPro);

  const handleSwitchToPro = () => {
    router.push('/pro');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('user-store');
          setIsAuthenticated(false);
        },
      },
    ]);
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your meals? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteAllMeals();
              Alert.alert('Success', 'All data has been deleted.');
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert('Error', 'Failed to delete data.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleDevScreen = () => {
    router.push('/dev');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {!isPro && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPGRADE</Text>

            <TouchableOpacity
              style={styles.proCard}
              onPress={handleSwitchToPro}
              activeOpacity={0.9}
            >
              <View style={styles.proCardShadow} />
              <View style={styles.proCardInner}>
                <View style={styles.proCardHeader}>
                  <View style={styles.proIconCircle}>
                    <Ionicons
                      name="diamond"
                      size={theme.sizes.iconLg}
                      color={theme.colors.text}
                    />
                  </View>
                  <View style={styles.proBadgeLarge}>
                    <Ionicons name="star" size={10} color={theme.colors.text} />
                    <Text style={styles.proBadgeLargeText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.proCardTitle}>UNLOCK FULL POTENTIAL</Text>
                <Text style={styles.proCardSubtitle}>
                  Unlimited scans, deep insights, cloud sync & more
                </Text>
                <View style={styles.proCardCta}>
                  <Text style={styles.proCardCtaText}>GET STARTED</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={theme.sizes.iconSm}
                    color={theme.colors.text}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDeleteData}
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons
                name="trash-outline"
                size={theme.sizes.iconLg}
                color={theme.colors.error}
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Delete All Data</Text>
              <Text style={styles.menuItemSubtitle}>
                Remove all meals and start fresh
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={theme.sizes.iconMd}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons
                name="log-out-outline"
                size={theme.sizes.iconLg}
                color={theme.colors.error}
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Logout</Text>
              <Text style={styles.menuItemSubtitle}>
                Sign out of your account
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={theme.sizes.iconMd}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Ionicons
                name="information-circle-outline"
                size={theme.sizes.iconLg}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Version</Text>
              <Text style={styles.menuItemSubtitle}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Ionicons
                name="heart-outline"
                size={theme.sizes.iconLg}
                color={theme.card.fatCard}
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Made with love</Text>
              <Text style={styles.menuItemSubtitle}>By the Focal team</Text>
            </View>
          </View>
        </View>

        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DEVELOPER</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDevScreen}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemIcon}>
                <Ionicons
                  name="code-slash-outline"
                  size={theme.sizes.iconLg}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Dev Screen</Text>
                <Text style={styles.menuItemSubtitle}>
                  Developer tools and testing
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={theme.sizes.iconMd}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: theme.borderWidth.thick,
    borderBottomColor: theme.colors.text,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
    letterSpacing: theme.typography.letterSpacing.tight,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  menuItemIcon: {
    width: theme.sizes.buttonMd,
    height: theme.sizes.buttonMd,
    borderRadius: theme.sizes.buttonMd / 2,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  menuItemSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  proCard: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  proCardShadow: {
    position: 'absolute',
    top: theme.offsets.sm,
    left: theme.offsets.sm,
    right: -theme.offsets.sm,
    bottom: -theme.offsets.sm,
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.xl,
  },
  proCardInner: {
    backgroundColor: theme.colors.pro,
    borderRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    padding: theme.spacing.lg,
  },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  proIconCircle: {
    width: theme.sizes.buttonXl,
    height: theme.sizes.buttonXl,
    borderRadius: theme.sizes.buttonXl / 2,
    backgroundColor: theme.colors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: theme.borderWidth.base,
    borderColor: theme.colors.text,
  },
  proBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md - theme.spacing.xs,
    paddingVertical: theme.spacing.xs + theme.spacing.xxs,
    borderRadius: theme.borderRadius.full,
  },
  proBadgeLargeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.pro,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  proCardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.tight,
    marginBottom: theme.spacing.xs,
  },
  proCardSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  proCardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.whiteTranslucent,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.base,
    borderColor: theme.colors.text,
  },
  proCardCtaText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
});
