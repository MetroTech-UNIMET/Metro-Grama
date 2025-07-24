import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Alert } from '@/svg/Alert';
import { cn } from '@/lib/utils/className';

const cardVariants = cva(
  'rounded-xl border bg-white text-neutral-950 shadow dark:bg-neutral-950 dark:text-neutral-50 px-4 py-2',
  {
    variants: {
      variant: {
        default: 'border-gray-100 dark:border-neutral-800',
        secondary:
          'border-2 border-secondary-600 bg-secondary-50 dark:border-secondary-800 dark:bg-secondary-950',
        outline:
          'border-2 border-primary-600 bg-primary-50 dark:border-primary-800 dark:bg-primary-950',
        destructive: 'bg-destructive/15 border-0 text-destructive flex flex-row items-center gap-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, className }))} {...props}>
      {variant === 'destructive' && <Alert className="shrink-0" />}
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('leading-none font-semibold tracking-tight', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-neutral-500 dark:text-neutral-400', className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
