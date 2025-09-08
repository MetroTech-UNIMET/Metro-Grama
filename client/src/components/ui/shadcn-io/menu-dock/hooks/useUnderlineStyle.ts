import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    if (!showLabels || orientation !== 'horizontal') return;
    if (activeIndex < 0) return;
    const activeButton = itemRefs.current[activeIndex];
    const activeText = textRefs.current[activeIndex];
    if (activeButton && activeText) {
      const buttonRect = activeButton.getBoundingClientRect();
      const textRect = activeText.getBoundingClientRect();
      const containerRect = activeButton.parentElement?.getBoundingClientRect();
      if (containerRect) {
        setWidth(textRect.width);
        setLeft(buttonRect.left - containerRect.left + (buttonRect.width - textRect.width) / 2);
      }
    }
  }, [activeIndex, showLabels, orientation]);

  return { width, left, itemRefs, textRefs };
}
