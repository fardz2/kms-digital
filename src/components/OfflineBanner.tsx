import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-center gap-[10px] bg-deep-slate text-white px-[17px] py-[10px] text-body-sm"
    >
      <WifiOff size={16} strokeWidth={2} aria-hidden />
      <span>Anda sedang offline. Sebagian data mungkin tidak terbarui.</span>
    </div>
  );
}
