import { Check } from 'lucide-react';

import { cn } from '@utils/className';

import type { Trimester } from '@/interfaces/Trimester';
import type { BaseCustomCommand } from './types';

type Data = Trimester;
export function TrimesterItem<T extends Data>({ option, isSelected, ref, ...props }: BaseCustomCommand<string, T>) {
  if (!option.data) throw new Error('Option data is required for TrimesterItem component');

  const { is_current, is_next } = option.data;

  return (
    <div
      className={cn(
        'flex cursor-pointer flex-row flex-wrap items-center gap-2 rounded px-2 py-1.5 text-sm',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        'border-secondary-800 not-[aria-selected]:pl-8 aria-selected:border',
        {
          'bg-secondary-100/50 hover:bg-secondary-100/70': is_next,
          'bg-primary-100/50': is_current,
        },
        isSelected && 'bg-secondary-100 dark:bg-secondary-800',
      )}
      ref={ref}
      {...props}
    >
      {isSelected && <Check className="w-4" />}

      <span>{option.label}</span>

      {is_current && <span className="ml-auto text-xs text-gray-500">Actual</span>}
      {is_next && <span className="ml-auto text-xs text-gray-500">Próximo</span>}
    </div>
  );
}
