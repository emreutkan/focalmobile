import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { theme } from "../../theme";
import * as Haptics from "expo-haptics";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const OFFSET = 4;

interface CardComponentProps {
  height?: number | SharedValue<number>;
  width?: number | SharedValue<number>;
  children: React.ReactNode;
  onPress?: () => void;
  containerAnimatedStyle?: any; // Custom animated style for the card container
  borderAnimatedStyle?: any; // Custom animated style for the border
  shadowAnimatedStyle?: any; // Custom animated style for the shadow
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  showBorder?: boolean;
  showShadow?: boolean;
}

export default function CardComponent({
  height,
  width,
  children,
  onPress,
  containerAnimatedStyle,
  borderAnimatedStyle,
  shadowAnimatedStyle,
  backgroundColor = theme.card.dailySummary,
  borderRadius = theme.borderRadius.lg,
  padding = theme.spacing.sm,
  showBorder = true,
  showShadow = true,
}: CardComponentProps) {
  // Shared tap animation values (same across all cards)
  const translate = useSharedValue(0);
  const borderOpacity = useSharedValue(1);

  // Tap animation style (shared across all cards)
  const tapAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translate.value },
        { translateY: translate.value },
      ],
    };
  });

  // Border opacity animation (shared across all cards)
  const borderOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: borderOpacity.value,
    };
  });

  // Shared tap handlers
  const pressIn = () => {
    translate.value = withTiming(OFFSET, { duration: 90 });
    borderOpacity.value = withTiming(0, { duration: 60 });
    // Haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const pressOut = () => {
    translate.value = withTiming(0, { duration: 140 });
    borderOpacity.value = withTiming(1, { duration: 100 });
  };

  // Base container style with height/width
  const baseContainerStyle = useAnimatedStyle(() => {
    const baseStyle: any = {
      backgroundColor,
      borderRadius,
      padding,
      overflow: "hidden",
    };

    if (height !== undefined) {
      baseStyle.height = typeof height === "number" ? height : height.value;
    }
    if (width !== undefined) {
      baseStyle.width = typeof width === "number" ? width : width.value;
    }

    return baseStyle;
  });

  // Default shadow style if no custom shadowAnimatedStyle provided
  const defaultShadowStyle = useAnimatedStyle(() => {
    if (shadowAnimatedStyle) return {};
    const cardWidth = typeof width === "number" ? width : width?.value || 0;
    const cardHeight = typeof height === "number" ? height : height?.value || 0;
    return {
      opacity: 1,
      width: cardWidth,
      height: cardHeight,
      left: OFFSET,
      top: OFFSET,
    };
  });

  return (
    <View style={styles.outerContainer}>
      {showShadow && (
        <Animated.View 
          style={[
            styles.shadow, 
            { borderRadius },
            shadowAnimatedStyle || defaultShadowStyle
          ]} 
        />
      )}

      <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
        <Animated.View style={[styles.card, baseContainerStyle, containerAnimatedStyle, tapAnimatedStyle]}>
          {showBorder && (
            <Animated.View
              style={[
                styles.border,
                { borderRadius, borderColor: "black", borderWidth: 4 },
                borderAnimatedStyle,
                borderOpacityStyle,
              ]}
            />
          )}
          {children}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "relative",
  },
  card: {
    justifyContent: "center",
  },
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shadow: {
    position: "absolute",
    backgroundColor: "black",
  },
});
