import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISSED_KEY = 'kms_pwa_install_dismissed';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setVisible(false);
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install aplikasi KMS Digital"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-white border border-light-ash rounded-default shadow-card p-4 flex items-start gap-3"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
        <Download size={20} className="text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-deep-slate mb-1">
          Pasang KMS Digital
        </h3>
        <p className="text-body-sm text-graphite mb-3">
          Buka aplikasi langsung dari layar utama HP, tanpa buka browser.
        </p>
        <div className="flex gap-2">
          <Button type="primary" onClick={handleInstall} size="small">
            Pasang Sekarang
          </Button>
          <Button onClick={handleDismiss} size="small" type="text">
            Nanti Saja
          </Button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Tutup"
        className="flex-shrink-0 text-graphite hover:text-deep-slate"
      >
        <X size={18} />
      </button>
    </div>
  );
}
