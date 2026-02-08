import { View, Image, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { theme } from "@/src/theme";
import { StyleSheet } from "react-native";



interface ShowImageProps {
  selectedImage: string | null;
  handleCancel: () => void;
  handleGoodToGo: () => void;
}
export function ShowImage({ selectedImage, handleCancel, handleGoodToGo }: ShowImageProps) {
  console.log('ShowImage rendered, selectedImage:', selectedImage);
  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
            />
          )}
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
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    marginBottom: theme.spacing.lg,
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