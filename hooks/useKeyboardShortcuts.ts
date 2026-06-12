import { useEffect, useRef } from 'react';

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

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

/**
 * True when the primary UI is touch-first with no mouse/trackpad (typical phone).
 * We do not gate on viewport width so narrow desktop/PWA windows keep shortcuts.
 * Tablets with a hardware keyboard still dispatch Arrow key events and are not blocked.
 */
function isLikelyTouchOnlyEnvironment(): boolean {
  return (
    window.matchMedia('(hover: none)').matches &&
    window.matchMedia('(pointer: coarse)').matches &&
    !window.matchMedia('(any-pointer: fine)').matches
  );
}

/** On-screen mobile keyboards do not emit arrow keys; ignore stray events on touch-only UIs. */
function shouldIgnoreArrowKeyOnTouchUI(event: KeyboardEvent): boolean {
  if (!ARROW_KEYS.has(event.key)) return false;
  if (!isLikelyTouchOnlyEnvironment()) return false;
  // Hardware keyboards (including iPad) report a stable code; skip only ambiguous touch-UI cases.
  return event.code === '';
}

export function useKeyboardShortcuts(actions: KeyboardShortcutActions): void {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreArrowKeyOnTouchUI(event)) return;
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
