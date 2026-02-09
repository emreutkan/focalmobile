import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_DIMENSION = 1024;

/**
 * Resize image to max 1024px on longest side, compress to JPEG 0.8, then return base64
 */
export async function imageToBase64(imagePath: string): Promise<string> {
  const uri = imagePath.startsWith('file://')
    ? imagePath
    : `file://${imagePath}`;

  const compressed = await manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: 0.8, format: SaveFormat.JPEG },
  );

  const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

/**
 * Always returns image/jpeg since imageToBase64 converts to JPEG
 */
export function getImageMimeType(_imagePath: string): string {
  return 'image/jpeg';
}
