import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import RNFS from 'react-native-fs';
import { Models } from '../constants';

export type ModelStatus = 'checking' | 'not_downloaded' | 'downloaded' | 'downloading' | 'initializing' | 'ready' | 'error';

// Simple file-based storage for dismissed date
const DISMISSED_FILE = `${RNFS.DocumentDirectoryPath}/modal_dismissed_date.txt`;

interface ModelState {
  status: ModelStatus;
  mainModelReady: boolean;
  mmprojModelReady: boolean;
  downloadProgress: number;
  downloadMessage: string;
  error: string | null;
  totalSize: number;
  downloadedSize: number;
  dismissedToday: boolean;
}

export interface ModelContextType extends ModelState {
  checkModelStatus: () => Promise<void>;
  startDownload: () => Promise<void>;
  dismissForToday: () => Promise<void>;
  initializeModelForAnalysis: () => Promise<boolean>;
  isModelReady: boolean;
  isModelDownloaded: boolean;
}

export const ModelContext = createContext<ModelContextType | null>(null);

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ModelState>({
    status: 'checking',
    mainModelReady: false,
    mmprojModelReady: false,
    downloadProgress: 0,
    downloadMessage: '',
    error: null,
    totalSize: Models.main.size + Models.mmproj.size,
    downloadedSize: 0,
    dismissedToday: false,
  });

  const appState = useRef(AppState.currentState);
  const isChecking = useRef(false);

  // Check if dismissed today on mount
  useEffect(() => {
    const checkDismissed = async () => {
      try {
        const exists = await RNFS.exists(DISMISSED_FILE);
        if (exists) {
          const dismissedDate = await RNFS.readFile(DISMISSED_FILE, 'utf8');
          if (dismissedDate.trim() === new Date().toDateString()) {
            setState(prev => ({ ...prev, dismissedToday: true }));
          }
        }
      } catch (e) {
        console.log('Error checking dismissed status:', e);
      }
    };
    checkDismissed();
  }, []);

  const dismissForToday = useCallback(async () => {
    try {
      await RNFS.writeFile(DISMISSED_FILE, new Date().toDateString(), 'utf8');
      setState(prev => ({ ...prev, dismissedToday: true }));
    } catch (e) {
      console.log('Error saving dismissed status:', e);
    }
  }, []);

  /**
   * Check if model FILES are downloaded (no initialization!)
   * This is fast and doesn't cause lag or heat
   */
  const checkModelStatus = useCallback(async () => {
    if (isChecking.current) return;
    isChecking.current = true;

    try {
      setState(prev => ({ ...prev, status: 'checking', error: null }));

      const mainModelPath = `${RNFS.DocumentDirectoryPath}/${Models.main.name}`;
      const mmprojModelPath = `${RNFS.DocumentDirectoryPath}/${Models.mmproj.name}`;

      const [mainExists, mmprojExists] = await Promise.all([
        RNFS.exists(mainModelPath),
        RNFS.exists(mmprojModelPath),
      ]);

      let mainReady = false;
      let mmprojReady = false;
      let downloadedSize = 0;

      if (mainExists) {
        const stats = await RNFS.stat(mainModelPath);
        mainReady = stats.size >= Models.main.size * 0.9;
        if (mainReady) downloadedSize += stats.size;
      }

      if (mmprojExists) {
        const stats = await RNFS.stat(mmprojModelPath);
        mmprojReady = stats.size >= Models.mmproj.size * 0.9;
        if (mmprojReady) downloadedSize += stats.size;
      }

      const filesDownloaded = mainReady && mmprojReady;

      // Just check if files exist - DON'T initialize here!
      // This prevents lag and heat on app start
      setState(prev => ({
        ...prev,
        status: filesDownloaded ? 'downloaded' : 'not_downloaded',
        mainModelReady: mainReady,
        mmprojModelReady: mmprojReady,
        downloadedSize,
        downloadProgress: filesDownloaded ? 100 : (downloadedSize / prev.totalSize) * 100,
      }));
    } catch (error: any) {
      console.error('Error checking model status:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to check model status',
      }));
    } finally {
      isChecking.current = false;
    }
  }, []);

  /**
   * Initialize model ONLY when user clicks analyze
   * Called from ImageAnalyzer screen
   */
  const initializeModelForAnalysis = useCallback(async (): Promise<boolean> => {
    // If already ready, return true immediately
    if (state.status === 'ready') {
      return true;
    }

    // If models aren't downloaded, can't initialize
    if (state.status !== 'downloaded') {
      console.log('Models not downloaded, cannot initialize');
      return false;
    }

    try {
      setState(prev => ({
        ...prev,
        status: 'initializing',
        downloadMessage: 'Waking up the AI...',
      }));

      const { initializeModel } = await import('../utils/ModelManagement/modelInitializer');
      await initializeModel(Models.main, (message) => {
        setState(prev => ({
          ...prev,
          downloadMessage: message,
        }));
      });

      setState(prev => ({
        ...prev,
        status: 'ready',
        downloadMessage: 'Ready!',
      }));

      return true;
    } catch (initError: any) {
      console.error('Error initializing model:', initError);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: initError.message || 'Failed to initialize AI',
      }));
      return false;
    }
  }, [state.status]);

  const startDownload = useCallback(async () => {
    const { downloadModel } = await import('../utils/ModelManagement/modelDownloader');

    setState(prev => ({
      ...prev,
      status: 'downloading',
      error: null,
      downloadProgress: 0,
      downloadMessage: 'Preparing download...',
    }));

    try {
      // Download main model
      setState(prev => ({ ...prev, downloadMessage: 'Downloading AI model (2.3GB)...' }));
      await downloadModel(Models.main, (progress) => {
        setState(prev => ({
          ...prev,
          downloadProgress: progress * 0.7,
          downloadMessage: `Downloading AI model... ${progress.toFixed(0)}%`,
        }));
      });
      setState(prev => ({ ...prev, mainModelReady: true }));

      // Download mmproj model
      setState(prev => ({ ...prev, downloadMessage: 'Downloading vision model (600MB)...' }));
      await downloadModel(Models.mmproj, (progress) => {
        setState(prev => ({
          ...prev,
          downloadProgress: 70 + progress * 0.3,
          downloadMessage: `Downloading vision model... ${progress.toFixed(0)}%`,
        }));
      });
      setState(prev => ({ ...prev, mmprojModelReady: true }));

      // Mark as downloaded but NOT initialized
      // Initialization happens when user clicks analyze
      setState(prev => ({
        ...prev,
        status: 'downloaded',
        downloadProgress: 100,
        downloadMessage: 'Download complete!',
      }));
    } catch (error: any) {
      console.error('Error downloading models:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to download models',
      }));
    }
  }, []);

  // Check model status on mount (fast file check only)
  useEffect(() => {
    checkModelStatus();
  }, [checkModelStatus]);

  // Check model status when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App came to foreground, checking model status...');
        checkModelStatus();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [checkModelStatus]);

  const value: ModelContextType = {
    ...state,
    checkModelStatus,
    startDownload,
    dismissForToday,
    initializeModelForAnalysis,
    isModelReady: state.status === 'ready',
    isModelDownloaded: state.status === 'downloaded' || state.status === 'ready',
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};
