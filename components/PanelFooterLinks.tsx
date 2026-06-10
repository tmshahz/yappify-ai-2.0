import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

interface PanelFooterLinksProps {
  onInfoOpen: () => void;
}

export const PanelFooterLinks: React.FC<PanelFooterLinksProps> = ({ onInfoOpen }) => (
  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-[var(--yap-glass-border)] space-y-3">
    <button
      onClick={onInfoOpen}
      className="yap-hover-lift flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-[var(--yap-text-2)] hover:text-purple-600 dark:hover:text-[var(--yap-violet-hover)] transition-colors w-full"
    >
      <Info size={16} />
      <span>How to Use</span>
    </button>
    <a
      href="https://www.tmshahz.com"
      target="_blank"
      rel="noopener noreferrer"
      className="yap-hover-lift flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-[var(--yap-text-2)] hover:text-purple-600 dark:hover:text-[var(--yap-violet-hover)] transition-colors"
    >
      <ExternalLink size={16} />
      <span>About Developer</span>
    </a>
  </div>
);
