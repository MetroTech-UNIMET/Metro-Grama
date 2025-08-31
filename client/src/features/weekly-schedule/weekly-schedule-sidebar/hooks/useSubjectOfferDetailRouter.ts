import { useCallback, useMemo, useState } from 'react';
import type { SubjectOfferWithSchedules } from '@/interfaces/SubjectOffer';

// A tiny, scalable view router for the SubjectOfferDetail sidebar
// - Register views with a string key
// - Navigate via go(view)
// - Derive initial view from provided subjectOffer when desired

export type DetailView = 'list' | 'form' | string;

export interface UseSubjectOfferDetailRouterOptions {
  initialView?: DetailView | ((ctx: { subjectOffer: SubjectOfferWithSchedules }) => DetailView);
}

export function useSubjectOfferDetailRouter(
  subjectOffer: SubjectOfferWithSchedules,
  options: UseSubjectOfferDetailRouterOptions = {},
) {
  const initial = useMemo<DetailView>(() => {
    if (typeof options.initialView === 'function') return options.initialView({ subjectOffer });
    if (options.initialView) return options.initialView;
    // default: if no schedules go to form, else list
    return subjectOffer.schedules.length === 0 ? 'form' : 'list';
  }, [options.initialView, subjectOffer]);

  const [view, setView] = useState<DetailView>(initial);

  const go = useCallback((next: DetailView) => setView(next), []);

  // smart back: if currently editing and there are schedules, return to list; else signal exit
  const canBackToList = subjectOffer.schedules.length > 0;
  const back = useCallback(
    (onExit: () => void) => {
      if (view === 'form' && canBackToList) {
        setView('list');
        return;
      }
      onExit();
    },
    [view, canBackToList],
  );

  return { view, go, back } as const;
}
