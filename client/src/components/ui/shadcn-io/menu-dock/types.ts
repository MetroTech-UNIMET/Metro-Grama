import type React from 'react';

export type IconComponentType = React.ElementType<{ className?: string }>;

export interface MenuDockItemBase {
  label: string;
  icon: IconComponentType;
}

export interface MenuDockProps<Item extends MenuDockItemBase = MenuDockItemBase> {
  items: Item[];
  className?: string;
  variant?: 'default' | 'compact' | 'large';
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  animated?: boolean;
}
