import RNFS from "react-native-fs";
/**
 * Convert image file to base64
 */
export async function imageToBase64(imagePath: string): Promise<string> {
  // Remove file:// prefix if present
  const cleanPath = imagePath.replace('file://', '');

  // Read file as base64

  const base64 = await RNFS.readFile(cleanPath, 'base64');
  return base64;
}

/**
 * Detect image mime type from file extension
 */
export function getImageMimeType(imagePath: string): string {
  const extension = imagePath.toLowerCase().split('.').pop();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

