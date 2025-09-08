'use client';

import React from 'react';

import {
  computeIndicatorOffset,
  dockContainerVariants,
  dockIconVariants,
  dockItemVariants,
  dockTextVariants,
} from './dockVariants';
import { useMenuDockActive } from './hooks/useMenuDockActive';
import { useUnderlineStyle } from './hooks/useUnderlineStyle';
import { HorizontalLine, VerticalLine } from './ActiveIndicators';

import { cn } from '@utils/className';

import type { MenuDockProps, MenuDockItemBase } from './types';

type MenuItem = MenuDockItemBase & {
  onClick?: () => void;
};

export const MenuDock: React.FC<MenuDockProps<MenuItem>> = ({
  items,
  className,
  variant = 'default',
  orientation = 'horizontal',
  showLabels = true,
  animated = true,
}) => {
  const { activeIndex, setActiveIndex } = useMenuDockActive(items);

  const {
    width: underlineWidth,
    left: underlineLeft,
    itemRefs,
    textRefs,
  } = useUnderlineStyle({
    activeIndex,
    showLabels,
    orientation,
  });

  const handleItemClick = (index: number, item: MenuItem) => {
    setActiveIndex(index);
    item.onClick?.();
  };

  return (
    <nav className={cn(dockContainerVariants({ orientation, size: variant }), className)} role="navigation">
      {items.map((item: MenuDockItemBase, index: number) => {
        const isActive = index === activeIndex;
        const IconComponent = item.icon;

        return (
          <button
            key={`${item.label}-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg transition-all duration-200',
              'hover:bg-muted/50 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              dockItemVariants({ size: variant, active: isActive }),
            )}
            onClick={() => handleItemClick(index, item)}
            aria-label={item.label}
            type="button"
          >
            <div
              className={cn(
                'flex items-center justify-center transition-all duration-200',
                animated && isActive && 'animate-bounce',
                orientation === 'horizontal' && showLabels ? 'mb-1' : '',
                orientation === 'vertical' && showLabels ? 'mb-1' : '',
              )}
            >
              <IconComponent className={cn(dockIconVariants({ size: variant }))} />
            </div>

            {showLabels && (
              <span
                ref={(el) => {
                  textRefs.current[index] = el;
                }}
                className={cn(dockTextVariants({ size: variant }))}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}

      <HorizontalLine
        show={showLabels && orientation === 'horizontal'}
        width={underlineWidth}
        left={underlineLeft}
        animated={animated}
      />
      <VerticalLine
        show={!showLabels || orientation === 'vertical'}
        offset={computeIndicatorOffset(activeIndex, variant)}
        orientation={orientation}
        variant={variant}
        animated={animated}
      />
    </nav>
  );
};
