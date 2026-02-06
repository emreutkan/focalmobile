import { initLlama, LlamaContext } from "llama.rn";
import { Models } from "../../constants";
import RNFS from "react-native-fs";
import { downloadModel } from "./modelDownloader";

let llamaContext: LlamaContext | null = null;
let multimodalInitialized = false;
let initializationPromise: Promise<LlamaContext> | null = null;

export const initializeModel = async (model: typeof Models.main, onProgress?: (message: string, progress: number) => void) => {
  // Return existing context if fully initialized
  if (llamaContext && multimodalInitialized) {
    return llamaContext;
  }

  // If initialization is already in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization and store the promise
  initializationPromise = doInitializeModel(model, onProgress);

  try {
    return await initializationPromise;
  } finally {
    initializationPromise = null;
  }
};

const doInitializeModel = async (model: typeof Models.main, onProgress?: (message: string, progress: number) => void) => {
  try {
    if (llamaContext && multimodalInitialized) {
      return llamaContext;
    }
    
    // Initialize base model if not already done
    if (!llamaContext) {
      onProgress?.('Downloading main model...', 0);
      const modelPath = await downloadModel(Models.main, (p) => onProgress?.('Downloading main model...', p * 0.5));
      
      llamaContext = await initLlama({
        model: modelPath,
        n_ctx: 1024,
        n_gpu_layers: 99, // Full Metal GPU acceleration
        use_mlock: true,
        use_mmap: true,
        ctx_shift: false, // Important for multimodal
      });
      console.log('Model initialized successfully');
    }
    
    // Initialize multimodal if not already done
    if (!multimodalInitialized) {
      onProgress?.('Downloading multimodal model...', 50);
      const mmprojPath = await downloadModel(Models.mmproj, (p) => onProgress?.('Downloading multimodal model...', 50 + p * 0.3));
      
      // Verify file exists and is valid
      const fileExists = await RNFS.exists(mmprojPath);
      if (!fileExists) {
        throw new Error(`Multimodal model file not found at: ${mmprojPath}`);
      }
      
      // Get file stats to verify it's complete
      const stats = await RNFS.stat(mmprojPath);
      console.log(`Multimodal model file size: ${stats.size} bytes (expected ~${Models.mmproj.size} bytes)`);
      
      if (stats.size === 0) {
        throw new Error('Multimodal model file is empty');
      }
      
      // Verify file is at least 80% of expected size (allow some variance)
      const minExpectedSize = Models.mmproj.size * 0.8;
      if (stats.size < minExpectedSize) {
        throw new Error(`Multimodal model file appears incomplete: ${stats.size} bytes (expected at least ${minExpectedSize} bytes). Please delete the file and try again.`);
      }
      
      onProgress?.('Initializing multimodal support...', 80);
      try {
        const success = await llamaContext.initMultimodal({
          path: mmprojPath,
          use_gpu: true, // Metal GPU acceleration
        });
        
        if (success) {
          multimodalInitialized = true;
          console.log('Multimodal initialized successfully');
          onProgress?.('Ready!', 100);
        } else {
          throw new Error('initMultimodal returned false - the mmproj file may be corrupted or incompatible');
        }
      } catch (mmError: any) {
        console.error('initMultimodal error details:', mmError);
        throw new Error(`Failed to initialize multimodal: ${mmError.message || mmError}`);
      }
    }
    
    return llamaContext;
  } catch (error: any) {
    console.error('Error initializing model:', error);
    // Reset state on failure so next attempt starts fresh
    llamaContext = null;
    multimodalInitialized = false;
    throw error;
  }
};