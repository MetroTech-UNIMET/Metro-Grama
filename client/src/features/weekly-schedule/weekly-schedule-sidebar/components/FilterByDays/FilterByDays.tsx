import { weekDayOptions } from '@/lib/constants/date';
import { cn } from '@utils/className';

interface Props {
  selectedDays: number[];
  onToggle: (day: number) => void;
  onClear?: () => void;
  className?: string;
}

/**
 * Renders a compact weekday multi-select (0=Domingo .. 6=Sábado) used to filter subject offers.
 */
export function FilterByDays({ selectedDays, onToggle, onClear, className }: Props) {
  const hasSelection = selectedDays.length > 0;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap gap-1">
        {weekDayOptions.map((opt) => {
          const active = selectedDays.includes(opt.value as number);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value as number)}
              className={cn(
                'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-foreground/70 hover:bg-muted/70'
              )}
              title={opt.label}
            >
              {opt.label.slice(0, 2).toUpperCase()}
            </button>
          );
        })}
      </div>
      {hasSelection && (
        <button
          type="button"
          onClick={onClear}
          className="self-start text-xs text-muted-foreground underline hover:text-foreground"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
