import type { ReactNode } from 'react';
import rootStore, { StoreContext } from './rootStore';

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app and provides MobX stores
 * via React Context.
 * 
 * Usage:
 * ```tsx
 * // In App.tsx or main.tsx
 * <StoreProvider>
 *   <App />
 * </StoreProvider>
 * ```
 */
export const StoreProvider = ({ children }: StoreProviderProps) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;

