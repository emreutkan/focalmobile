import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../theme";
import { useModel } from "../contexts/ModelContext";
import CardComponent from "./Cards/cardComponent";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Splash screen shown during initial app load
 * Only shows during fast file checking - NOT during model initialization
 * Model initialization now happens when user clicks analyze
 */
export default function ModelLoadingSplash() {
  const { status } = useModel();

  const [visible, setVisible] = useState(true);
  const [runPressAnimation, setRunPressAnimation] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const overlayTranslateX = useRef(new Animated.Value(0)).current;
  const dismissing = useRef(false);

  // Only show during 'checking' status (fast file check)
  // Don't show during downloading/initializing - those are user-initiated actions
  const showSplash = useMemo(() => {
    if (!visible) return false;
    // Only show for the initial quick check
    return status === "checking";
  }, [status, visible]);

  // Auto-dismiss when done checking
  const isDoneChecking = useMemo(() => {
    return status !== "checking";
  }, [status]);

  useEffect(() => {
    if (!showSplash) return;

    progress.stopAnimation();
    progress.setValue(0);

    // Animate progress during checking
    Animated.timing(progress, {
      toValue: 0.8,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [showSplash, progress]);

  useEffect(() => {
    if (!showSplash || dismissing.current) return;
    if (!isDoneChecking) return;

    dismissing.current = true;
    setRunPressAnimation(true);

    // Complete the progress bar and dismiss
    const fill = Animated.timing(progress, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    fill.start(() => {
      Animated.timing(overlayTranslateX, {
        toValue: -screenWidth,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
      });
    });
  }, [isDoneChecking, showSplash, progress, overlayTranslateX]);

  if (!showSplash) return null;

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.container]} pointerEvents="none">
      <View style={[styles.progressWrap]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>
      <View style={styles.cardContainer}>
        <CardComponent
          showPressAnimation={runPressAnimation}
          height={180}
          width={180}
          backgroundColor={"#fed086"}
          borderRadius={theme.borderRadius.xl}
          padding={theme.spacing.xl}
        >
          <Text style={styles.cardTitle}>focal</Text>
        </CardComponent>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  progressWrap: {
    position: "absolute",
    marginTop: 100,
    left: -5,
    right: -5,
    zIndex: 1000,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize["5xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: "black",
    marginBottom: 32,
  },
  progressTrack: {
    height: 12,
    backgroundColor: "#fed086",
  },
  progressFill: {
    height: "100%",
    borderRadius: 50,
    backgroundColor: "black",
  },
  cardContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#fed086",
    paddingHorizontal: theme.spacing.xl,
  },
});
