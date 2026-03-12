import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/src/hooks/userStore';
import { deleteAllMeals } from '@/src/services/mealService';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useNutritionTargets, useUpdateNutritionTarget, useResetNutritionTarget } from '@/src/hooks/useUserQueries';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const setIsAuthenticated = useUserStore((state) => state.setIsAuthenticated);
  const isPro = useUserStore((state) => state.isPro);

  const { data: targets, isLoading: isLoadingTargets } = useNutritionTargets();
  const updateTarget = useUpdateNutritionTarget();
  const resetTarget = useResetNutritionTarget();

  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditTarget = (id: string, current: number) => {
    setEditingTargetId(id);
    setEditValue(current.toString());
  };

  const handleSaveTarget = (id: string, unit: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val)) return;
    updateTarget.mutate({ nutrientId: id, targetAmount: val, unit }, {
      onSuccess: () => setEditingTargetId(null),
    });
  };

  const handleResetTarget = (id: string) => {
    resetTarget.mutate(id);
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.text }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.text }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>SETTINGS</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {!isPro && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>UPGRADE</Text>

            <TouchableOpacity
              style={styles.proCard}
              onPress={handleSwitchToPro}
              activeOpacity={0.9}
            >
              <View style={[styles.proCardShadow, { backgroundColor: theme.colors.text }]} />
              <View style={[styles.proCardInner, { backgroundColor: theme.card.pro, borderColor: theme.colors.text }]}>
                <View style={styles.proCardHeader}>
                  <View style={[styles.proIconCircle, { backgroundColor: theme.colors.overlayLight, borderColor: theme.colors.text }]}>
                    <Ionicons
                      name="diamond"
                      size={32}
                      color={theme.colors.text}
                    />
                  </View>
                  <View style={[styles.proBadgeLarge, { backgroundColor: theme.colors.text }]}>
                    <Ionicons name="star" size={10} color={theme.card.pro} />
                    <Text style={[styles.proBadgeLargeText, { color: theme.card.pro }]}>PRO</Text>
                  </View>
                </View>
                <Text style={[styles.proCardTitle, { color: theme.colors.text }]}>UNLOCK FULL POTENTIAL</Text>
                <Text style={[styles.proCardSubtitle, { color: theme.colors.textSecondary }]}>
                  Unlimited scans, deep insights, cloud sync & more
                </Text>
                <View style={[styles.proCardCta, { backgroundColor: theme.colors.surface, borderColor: theme.colors.text }]}>
                  <Text style={[styles.proCardCtaText, { color: theme.colors.text }]}>GET STARTED</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color={theme.colors.text}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>NUTRITION TARGETS</Text>
          
          {isLoadingTargets ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <View style={[styles.targetsList, { backgroundColor: theme.colors.surface }]}>
              {targets?.map((target) => (
                <View key={target.nutrient_id} style={styles.targetItem}>
                  <View style={styles.targetInfo}>
                    <Text style={[styles.targetName, { color: theme.colors.text }]}>
                      {target.nutrient_id.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    {editingTargetId === target.nutrient_id ? (
                      <View style={styles.editContainer}>
                        <TextInput
                          style={[styles.targetInput, { color: theme.colors.text, borderColor: theme.colors.primary }]}
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType="numeric"
                          autoFocus
                        />
                        <TouchableOpacity onPress={() => handleSaveTarget(target.nutrient_id, target.unit)}>
                          <Ionicons name="checkmark-circle" size={28} color={theme.colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditingTargetId(null)}>
                          <Ionicons name="close-circle" size={28} color={theme.colors.error} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.targetValueContainer}>
                        <Text style={[styles.targetValue, { color: theme.colors.text }]}>
                          {target.target_amount} {target.unit}
                        </Text>
                        <Text style={[styles.targetSource, { color: theme.colors.textTertiary }]}>
                          ({target.source})
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.targetActions}>
                    <TouchableOpacity onPress={() => handleEditTarget(target.nutrient_id, target.target_amount)}>
                      <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    {target.source === 'custom' && (
                      <TouchableOpacity onPress={() => handleResetTarget(target.nutrient_id)}>
                        <Ionicons name="refresh-outline" size={20} color={theme.colors.warning} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>APPEARANCE</Text>
          
          <View style={[styles.themeSelector, { backgroundColor: theme.colors.surface }]}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeOption,
                  themeMode === mode && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setThemeMode(mode)}
              >
                <Text style={[
                  styles.themeOptionText,
                  { color: themeMode === mode ? theme.colors.textInverse : theme.colors.text }
                ]}>
                  {mode.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>DATA</Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={handleDeleteData}
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.card }]}>
              <Ionicons
                name="trash-outline"
                size={24}
                color={theme.colors.error}
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Delete All Data</Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>
                Remove all meals and start fresh
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>ACCOUNT</Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.card }]}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color={theme.colors.error}
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Logout</Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>
                Sign out of your account
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>ABOUT</Text>

          <View style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.card }]}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Version</Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>1.0.0</Text>
            </View>
          </View>

          <View style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.card }]}>
              <Ionicons
                name="heart-outline"
                size={24}
                color={theme.card.fatCard}
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Made with love</Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>By the Focal team</Text>
            </View>
          </View>
        </View>

        {__DEV__ && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>DEVELOPER</Text>

            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
              onPress={handleDevScreen}
              activeOpacity={0.8}
            >
              <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.card }]}>
                <Ionicons
                  name="code-slash-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Dev Screen</Text>
                <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>
                  Developer tools and testing
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  menuItemSubtitle: {
    fontSize: 13,
  },
  themeSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  proCard: {
    position: 'relative',
    marginBottom: 12,
  },
  proCardShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    borderRadius: 16,
  },
  proCardInner: {
    borderRadius: 16,
    borderWidth: 4,
    padding: 24,
  },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  proIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  proBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  proBadgeLargeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  proCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  proCardSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  proCardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  proCardCtaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  targetsList: {
    borderRadius: 12,
    padding: 8,
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  targetInfo: {
    flex: 1,
    gap: 4,
  },
  targetName: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  targetValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  targetSource: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  targetActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetInput: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 60,
  },
  });