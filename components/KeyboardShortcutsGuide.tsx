import React from 'react';

type ShortcutItem = {
  keyLabel: string;
  title: string;
  description: string;
};

const SHORTCUTS: ShortcutItem[] = [
  { keyLabel: '↑', title: 'Up Arrow', description: 'Start or stop recording' },
  { keyLabel: '←', title: 'Left Arrow', description: 'Transcribe audio' },
  { keyLabel: '→', title: 'Right Arrow', description: 'Run Promptify' },
  { keyLabel: '↓', title: 'Down Arrow', description: 'Copy the currently visible output' },
];

function KeyCap({ label }: { label: string }) {
  return (
    <span className="yap-kbd-key" aria-hidden="true">
      {label}
    </span>
  );
}

function ShortcutLabel({ title, description }: Pick<ShortcutItem, 'title' | 'description'>) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-bold text-gray-800 dark:text-[var(--yap-text-1)]">{title}</p>
      <p className="text-[10px] text-gray-500 dark:text-[var(--yap-text-2)] leading-snug mt-0.5">
        {description}
      </p>
    </div>
  );
}

export const KeyboardShortcutsGuide: React.FC = () => {
  return (
    <div className="yap-glass-card bg-gray-50 dark:bg-[rgba(255,255,255,0.035)] rounded-xl p-4 space-y-4">
      <h3 className="text-xs font-bold text-gray-700 dark:text-[var(--yap-text-1)] uppercase tracking-wider">
        Keyboard Shortcuts (Desktop)
      </h3>

      {/* Cross layout — tablet/desktop */}
      <div className="hidden sm:block">
        <div className="yap-kbd-layout mx-auto max-w-xs">
          <div className="yap-kbd-layout__up flex flex-col items-center gap-1.5">
            <KeyCap label="↑" />
            <ShortcutLabel title="Up Arrow" description="Start or stop recording" />
          </div>

          <div className="yap-kbd-layout__left flex flex-col items-center gap-1.5">
            <KeyCap label="←" />
            <ShortcutLabel title="Left Arrow" description="Transcribe audio" />
          </div>

          <div className="yap-kbd-layout__down flex flex-col items-center gap-1.5">
            <KeyCap label="↓" />
            <ShortcutLabel title="Down Arrow" description="Copy the currently visible output" />
          </div>

          <div className="yap-kbd-layout__right flex flex-col items-center gap-1.5">
            <KeyCap label="→" />
            <ShortcutLabel title="Right Arrow" description="Run Promptify" />
          </div>
        </div>
      </div>

      {/* Stacked list — mobile */}
      <ul className="sm:hidden space-y-3">
        {SHORTCUTS.map((shortcut) => (
          <li key={shortcut.keyLabel} className="flex items-start gap-3">
            <KeyCap label={shortcut.keyLabel} />
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-gray-800 dark:text-[var(--yap-text-1)]">
                {shortcut.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-[var(--yap-text-2)] leading-relaxed">
                {shortcut.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <ul className="space-y-1.5 text-xs text-gray-500 dark:text-[var(--yap-text-2)] border-t border-gray-200/80 dark:border-[var(--yap-glass-border)] pt-3">
        <li>Keyboard shortcuts are available on desktop devices.</li>
        <li>Shortcuts are disabled while typing in text fields.</li>
        <li>The Down Arrow performs the same action as the Copy button.</li>
      </ul>
    </div>
  );
};
