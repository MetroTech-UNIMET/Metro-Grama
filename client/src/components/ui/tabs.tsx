'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils/className';
import { cva, type VariantProps } from 'class-variance-authority';

const tabsListVariants = cva('inline-flex h-9', {
  variants: {
    variant: {
      default: 'items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground h-auto',
      table: 'max-md:mb-2 md:translate-y-px gap-3 md:gap-1 max-md:h-10 overflow-x-auto',
      ghost: 'bg-transparent gap-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const tabsTriggerVariants = cva('cursor-pointer', {
  variants: {
    variant: {
      default:
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      table:
        'md:border-b-white rounded-lg md:rounded-b-none uppercase py-2 px-4 text-xs font-bold bg-gray-100 text-gray-400 data-[state=active]:border data-[state=active]:bg-white data-[state=active]:text-primary-800 max-md:whitespace-nowrap',
      ghost:
        'bg-transparent hover:bg-accent/50 data-[state=active]:bg-primary-300  data-[state=active]:text-primary-800  text-sm px-3 py-1 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const tabsContentVariants = cva('', {
  variants: {
    variant: {
      default:
        'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2',
      table: '',
      ghost: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type Variants = VariantProps<typeof tabsListVariants>;

function Tabs({ className, orientation = 'horizontal', ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs ', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, variant, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger> & Variants) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsContent({ className, variant, ...props }: React.ComponentProps<typeof TabsPrimitive.Content> & Variants) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(tabsContentVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
