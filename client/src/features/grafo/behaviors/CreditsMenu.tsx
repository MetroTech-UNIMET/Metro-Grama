import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

import { cn } from '@utils/className';
import useCountCredits from '@/features/grafo/hooks/useCountCredits';
import { useLazyGraphinContext } from '@/hooks/lazy-loading/use-LazyGraphin';

import { Button } from '@ui/button';

export default function CreditsMenu() {
  const [open, setOpen] = useState(false);

  const graphinContext = useLazyGraphinContext();
  if (!graphinContext) return null;
  const { graph } = graphinContext;

  const { BPCredits, credits } = useCountCredits(graph);

  return (
    <aside
      className={cn(
        'absolute top-1/2 right-0 -translate-y-1/2 scale-100 transition-all duration-1000',
        !open && 'translate-x-full',
      )}
    >
      <div className="bg-UI-white h-full w-full max-w-[20rem] rounded-md px-4 py-2 text-black">
        <section className="flex flex-wrap gap-2">
          <span className="w-fit rounded-md bg-gray-200 p-1 font-medium">
            Creditos: <span className="font-normal">{credits}</span>
          </span>
          <span className="w-fit rounded-md bg-gray-200 p-1 font-medium">
            Creditos BP: <span className="font-normal">{BPCredits}</span>
          </span>
        </section>

        <Button
          variant="ghost"
          className="bg-card fixed top-1/2 left-0 size-10 -translate-x-10 -translate-y-1/2 rounded-l-md rounded-r-none"
          onClick={() => setOpen(!open)}
          size="icon"
        >
          <ChevronLeft className={cn('rotate-0 transition-transform duration-200', open && 'rotate-180')} />
        </Button>
      </div>
    </aside>
  );
}
