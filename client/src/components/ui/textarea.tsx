import * as React from 'react';

import { cn } from '@/lib/utils/className';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

function Textarea({
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm outline-none ring-secondary ring-offset-2 transition placeholder:text-neutral-500 focus:ring-2 active:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:placeholder:text-neutral-400',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
