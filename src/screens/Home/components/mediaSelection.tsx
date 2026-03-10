import React, { useCallback, useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Modal } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import CardComponent from "@/src/components/Cards/cardComponent";



interface MediaSelectionProps {
  setSelectedImages: (images: string[]) => void;
  cameraPermission: boolean | null;
  galleryPermission: boolean | null;
  setCameraPermission: (permission: boolean) => void;
  setGalleryPermission: (permission: boolean) => void;
  setShowPermissionModal: (show: boolean) => void;
  setShowMediaSelection: (show: boolean) => void;
  setPermissionType: (type: 'camera' | 'gallery' | 'both' | 'none') => void;
  compact?: boolean;
}

export function MediaSelection({ 
  setSelectedImages, 
  cameraPermission, 
  galleryPermission, 
  setCameraPermission, 
  setGalleryPermission, 
  setShowPermissionModal, 
  setShowMediaSelection, 
  setPermissionType,
  compact = false
}: MediaSelectionProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

    const handleGallerySelect = useCallback(async () => {

      try {
        const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (!currentPermission.granted) {
          if (currentPermission.canAskAgain) {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              setGalleryPermission(false);
              setPermissionType('gallery');
              setShowMediaSelection(false);
              setShowPermissionModal(true);
              return;
            }
            setGalleryPermission(true);
          } else {
            setGalleryPermission(false);
            setPermissionType('gallery');
            setShowMediaSelection(false);
            setShowPermissionModal(true);
            return;
          }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 1,
          allowsMultipleSelection: true,
          selectionLimit: 5,
        });

        if (!result.canceled && result.assets.length > 0) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedImages(result.assets.map(asset => asset.uri));
        }
      } catch (error) {
        console.error('Error with gallery:', error);
      }
    }, [setSelectedImages, setGalleryPermission, setPermissionType, setShowMediaSelection, setShowPermissionModal]);

    const handleCameraSelect = useCallback(async () => {

      try {
        const currentPermission = await ImagePicker.getCameraPermissionsAsync();

        if (!currentPermission.granted) {
          if (currentPermission.canAskAgain) {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              setCameraPermission(false);
              setPermissionType('camera');
              setShowMediaSelection(false);
              setShowPermissionModal(true);
              return;
            }
            setCameraPermission(true);
          } else {
            setCameraPermission(false);
            setPermissionType('camera');
            setShowMediaSelection(false);
            setShowPermissionModal(true);
            return;
          }
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedImages([result.assets[0].uri]);
        }
      } catch (error) {
        console.error('Error with camera:', error);
      }
    }, [setSelectedImages, setCameraPermission, setPermissionType, setShowMediaSelection, setShowPermissionModal]);

  return (
  
    <Modal
    transparent={true}
    animationType="fade"
    onRequestClose={() => setShowMediaSelection(false)}
  >
    <View style={styles.modalContainer}>
      <View style={[styles.pickerModalContent, compact && styles.compactModalContent]}>
        {!compact && (
          <>
            <Text style={styles.pickerTitle}>SCAN YOUR FOOD</Text>
            <Text style={styles.pickerSubtitle}>Choose how to capture</Text>
          </>
        )}

        <View style={[styles.pickerOptions, compact && styles.compactPickerOptions]}>
          <View style={styles.pickerOption}>
            <CardComponent
              height={compact ? 70 : 100}
              width={compact ? 80 : 120}
              backgroundColor={cameraPermission === false ? theme.colors.surface : '#4ecdc4'}
              onPress={handleCameraSelect}
              showShadow={true}
              showBorder={true}
            >
              <View style={styles.pickerIconContent}>
                <Ionicons
                  name={cameraPermission === false ? "camera-outline" : "camera"}
                  size={compact ? 28 : 40}
                  color={cameraPermission === false ? theme.colors.textTertiary : theme.colors.text}
                />
                {cameraPermission === false && (
                  <View style={[styles.permissionBadge, compact && styles.compactPermissionBadge]}>
                    <Ionicons name="lock-closed" size={10} color="#fff" />
                  </View>
                )}
              </View>
            </CardComponent>
            {!compact && <Text style={[
              styles.pickerOptionText,
              cameraPermission === false && styles.pickerOptionTextDisabled
            ]}>CAMERA</Text>}
          </View>

          <View style={styles.pickerOption}>
            <CardComponent
              height={compact ? 70 : 100}
              width={compact ? 80 : 120}
              backgroundColor={galleryPermission === false ? theme.colors.surface : '#FFE66D'}
              onPress={handleGallerySelect}
              showShadow={true}
              showBorder={true}
            >
              <View style={styles.pickerIconContent}>
                <Ionicons
                  name={galleryPermission === false ? "images-outline" : "images"}
                  size={compact ? 28 : 40}
                  color={galleryPermission === false ? theme.colors.textTertiary : theme.colors.text}
                />
                {galleryPermission === false && (
                  <View style={[styles.permissionBadge, compact && styles.compactPermissionBadge]}>
                    <Ionicons name="lock-closed" size={10} color="#fff" />
                  </View>
                )}
              </View>
            </CardComponent>
            {!compact && <Text style={[
              styles.pickerOptionText,
              galleryPermission === false && styles.pickerOptionTextDisabled
            ]}>GALLERY</Text>}
          </View>
        </View>

        <TouchableOpacity
          style={compact ? styles.compactCancelButton : styles.pickerCancelButton}
          onPress={() => setShowMediaSelection(false)}
        >
          <Text style={styles.pickerCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
  )
};

const getStyles = (theme: Theme) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  pickerModalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  compactModalContent: {
    padding: theme.spacing.lg,
    maxWidth: 240,
  },
  pickerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    letterSpacing: 1,
  },
  pickerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  pickerOptions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  compactPickerOptions: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  pickerOption: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pickerIconContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  pickerCancelButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  compactCancelButton: {
    paddingVertical: theme.spacing.sm,
  },
  pickerCancelText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  pickerOptionTextDisabled: {
    color: theme.colors.textTertiary,
  },
  permissionBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  compactPermissionBadge: {
    width: 18,
    height: 18,
    top: -4,
    right: -4,
  }
});