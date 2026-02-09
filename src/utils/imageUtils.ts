import * as FileSystem from 'expo-file-system/legacy';
/**
 * Convert image file to base64
 */
export async function imageToBase64(imagePath: string): Promise<string> {
  const uri = imagePath.startsWith('file://')
    ? imagePath
    : `file://${imagePath}`;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
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
