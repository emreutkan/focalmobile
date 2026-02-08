import RNFS from 'react-native-fs';
import { Models } from '../../constants';

export const downloadModel = async (
  model: typeof Models.main | typeof Models.mmproj,
  onProgress?: (progress: number) => void
) => {
  const localPath = `${RNFS.DocumentDirectoryPath}/${model.name}`;
  const exists = await RNFS.exists(localPath);

  if (exists) {
    // Verify existing file is valid (not too small)
    const stats = await RNFS.stat(localPath);
    const minSize = model.size * 0.9; // At least 90% of expected size (allow some variance)
    if (stats.size < minSize) {
      console.log(`Existing file ${model.name} is too small (${stats.size} bytes, expected ~${model.size} bytes), re-downloading...`);
      await RNFS.unlink(localPath);
    } else {
      console.log(`Model ${model.name} already exists (${stats.size} bytes)`);
      return localPath;
    }
  }

  let lastBytesWritten = 0;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      console.log(`Downloading ${model.name} from ${model.url}... (attempt ${retryCount + 1}/${maxRetries})`);

      // Clean up any partial download
      const exists = await RNFS.exists(localPath);
      if (exists) {
        await RNFS.unlink(localPath).catch(() => {});
      }

      const result = await RNFS.downloadFile({
        fromUrl: model.url,
        toFile: localPath,
        progressInterval: 500, // More frequent updates
        progress: (res) => {
          // Use actual bytes written for progress if we don't know total size
          const progressPercent = model.size > 0
            ? Math.min(100, (res.bytesWritten / model.size) * 100)
            : 0;
          console.log(`${model.name}: ${progressPercent.toFixed(1)}% (${res.bytesWritten} bytes)`);
          onProgress?.(progressPercent);
          lastBytesWritten = res.bytesWritten;
        }
      }).promise;

      if (result.statusCode === 200) {
        // Wait a bit to ensure file is fully written
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify downloaded file size
        const stats = await RNFS.stat(localPath);
        console.log(`Downloaded ${model.name}: ${stats.size} bytes (expected ~${model.size} bytes)`);

        // Check if download completed (file should be close to expected size)
        const sizeDifference = Math.abs(stats.size - model.size);
        const sizeVariance = model.size * 0.1; // Allow 10% variance

        if (stats.size < model.size * 0.5) {
          // File is less than 50% of expected size - definitely incomplete
          await RNFS.unlink(localPath);
          throw new Error(`Download incomplete: file is ${stats.size} bytes, expected ~${model.size} bytes`);
        }

        // Check if file appears to be HTML (error page)
        try {
          const fileContent = await RNFS.readFile(localPath, 100); // Read first 100 bytes
          if (fileContent.startsWith('<') || fileContent.startsWith('<!') || fileContent.includes('<html')) {
            await RNFS.unlink(localPath);
            throw new Error('Downloaded file appears to be HTML (error page), not a model file');
          }
        } catch (readError) {
          // If we can't read the file, it might be corrupted
          console.warn('Could not verify file content:', readError);
        }

        // If file size is reasonable, consider it successful
        if (stats.size >= model.size * 0.5) {
          console.log(`Downloaded ${model.name} successfully (${stats.size} bytes)`);
          return localPath;
        } else {
          throw new Error(`File size mismatch: got ${stats.size} bytes, expected ~${model.size} bytes`);
        }
      } else {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }
    } catch (error: any) {
      retryCount++;
      console.error(`Error downloading ${model.name} (attempt ${retryCount}/${maxRetries}):`, error);

      // Clean up on error
      const exists = await RNFS.exists(localPath);
      if (exists) {
        await RNFS.unlink(localPath).catch(() => {});
      }

      if (retryCount >= maxRetries) {
        throw new Error(`Failed to download ${model.name} after ${maxRetries} attempts: ${error.message || error}`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
    }
  }

  throw new Error(`Failed to download ${model.name} after ${maxRetries} attempts`);
};
