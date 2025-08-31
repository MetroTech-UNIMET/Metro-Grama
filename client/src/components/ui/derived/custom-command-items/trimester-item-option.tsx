import { Check } from 'lucide-react';

import { cn } from '@utils/className';

import type { Trimester } from '@/interfaces/Trimester';
import type { BaseCustomCommand } from './types';

type Data = Trimester;
export function TrimesterItem<T extends Data>({ option, isSelected, ...props }: BaseCustomCommand<string, T>) {
  if (!option.data) throw new Error('Option data is required for TrimesterItem component');

  const { is_current, is_next } = option.data;

  return (
    <div
      className={cn(
        'flex gap-2 cursor-pointer flex-row flex-wrap items-center rounded px-2 py-1.5 text-sm',
        {
          'bg-secondary-100/50 hover:bg-secondary-100/70': is_next,
          'bg-primary-100/50': is_current,
        },    
        isSelected ? 'bg-secondary-100 dark:bg-secondary-800' : 'pl-8 hover:bg-gray-50 dark:hover:bg-gray-800',
        props['aria-disabled'] && 'pointer-events-none opacity-50',
      )}
      {...props}
    >
      {isSelected && <Check className="w-4" />}

      <span>{option.label}</span>

      {is_current && <span className="ml-auto text-xs text-gray-500">Actual</span>}
      {is_next && <span className="ml-auto text-xs text-gray-500">Próximo</span>}
    </div>
  );
}
