import React from "react";
import { Redirect, Stack } from "expo-router";
import LoadingScreen from "@/src/components/LoadingScreen";

export default function DevLoadingScreen() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LoadingScreen
        message="Running a demo loading state."
        showTimer={true}
        onGoPro={() => {}}
      />
    </>
  );
}
