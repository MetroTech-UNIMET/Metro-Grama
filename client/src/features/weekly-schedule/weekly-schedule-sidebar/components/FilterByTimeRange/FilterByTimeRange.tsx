import { useMemo } from 'react';
import { cn } from '@utils/className';
import { TimePicker } from '@components/ui/derived/time-picker';

import type { TimeRange } from '../../hooks/search-params/use-filter-by-time-range';
import { Button } from '@ui/button';

interface Props {
  value: TimeRange | undefined;
  onChange: (next: Partial<TimeRange>) => void;
  onReset?: () => void;
  className?: string;
}

function strToDate(str: string) {
  const [h, m] = str.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function dateToStr(date: Date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function FilterByTimeRange({ value, onChange, onReset, className }: Props) {
  const summary = useMemo(() => (value ? `${value.start} - ${value.end}` : 'N/A'), [value]);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1 text-xs font-medium">
          <span>Inicio</span>
          <TimePicker
            value={value ? strToDate(value.start) : undefined}
            onChange={(d) => {
              const startStr = d ? dateToStr(d) : '';
              if (!startStr) return;

              // Ensure start is not after end
              if (startStr > (value?.end ?? '')) {
                onChange({ start: startStr, end: startStr });
              } else {
                onChange({ start: startStr });
              }
            }}
            hideSeconds
            className="w-32"
          />
        </div>
        <div className="flex flex-col gap-1 text-xs font-medium">
          <span>Fin</span>
          <TimePicker
            value={value ? strToDate(value.end) : undefined}
            onChange={(d) => {
              const endStr = d ? dateToStr(d) : '';
              if (!endStr) return;

              // Ensure end is not before start
              if (endStr < (value?.start ?? '')) {
                onChange({ start: endStr, end: endStr });
              } else {
                onChange({ end: endStr });
              }
            }}
            hideSeconds
            className="w-32"
          />
        </div>
      </div>
      <span className="text-muted-foreground text-[10px]">
        Rango aplicado: {summary}
        {onReset && (
          <Button variant="link" type="button" onClick={onReset} className="text-muted-foreground ml-px">
            Resetear
          </Button>
        )}
      </span>
    </div>
  );
}
