import { useState } from 'react';
import { Button } from 'antd';
import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PWAUpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh || dismissed) return null;

  const handleReload = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
    setDismissed(true);
  };

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-deep-slate text-white rounded-default shadow-card p-4 flex items-center gap-3"
    >
      <RefreshCw size={20} className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium mb-2">
          Versi baru aplikasi tersedia
        </p>
        <div className="flex gap-2">
          <Button type="primary" size="small" onClick={handleReload}>
            Muat Ulang
          </Button>
          <Button size="small" type="text" onClick={handleDismiss} className="!text-white">
            Nanti
          </Button>
        </div>
      </div>
    </div>
  );
}
