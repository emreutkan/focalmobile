import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
// Using simple translucent background instead of blur
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BreakdownItem {
  name: string;
  value: number;
  time: string;
}

interface MacroBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  total: number;
  unit: string;
  items: BreakdownItem[];
  headerColor: string;
  circleColor: string;
  progressColor: string;
}

export default function MacroBreakdownModal({
  visible,
  onClose,
  title,
  total,
  unit,
  items,
  headerColor,
  circleColor,
  progressColor,
}: MacroBreakdownModalProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const blurIntensity = useSharedValue(50);


  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        stiffness: 100,
        damping: 15,
        mass: 0.5,
        velocity: 0,
        overshootClamping: true,
      });
      blurIntensity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: 1,
      });
      blurIntensity.value = withTiming(0, { duration: 500 });

    }

  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      // Reanimated handles string interpolation on the UI thread automatically
      backgroundColor: `rgba(0, 0, 0, ${blurIntensity.value})`,
    };
  });

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
<Animated.View
        style={[styles.blurOverlay, overlayStyle]}
      />

        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: headerColor }]}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.totalText}>
                Total: {Math.round(total)}{unit}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
              >
                {items.map((item, index) => {
                  const progress = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                  return (
                    <View key={index} style={styles.itemCard}>
                      <View style={[styles.circle, { backgroundColor: circleColor }]}>
                        <Text style={styles.circleText}>{Math.round(item.value)}</Text>
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemTime}>{item.time}</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${progress}%`, backgroundColor: progressColor },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,

  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    borderColor: theme.colors.text,
    maxHeight: SCREEN_HEIGHT * 0.8,
    minHeight: SCREEN_HEIGHT * 0.4,

  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  totalText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.text,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  circleText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemTime: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.textSecondary,
  },
  progressBarContainer: {
    width: 80,
    marginLeft: theme.spacing.sm,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
