import React from "react";
import { View, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native";
import { theme } from "@/src/theme";

import { Ionicons } from "@expo/vector-icons";

interface ShowImageProps {
  selectedImages: string[];
  handleCancel: () => void;
  handleGoodToGo: () => void;
  onAddMore: () => void;
}

export function ShowImage({ selectedImages, handleCancel, handleGoodToGo, onAddMore }: ShowImageProps) {
  console.log('ShowImage rendered, selectedImages:', selectedImages.length);
  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri }}
                  style={styles.previewImage}
                />
                {selectedImages.length > 0 && (
                  <View style={styles.imageCount}>
                    <Text style={styles.imageCountText}>{index + 1} / {selectedImages.length + (selectedImages.length < 5 ? 1 : 0)}</Text>
                  </View>
                )}
              </View>
            ))}

            {selectedImages.length < 5 && (
              <View style={styles.imageWrapper}>
                <TouchableOpacity 
                  style={styles.addMoreButton}
                  onPress={onAddMore}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={64} color={theme.colors.text} />
                  <Text style={styles.addMoreText}>ADD PHOTO</Text>
                  <Text style={styles.addMoreSubtext}>{selectedImages.length} / 5 used</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <Text style={styles.modalQuestion}>READY TO ANALYZE?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>RETAKE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleGoodToGo}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>LET'S GO!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.text,
  },
  imageScroll: {
    width: '100%',
    height: 300,
    marginBottom: theme.spacing.lg,
  },
  imageWrapper: {
    width: 336,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
  },
  addMoreButton: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  addMoreText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  addMoreSubtext: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  imageCount: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  imageCountText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  modalQuestion: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    letterSpacing: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.text,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
  },
  confirmButton: {
    backgroundColor: '#4ecdc4',
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  confirmButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
});