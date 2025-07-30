import * as React from 'react';

import { cn } from '@/lib/utils/className';

export interface InputProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'ring-secondary dark:focus:border-primary w-full rounded-[10px] border bg-transparent px-4 py-2 text-black ring-offset-2 transition outline-hidden focus:ring-2 active:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
