import React from "react";
import { Text, Dimensions } from "react-native";
import { theme } from "../../theme";
import CardComponent from "./cardComponent";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - theme.spacing.md * 2;
const SMALL_CARD_HEIGHT = 80;
const SMALL_CARD_WIDTH = (CARD_WIDTH - theme.spacing.sm * 2) / 3;

export default function ProteinCard() {
  return (
    <CardComponent
      height={SMALL_CARD_HEIGHT}
      width={SMALL_CARD_WIDTH}
      backgroundColor={theme.card.proteinCard}
    >
      <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text }}>
        Protein
      </Text>
    </CardComponent>
  );
}
