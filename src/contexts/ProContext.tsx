import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ProContextType {
  isPro: boolean;
  activatePro: () => void;
  deactivatePro: () => void;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

interface ProProviderProps {
  children: ReactNode;
}

export function ProProvider({ children }: ProProviderProps) {
  // Temporary pro status - resets on app refresh (not persisted)
  const [isPro, setIsPro] = useState(false);

  const activatePro = useCallback(() => {
    setIsPro(true);
    console.log('Pro activated (temporary - will reset on app refresh)');
  }, []);

  const deactivatePro = useCallback(() => {
    setIsPro(false);
    console.log('Pro deactivated');
  }, []);

  return (
    <ProContext.Provider value={{ isPro, activatePro, deactivatePro }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro(): ProContextType {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error('usePro must be used within a ProProvider');
  }
  return context;
}
