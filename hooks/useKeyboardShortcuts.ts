import { useEffect, useRef } from 'react';

// Desktop-only shortcuts align with the app's lg: layout breakpoint (1024px).

export type KeyboardShortcutActions = {
  onTalk: () => void;
  onTranscribe: () => void;
  onRightAction: () => void;
  onCopy: () => void;
  canTalk: boolean;
  canTranscribe: boolean;
  canRightAction: boolean;
  canCopy: boolean;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(actions: KeyboardShortcutActions): void {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!mediaQuery.matches) return;
      if (isTypingTarget(event.target)) return;

      const {
        onTalk,
        onTranscribe,
        onRightAction,
        onCopy,
        canTalk,
        canTranscribe,
        canRightAction,
        canCopy,
      } = actionsRef.current;

      switch (event.key) {
        case 'ArrowUp':
          if (!canTalk) return;
          event.preventDefault();
          onTalk();
          break;
        case 'ArrowLeft':
          if (!canTranscribe) return;
          event.preventDefault();
          onTranscribe();
          break;
        case 'ArrowRight':
          if (!canRightAction) return;
          event.preventDefault();
          onRightAction();
          break;
        case 'ArrowDown':
          if (!canCopy) return;
          event.preventDefault();
          onCopy();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
