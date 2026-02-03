import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../theme";
import { useModel } from "../contexts/ModelContext";
import CardComponent from "./Cards/cardComponent";
const { width: screenWidth } = Dimensions.get("window");

const BG_IMAGE = require("../../assets/focal.png");

export default function ModelLoadingSplash() {
  const {
    status,
    downloadMessage,
    startDownload,
    checkModelStatus,
    error,
    isModelReady,
  } = useModel();

  const [visible, setVisible] = useState(true);
  const [showDownloadCta, setShowDownloadCta] = useState(false);
  const [runPressAnimation, setRunPressAnimation] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const overlayTranslateX = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const dismissing = useRef(false);

  const showSplash = useMemo(() => {
    if (!visible) return false;
    if (status === "not_downloaded" || status === "error") return false;
    return true;
  }, [status, visible]);

  const message = useMemo(() => {
    if (status === "checking") return "Checking model status...";
    if (status === "downloading") return downloadMessage || "Downloading models...";
    if (status === "initializing") return downloadMessage || "Loading models...";
    if (status === "error") return error || "Something went wrong.";
    if (status === "not_downloaded") return "Models are required to analyze your food.";
    return "Loading...";
  }, [status, downloadMessage, error]);

  useEffect(() => {
    if (!showSplash) return;
    const isLoadingPhase =
      status === "checking" || status === "downloading" || status === "initializing";
    setShowDownloadCta(status === "not_downloaded");

    progress.stopAnimation();
    progress.setValue(0);
    if (isLoadingPhase) {
      Animated.timing(progress, {
        toValue: 0.8,
        duration: 1100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  }, [showSplash, status, progress]);

  useEffect(() => {
    if (!showSplash || dismissing.current) return;
    if (!isModelReady) return;

    dismissing.current = true;
    setRunPressAnimation(true);

    const click = Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.96,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const fill = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    Animated.parallel([click, fill]).start(() => {
      Animated.timing(overlayTranslateX, {
        toValue: -screenWidth,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
      });
    });
  }, [isModelReady, showSplash, progress, overlayTranslateX, cardScale, runPressAnimation]);

  if (!showSplash) return null;

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
    style={[styles.container]}
      pointerEvents="none"
    >
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
            backgroundColor={'#fed086'}
            borderRadius={theme.borderRadius.xl}
             padding={theme.spacing.xl}  
              onPress={checkModelStatus} >
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
    backgroundColor: '#fed086',
    paddingHorizontal: theme.spacing.xl,
  },
});
