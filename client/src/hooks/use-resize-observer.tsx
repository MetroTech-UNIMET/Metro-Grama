import { useEffect, useRef } from 'react';

interface Props<T> {
  onResize: (width: number, ref: T) => void;
}

export function useResizeObserver<T extends HTMLElement>({ onResize }: Props<T>) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const element = entries[0];

      onResize(element.contentRect.width, ref.current as T);
    });
    if (!ref.current) return;
    observer.observe(ref.current);
    return () => {
      ref.current && observer.unobserve(ref.current);
    };
  }, []);

  return ref;
}
