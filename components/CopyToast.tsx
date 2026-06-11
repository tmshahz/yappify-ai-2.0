import React from 'react';

type CopyToastProps = {
  showKey: number;
};

export const CopyToast: React.FC<CopyToastProps> = ({ showKey }) => {
  if (showKey === 0) return null;

  return (
    <div
      key={showKey}
      className="yap-copy-toast fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 rounded-full text-xs font-semibold shadow-lg bg-gray-900/90 text-white dark:bg-[var(--yap-surface-2)] dark:text-[var(--yap-text-1)] dark:border dark:border-[var(--yap-glass-border)]"
      role="status"
      aria-live="polite"
    >
      Text copied
    </div>
  );
};
