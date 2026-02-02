import RNFS from 'react-native-fs';
import { initLlama, LlamaContext } from 'llama.rn';
import { Models } from '../../constants';


export const downloadModel = async (model: typeof Models.main, onProgress?: (progress: number) => void) => {
  const localPath = `${RNFS.DocumentDirectoryPath}/${model.name}`;
  const exists = await RNFS.exists(localPath);
  
  if (exists) {
    console.log(`Model ${model.name} already exists`);
    return localPath;
  }
  
  try {
    console.log(`Downloading ${model.name}...`);
    
    const result = await RNFS.downloadFile({
      fromUrl: model.url,
      toFile: localPath,
      progressInterval: 1000,
      progress: (res) => {
        const progress = (res.bytesWritten / model.size) * 100;
        console.log(`${model.name}: ${progress.toFixed(1)}%`);
        onProgress?.(progress);
      }
    }).promise;
    
    if (result.statusCode === 200) {
      console.log(`Downloaded ${model.name} successfully`);
      return localPath;
    } else {
      throw new Error(`Download failed with status ${result.statusCode}`);
    }
  } catch (error) {
    console.error(`Error downloading ${model.name}:`, error);
    throw error;
  }
};