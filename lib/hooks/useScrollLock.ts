'use client';

import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal or drawer is active.
 * Restores original overflow behavior when unmounted or inactive.
 */
export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}
