import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  /** Tall dialogs (e.g. Settings) should start from the top on mobile so the header stays visible. */
  align?: 'center' | 'start';
  /** Used when stacking modals so the top layer receives focus and backdrop clicks. */
  zIndex?: number;
  titleId?: string;
  closeOnEscape?: boolean;
}

const maxWidthClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  footer,
  maxWidth = 'md',
  icon,
  align = 'center',
  zIndex = 9999,
  titleId = 'modal-title',
  closeOnEscape = true,
}) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div
        className="yap-modal-backdrop"
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Scrollable centering container — sits above backdrop */}
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        <div
          className={clsx(
            'flex min-h-full justify-center p-4',
            align === 'start' ? 'items-start pt-6 sm:pt-8' : 'items-center'
          )}
        >
          <div
            className={clsx(
              'yap-glass-panel yap-panel-enter relative w-full flex flex-col rounded-2xl dark:rounded-[var(--yap-radius-xl)]',
              'bg-white dark:bg-transparent',
              'border border-gray-100 dark:border-[var(--yap-glass-border)] shadow-2xl',
              'max-h-[85vh]',
              maxWidthClass[maxWidth]
            )}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 dark:border-[var(--yap-glass-border)] bg-gray-50/50 dark:bg-[rgba(255,255,255,0.025)] px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                {icon}
                <h2
                  id={titleId}
                  className="truncate text-lg font-semibold text-gray-900 dark:text-[var(--yap-text-1)]"
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="ml-4 flex-shrink-0 rounded-full p-2 text-gray-500 dark:text-[var(--yap-text-2)] transition-colors hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 custom-scrollbar">
              {children}
            </div>

            {footer && (
              <div className="flex-shrink-0 border-t border-gray-100 dark:border-[var(--yap-glass-border)] bg-gray-50 dark:bg-[rgba(255,255,255,0.025)] px-4 py-4 sm:px-6">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
