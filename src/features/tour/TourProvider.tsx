import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Tour } from 'antd';
import { useSession } from '../auth/useSession';
import { buildSteps } from './tourSteps';
import { useTour } from './useTour';

interface TourContextValue {
  replay: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

/**
 * useTourContext — akses replay() dari component lain (mis. Navbar tombol Bantuan).
 */
export function useTourContext(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return ctx;
}

/**
 * TourProvider — wrap aplikasi.
 * Tour antd dipasang sekali di root. Step generated dari role aktif.
 * Auto-show di first visit per role; bisa di-replay via context.
 */
export default function TourProvider({ children }: { children: React.ReactNode }) {
  const { role } = useSession();
  const { open, close, replay } = useTour(role, true);

  const steps = useMemo(() => buildSteps(role), [role]);

  const value = useMemo<TourContextValue>(() => ({ replay }), [replay]);

  return (
    <TourContext.Provider value={value}>
      {children}
      {steps.length > 0 && (
        <Tour
          open={open}
          onClose={close}
          onFinish={close}
          steps={steps}
          mask
          type="primary"
        />
      )}
    </TourContext.Provider>
  );
}
