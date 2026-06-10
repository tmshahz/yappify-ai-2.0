import React from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { AppMode } from '../types';
import { getAppModeLabel } from '../utils/labels';

interface ModeSwitcherProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  disabled?: boolean;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange, disabled }) => {
  return (
    <div className={clsx('yap-mode-switcher', disabled && 'is-disabled')}>
      <select
        value={mode}
        onChange={(event) => onModeChange(event.target.value as AppMode)}
        disabled={disabled}
        className="yap-mode-switcher__select"
        title="Application mode"
      >
        {(Object.values(AppMode) as AppMode[]).map((value) => (
          <option key={value} value={value}>
            {getAppModeLabel(value)}
          </option>
        ))}
      </select>
      <ChevronDown size={14} strokeWidth={2.25} className="yap-mode-switcher__chevron" aria-hidden />
    </div>
  );
};
