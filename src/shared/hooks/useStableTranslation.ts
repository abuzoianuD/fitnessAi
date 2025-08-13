// Stable translation hook to prevent React 19 useInsertionEffect warnings
import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';

export function useStableTranslation() {
  const { t: originalT, i18n, ready } = useTranslation();
  
  // Memoize the translation function to prevent re-renders
  const stableT = useCallback((key: string, options?: any): string => {
    if (!ready) {
      return key; // Return key as fallback if not ready
    }
    const result = originalT(key, options);
    // Ensure we always return a string
    return typeof result === 'string' ? result : key;
  }, [originalT, ready]);
  
  // Memoize the return object
  const result = useMemo(() => ({
    t: stableT,
    i18n,
    ready,
  }), [stableT, i18n, ready]);
  
  return result;
}