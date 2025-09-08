import { useEffect, useState } from 'react';
import type { MenuDockItemBase } from '../types';

export function useMenuDockActive(items: MenuDockItemBase[] | undefined) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items && activeIndex >= items.length) setActiveIndex(0);
  }, [items, activeIndex]);

  return { activeIndex, setActiveIndex };
}
