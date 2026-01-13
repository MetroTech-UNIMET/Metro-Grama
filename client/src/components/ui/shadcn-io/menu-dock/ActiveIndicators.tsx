import React from 'react';
import { cn } from '@utils/className';

interface BaseIndicatorProps {
  animated?: boolean;
  className?: string;
}

interface HorizontalLineProps extends BaseIndicatorProps {
  width: number;
  left: number;
  show: boolean;
}

interface VerticalLineProps extends BaseIndicatorProps {
  offset: number;
  show: boolean;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'compact' | 'large';
}

export const HorizontalLine: React.FC<HorizontalLineProps> = ({ width, left, show, animated, className }) => {
  if (!show) return null;
  return (
    <div
      className={cn(
        'bg-primary absolute bottom-2 h-0.5 rounded-full transition-all ease-out',
        animated ? 'duration-300' : '',
        className,
      )}
      style={{ width: `${width}px`, left: `${left}px` }}
    />
  );
};

export const VerticalLine: React.FC<VerticalLineProps> = ({
  offset,
  show,
  orientation,
  variant,
  animated,
  className,
}) => {
  if (!show) return null;
  return (
    <div
      className={cn(
        'bg-primary absolute rounded-full transition-all',
        animated ? 'duration-300' : '',
        orientation === 'vertical' ? 'left-1 h-6 w-1' : 'bottom-0.5 h-0.5 w-6',
        className,
      )}
      style={{ [orientation === 'vertical' ? 'top' : 'left']: `${offset}px` }}
      data-variant={variant}
    />
  );
};
