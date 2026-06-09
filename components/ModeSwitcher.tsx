import React from 'react';
import { ChevronDown } from 'lucide-react';
import { AppMode } from '../types';
import { getAppModeLabel } from '../utils/labels';

interface ModeSwitcherProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  disabled?: boolean;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange, disabled }) => {
  return (
    <div className="relative inline-flex items-center justify-center border-b border-gray-900 dark:border-gray-100 pb-1">
      <select
        value={mode}
        onChange={(event) => onModeChange(event.target.value as AppMode)}
        disabled={disabled}
        className="appearance-none bg-transparent pl-6 pr-6 text-center text-lg lg:text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 focus:outline-none disabled:opacity-50 cursor-pointer"
        title="Application mode"
      >
        {(Object.values(AppMode) as AppMode[]).map((value) => (
          <option key={value} value={value}>
            {getAppModeLabel(value)}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-0 text-gray-400" />
    </div>
  );
};
