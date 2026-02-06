import React from "react";
import AuthScreen from "@/src/screens/Auth";
import { useRouter } from "expo-router";

export default function Auth() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.replace("/");
  };

  return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
}
