import React from "react";
import HomeScreen from "@/src/screens/Home";
import { AuthProvider } from "../contexts/AuthContext";

export default function Index() {
  return (
    <AuthProvider>
      <HomeScreen />
    </AuthProvider>
  )
  
}         