'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils/className';
import { cva, type VariantProps } from 'class-variance-authority';

const tabsListVariants = cva('inline-flex h-9', {
  variants: {
    variant: {
      default: 'items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
      table: 'max-md:mb-2 md:translate-y-px gap-3 md:gap-1 max-md:h-10 overflow-x-auto',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const tabsTriggerVariants = cva('', {
  variants: {
    variant: {
      default:
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
      table:
        'md:border-b-white rounded-lg md:rounded-b-none uppercase py-2 px-4 text-xs font-bold bg-gray-100 text-gray-400 data-[state=active]:border data-[state=active]:bg-white data-[state=active]:text-primary-800 max-md:whitespace-nowrap',
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
        'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      table: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type Variants = VariantProps<typeof tabsListVariants>;

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & Variants) {
  return (
    <TabsPrimitive.List
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & Variants) {
  return (
    <TabsPrimitive.Trigger
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & Variants) {
  return (
    <TabsPrimitive.Content
      className={cn(tabsContentVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
