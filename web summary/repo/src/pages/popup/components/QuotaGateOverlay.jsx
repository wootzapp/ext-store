// src/pages/popup/components/QuotaGateOverlay.jsx
import React from 'react';
import QuotaCard from '@/pages/popup/components/QuotaCard';

const PRICING_URL = 'https://nextjs-app-410940835135.us-central1.run.app/pricing';

export default function QuotaGateOverlay({ show, orgId, onOpenSettings, usingOwnKey = false, className = '', onOpenPlans }) {
  if (!show) return null;

  const openPlans = () => {
    try {
      if (chrome?.tabs?.open) chrome.tabs.open(PRICING_URL);
      else if (chrome?.tabs?.create) chrome.tabs.create({ url: PRICING_URL });
      else window.open(PRICING_URL, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(PRICING_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`absolute inset-0 z-[60] bg-white/80 backdrop-blur-sm flex items-start justify-center p-4 pointer-events-auto ${className}`}>
      <div className="w-full max-w-md">
        <QuotaCard
          orgId={orgId}
          pricingUrl={PRICING_URL}
          usingOwnKey={usingOwnKey}
          onOpenPlans={onOpenPlans}
          onUseOwnKey={() => {
            try { localStorage.setItem('intent.scrollToOwnKeyOnce', '1'); } catch {}
            onOpenSettings?.();
          }}
        />
        <div className="mt-2 text-center text-xs text-gray-600">
          Usage limit reached. Upgrade or use your own API key to continue.
        </div>
      </div>
    </div>
  );
}