import React from "react";
import { Redirect, Stack } from "expo-router";
import ModelLoadingSplash from "@/src/components/ModelLoadingSplash";
import { ModelContext, ModelContextType } from "@/src/contexts/ModelContext";
import { Models } from "@/src/constants";

const mockValue: ModelContextType = {
  status: "downloading",
  mainModelReady: false,
  mmprojModelReady: false,
  downloadProgress: 42,
  downloadMessage: "Downloading models...",
  error: null,
  totalSize: Models.main.size + Models.mmproj.size,
  downloadedSize: 0,
  dismissedToday: false,
  checkModelStatus: async () => {},
  startDownload: async () => {},
  dismissForToday: async () => {},
  isModelReady: false,
};

export default function DevModelLoadingSplash() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return (
    <ModelContext.Provider value={mockValue}>
      <Stack.Screen options={{ headerShown: false }} />
      <ModelLoadingSplash />
    </ModelContext.Provider>
  );
}
