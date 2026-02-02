import { initLlama, LlamaContext } from "llama.rn";
import { Models } from "../../constants";
import RNFS from "react-native-fs";
import { downloadModel } from "./modelDownloader";

let llamaContext: LlamaContext | null = null;

export const initializeModel = async (model: typeof Models.main, onProgress?: (message: string, progress: number) => void) => {
  try {
    if (llamaContext) {
      return llamaContext;
    }
    onProgress?.('Downloading main model...', 0);
    const modelPath = await downloadModel(Models.main, (p) => onProgress?.('Downloading main model...', p * 0.7));
    
    llamaContext = await initLlama({
      model: modelPath,
      n_ctx: 2048,
      n_gpu_layers: 99, // max layers for GPU metal acceleration on IOS
      use_mlock: true,
      use_mmap: true,
    });
    console.log('Model initialized successfully');
    return llamaContext;
  } catch (error) {
    console.error('Error initializing model:', error);
    throw error;
  }
}