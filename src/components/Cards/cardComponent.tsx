import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

const SHADOW_OFFSET = 4;

interface CardComponentProps {
  height?: number | SharedValue<number>;
  width?: number | SharedValue<number>;
  children: React.ReactNode;
  onPress?: () => void;
  containerAnimatedStyle?: any;
  borderAnimatedStyle?: any;
  shadowAnimatedStyle?: any;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  showBorder?: boolean;
  showShadow?: boolean;
  showPressAnimation?: boolean;
}

export default function CardComponent({
  height,
  width,
  children,
  onPress,
  containerAnimatedStyle,
  borderAnimatedStyle,
  shadowAnimatedStyle,
  backgroundColor,
  borderRadius,
  padding,
  showBorder = true,
  showShadow = true,
  showPressAnimation = false,
}: CardComponentProps) {
  const { theme } = useTheme();
  
  // Apply theme defaults
  const finalBackgroundColor = backgroundColor ?? theme.card.dailySummary;
  const finalBorderRadius = borderRadius ?? theme.borderRadius.lg;
  const finalPadding = padding ?? theme.spacing.xs;

  const translate = useSharedValue(0);
  const activeDarken = useSharedValue(0);

  // Isometric movement: move on both X and Y to meet the shadow
  const tapAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translate.value },
        { translateY: translate.value }
      ],
    };
  });

  const darkenOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: activeDarken.value * 0.15, // Subtle darkening on press
    };
  });

  const pressIn = () => {
    // Snap card to shadow position
    translate.value = withTiming(SHADOW_OFFSET, { duration: 80 });
    activeDarken.value = withTiming(1, { duration: 60 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const pressOut = () => {
    // Pop card back up
    translate.value = withTiming(0, { duration: 120 });
    activeDarken.value = withTiming(0, { duration: 100 });
  };

  useEffect(() => {
    if (showPressAnimation) {
      translate.value = withTiming(SHADOW_OFFSET, { duration: 150 });
      activeDarken.value = withTiming(1, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        translate.value = withTiming(0, { duration: 120 });
        activeDarken.value = withTiming(0, { duration: 100 });
      }, 150);
    }
  }, [showPressAnimation]);

  const baseContainerStyle = useAnimatedStyle(() => {
    const baseStyle: any = {
      backgroundColor: finalBackgroundColor,
      borderRadius: finalBorderRadius,
      padding: finalPadding,
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

  const defaultShadowStyle = useAnimatedStyle(() => {
    if (shadowAnimatedStyle) return {};
    const cardWidth = typeof width === "number" ? width : width?.value || 0;
    const cardHeight = typeof height === "number" ? height : height?.value || 0;
    return {
      width: cardWidth,
      height: cardHeight,
      left: SHADOW_OFFSET,
      top: SHADOW_OFFSET,
    };
  });

  return (
    <View style={styles.outerContainer}>
      {showShadow && (
        <Animated.View
          style={[
            styles.shadow,
            { 
              borderRadius: finalBorderRadius, 
              // Use a darker semantic color for that "cool" pop
              backgroundColor: theme.colors.text, 
              opacity: theme.dark ? 0.5 : 1 // Slight transparency in dark mode for OLED
            },
            shadowAnimatedStyle || defaultShadowStyle
          ]}
        />
      )}

      <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
        <Animated.View style={[styles.card, baseContainerStyle, containerAnimatedStyle, tapAnimatedStyle]}>
          <Animated.View style={[styles.activeOverlay, darkenOverlayStyle]} pointerEvents="none" />
          
          {showBorder && (
            <Animated.View
              style={[
                styles.border,
                { 
                  borderRadius: finalBorderRadius, 
                  borderColor: theme.colors.text, 
                  borderWidth: 2 
                },
                borderAnimatedStyle,
              ]}
              pointerEvents="none"
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
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 11,
  },
  shadow: {
    position: "absolute",
  },
});