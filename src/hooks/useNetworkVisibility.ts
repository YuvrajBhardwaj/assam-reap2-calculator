import { useCallback, useEffect, useState } from 'react';

export function useNetworkVisibility() {
  const [isHidden, setIsHidden] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('hideApiCalls');
    return stored === 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // If you later want to patch fetch/XMLHttpRequest, do it here.
    // Keeping the hook self-contained for now (no external imports).
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('hideApiCalls', String(isHidden));
  }, [isHidden]);

  const toggle = useCallback(() => setIsHidden((prev) => !prev), []);
  const hide = useCallback(() => setIsHidden(true), []);
  const show = useCallback(() => setIsHidden(false), []);

  return { isHidden, hide, show, toggle };
}