'use client';

import * as React from 'react';
import { Slider as SliderPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils/className';

// TODO - Ponerlo opaco si está disabled, no sé por que no funciona
function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none items-center select-none', className)}
      {...props}
    >
      <SliderPrimitive.Track className="bg-primary/20 relative h-1.5 w-full grow overflow-hidden rounded-full dark:bg-neutral-50/20">
        <SliderPrimitive.Range className="bg-primary data-[disabled=true]:bg-primary/60 absolute h-full dark:bg-neutral-50" />
      </SliderPrimitive.Track>
      {(props.value || props.defaultValue || [0]).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-4 w-4 rounded-full border border-neutral-900/50 bg-white shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-neutral-950 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:focus-visible:ring-neutral-300"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
