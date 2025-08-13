// Safe translation wrapper to handle React 19 compatibility issues
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SafeTranslationProps {
  children: (t: (key: string) => string) => React.ReactNode;
}

export function SafeTranslation({ children }: SafeTranslationProps) {
  const [isReady, setIsReady] = useState(false);
  const { t, ready } = useTranslation();

  useEffect(() => {
    if (ready) {
      // Use setTimeout to ensure we're not in a render cycle
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [ready]);

  if (!isReady) {
    // Return a fallback that doesn't use translations
    return children((key: string) => key);
  }

  return <>{children(t)}</>;
}

// Hook version for simpler usage
export function useSafeTranslation() {
  const [isReady, setIsReady] = useState(false);
  const { t, ready } = useTranslation();

  useEffect(() => {
    if (ready) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [ready]);

  return {
    t: isReady ? t : (key: string) => key,
    ready: isReady,
  };
}