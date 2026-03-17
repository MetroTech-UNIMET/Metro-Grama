import { useCallback, type RefObject } from 'react';
import { type RegisterableHotkey, useHotkey } from '@tanstack/react-hotkeys';

interface UseHotkeyActionProps {
  hotkey: RegisterableHotkey;

  beforeAction?: () => boolean | undefined;
  action: (event: KeyboardEvent) => void;
}

interface UseHotkeyBaseProps {
  hotkey: RegisterableHotkey;
  targetRef?: RefObject<HTMLElement | null>;
  querySelector?: string;

  beforeAction?: () => boolean | undefined;
}

export function useHotkeyAction({ hotkey, beforeAction, action }: UseHotkeyActionProps) {
  const handleHotkey = useCallback(
    (event: KeyboardEvent) => {
      if (beforeAction?.() === false) return;

      event.preventDefault();
      action(event);
    },
    [action, beforeAction],
  );

  useHotkey(hotkey, handleHotkey);
}

export function useHotkeyClick({ hotkey, targetRef, querySelector, beforeAction }: UseHotkeyBaseProps) {
  const clickTarget = useCallback(() => {
    const element =
      targetRef?.current ?? (querySelector ? (document.querySelector(querySelector) as HTMLElement | null) : null);
    if (element) element.click();
  }, [querySelector, targetRef]);

  useHotkeyAction({ hotkey, beforeAction, action: clickTarget });
}

export function useHotkeyFocus({ hotkey, targetRef, querySelector, beforeAction }: UseHotkeyBaseProps) {
  const focusTarget = useCallback(() => {
    const element =
      targetRef?.current ?? (querySelector ? (document.querySelector(querySelector) as HTMLElement | null) : null);
    if (element) element.focus();
  }, [querySelector, targetRef]);

  useHotkeyAction({ hotkey, beforeAction: beforeAction, action: focusTarget });
}
