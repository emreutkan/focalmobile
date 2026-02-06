import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Modal } from "react-native";
import { theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";

interface MediaPermissionProps {
  showPermissionModal: boolean;
  setShowPermissionModal: (show: boolean) => void;
  permissionType: 'camera' | 'gallery' | 'both' | 'none';
}
export  function MediaPermission({ showPermissionModal, setShowPermissionModal, permissionType }: MediaPermissionProps) {
  const openSettings = useCallback(() => {
    Linking.openSettings();
    setShowPermissionModal(false);
  }, []);
  
  
  return (
    <Modal
    transparent={true}
    animationType="fade"
  >
    <View style={styles.modalContainer}>
      <View style={styles.permissionModalContent}>
        <Text style={styles.permissionEmoji}>
          {permissionType === 'camera' ? '📸' : permissionType === 'gallery' ? '🖼️' : '🙈'}
        </Text>
        <Text style={styles.permissionTitle}>
          {permissionType === 'both' ? 'OOPS!' : permissionType === 'none' ? 'OOPS!' : 'NEED ACCESS!'}
        </Text>
        <Text style={styles.permissionMessage}>
          {permissionType === 'camera'
            ? "We can't use your camera without permission. Let's fix that in settings!"
            : permissionType === 'gallery' ? "We can't see your photos without permission. A quick trip to settings will sort this out!" : permissionType === 'none' ? "We need camera or photo access to scan your food. Let's set things up!" : "We need camera or photo access to scan your food. Let's set things up!"}
        </Text>



        <TouchableOpacity
          style={styles.settingsButton}
          onPress={openSettings}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          <Text style={styles.settingsButtonText}>OPEN SETTINGS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.permissionCancelButton}
          onPress={() => setShowPermissionModal(false)}
        >
          <Text style={styles.permissionCancelText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  permissionCancelButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  permissionCancelText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textTertiary,
  },
  permissionModalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.text,
  },
  permissionEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  permissionTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: 1,
  },
  permissionMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  permissionInfoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  settingsButton: {
    width: '100%',
    backgroundColor: '#4ecdc4',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  settingsButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
});