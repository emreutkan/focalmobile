import React, { useMemo } from "react";
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import CardComponent from "@/src/components/Cards/cardComponent";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShowImageProps {
  selectedImages: string[];
  handleCancel: () => void;
  handleGoodToGo: () => void;
  onAddMore: () => void;
  onRemoveImage: (index: number) => void;
}

export function ShowImage({ 
  selectedImages, 
  handleCancel, 
  handleGoodToGo, 
  onAddMore,
  onRemoveImage 
}: ShowImageProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getStyles(theme, insets), [theme, insets]);

  if (selectedImages.length === 0) return null;

  return (
    <View style={styles.overlay}>
      {/* Immersive Backdrop */}
      <View style={styles.backdrop}>
        {selectedImages[0] && (
          <Image 
            source={{ uri: selectedImages[0] }} 
            style={StyleSheet.absoluteFill} 
            blurRadius={50}
          />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background, opacity: isDark ? 0.8 : 0.6 }]} />
      </View>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>PREVIEW</Text>
            <Text style={styles.headerSubtitle}>{selectedImages.length} OF 5 SLOTS USED</Text>
          </View>
          <View style={{ width: 44 }} /> 
        </View>

        {/* Image Paging */}
        <View style={styles.carouselContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            snapToInterval={SCREEN_WIDTH - theme.spacing.md * 2}
            decelerationRate="fast"
          >
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageCard}>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  
                  {/* Floating Controls on Image */}
                  <TouchableOpacity 
                    style={styles.removeBadge}
                    onPress={() => onRemoveImage(index)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash" size={20} color="#FFF" />
                  </TouchableOpacity>

                  <View style={styles.indexBadge}>
                    <Text style={styles.indexBadgeText}>{index + 1}</Text>
                  </View>
                </View>
              </View>
            ))}

            {selectedImages.length < 5 && (
              <View style={styles.imageCard}>
                <TouchableOpacity 
                  style={styles.addMoreCard}
                  onPress={onAddMore}
                  activeOpacity={0.8}
                >
                  <View style={styles.addMoreIconContainer}>
                    <Ionicons name="add" size={48} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.addMoreText}>ADD ANOTHER</Text>
                  <Text style={styles.addMoreSubtext}>Capture a different angle or label</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.retakeButton} 
              onPress={onAddMore}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-reverse" size={24} color={theme.colors.textSecondary} />
              <Text style={styles.retakeText}>ADD MORE</Text>
            </TouchableOpacity>

            <CardComponent
              width={SCREEN_WIDTH * 0.6}
              height={64}
              backgroundColor={theme.card.dailySummary}
              onPress={handleGoodToGo}
              showShadow={true}
            >
              <View style={styles.goButtonContent}>
                <Text style={styles.goButtonText}>ANALYZE FOOD</Text>
                <Ionicons name="sparkles" size={24} color={theme.colors.text} />
              </View>
            </CardComponent>
          </View>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme: Theme, insets: any) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    paddingTop: insets.top + theme.spacing.md,
    paddingBottom: insets.bottom + theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginTop: theme.spacing.xxs,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  imageCard: {
    width: SCREEN_WIDTH - theme.spacing.md * 2,
    height: SCREEN_HEIGHT * 0.5,
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
  },
  imageWrapper: {
    flex: 1,
    borderRadius: theme.borderRadius['2xl'],
    borderWidth: 4,
    borderColor: theme.colors.text,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  indexBadge: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexBadgeText: {
    color: theme.colors.surface,
    fontWeight: '900',
    fontSize: 16,
  },
  addMoreCard: {
    flex: 1,
    borderRadius: theme.borderRadius['2xl'],
    borderWidth: 4,
    borderColor: theme.colors.text,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  addMoreIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addMoreText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  addMoreSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
  },
  retakeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  goButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  goButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
});