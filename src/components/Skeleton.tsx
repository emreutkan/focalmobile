import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const Skeleton = ({ width, height, borderRadius, style }: SkeletonProps) => {
  const { theme, isDark } = useTheme();
  const translateX = React.useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  const skeletonColor = isDark ? theme.colors.card : theme.colors.divider;
  const highlightColor = isDark ? theme.colors.border : theme.colors.background;

  return (
    <View
      style={[
        styles.container,
        {
          width: width || '100%',
          height: height || 20,
          borderRadius: borderRadius ?? theme.borderRadius.md,
          backgroundColor: skeletonColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={[skeletonColor, highlightColor, skeletonColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-1000, 1000], // Increased for wider skeletons
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
