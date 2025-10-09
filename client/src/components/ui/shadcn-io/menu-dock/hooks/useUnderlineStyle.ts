import { useLayoutEffect } from '@tanstack/react-router';
import { useRef, useState } from 'react';

interface UseUnderlineArgs {
  activeIndex: number;
  showLabels: boolean;
  orientation: 'horizontal' | 'vertical';
}

export function useUnderlineStyle({ activeIndex, showLabels, orientation }: UseUnderlineArgs) {
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [width, setWidth] = useState(0);
  const [left, setLeft] = useState(0);

  useLayoutEffect(() => {
    if (!showLabels || orientation !== 'horizontal' || activeIndex < 0) {
      setWidth(0);
      setLeft(0);
      return;
    }

    const activeButton = itemRefs.current[activeIndex];
    const activeText = textRefs.current[activeIndex];
    const container = activeButton?.parentElement;

    if (!activeButton || !activeText || !container) {
      setWidth(0);
      setLeft(0);
      return;
    }

    const buttonRect = activeButton.getBoundingClientRect();
    const textRect = activeText.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setWidth(textRect.width);
    setLeft(buttonRect.left - containerRect.left + (buttonRect.width - textRect.width) / 2);
  }, [activeIndex, showLabels, orientation]);

  return { width, left, itemRefs, textRefs };
}
