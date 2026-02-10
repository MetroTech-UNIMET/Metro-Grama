import { Link, useRouterState, type LinkComponentProps } from '@tanstack/react-router';
import { cn } from '@utils/className';
import {
  computeIndicatorOffset,
  dockContainerVariants,
  dockIconVariants,
  dockItemVariants,
  dockTextVariants,
} from './dockVariants';
import { HorizontalLine, VerticalLine } from './ActiveIndicators';
import { useUnderlineStyle } from './hooks/useUnderlineStyle';
import { Button } from '@ui/button';
import { GripVertical } from 'lucide-react';
import { useToggle } from '@/hooks/shadcn.io/use-toggle';
import { MenuDockItemBase, MenuDockProps } from './types';

export interface DockLinkItem extends MenuDockItemBase, Omit<LinkComponentProps, 'children' | 'className'> {
  isActive?: (currentPath: string) => boolean;
}

export function MenuDockLink({
  items,
  className,
  showLabels = true,
  variant: size = 'default',
  orientation = 'horizontal',
  animated = true,
}: MenuDockProps<DockLinkItem>) {
  const { location } = useRouterState();

  const path = location.pathname;

  const activeIndex = items.findIndex((i) =>
    i.isActive ? i.isActive(path) : i.to ? path.startsWith(i.to as string) : false,
  );

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

  const [isVisible, toggleVisibility] = useToggle();

  return (
    <nav
      className={cn(
        dockContainerVariants({ orientation, size }),
        'transition-transform',
        isVisible ? '' : 'translate-y-19.5',
        className,
      )}
    >
      {items.map((item, index) => {
        const active = item.isActive ? item.isActive(path) : item.to ? path.startsWith(item.to as string) : false;
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            to={item.to}
            search={item.search}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg transition-colors',
              dockItemVariants({ size, active }),
            )}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            <Icon className={cn(dockIconVariants({ size }), active && 'animate-bounce')} />
            {showLabels && (
              <span
                ref={(el) => {
                  textRefs.current[index] = el;
                }}
                className={cn(dockTextVariants({ size }), 'mt-1')}
              >
                {item.label}
              </span>
            )}
          </Link>
        );
      })}

      <Button
        className="bg-card absolute -top-5 right-1/2 size-9 translate-x-1/2 rounded-full border-2"
        onClick={toggleVisibility}
        variant="ghost"
      >
        <GripVertical />
      </Button>

      <HorizontalLine
        show={showLabels && orientation === 'horizontal'}
        width={underlineWidth}
        left={underlineLeft}
        animated={animated}
      />
      <VerticalLine
        show={!showLabels || orientation === 'vertical'}
        offset={computeIndicatorOffset(activeIndex, size)}
        orientation={orientation}
        variant={size}
        animated={animated}
      />
    </nav>
  );
}
export default MenuDockLink;
