import React from 'react';

import type { CareerOption } from '@/hooks/queries/career/use-fetch-careers';

type StudentsFilter = 'all' | 'friends' | 'friendFriends';

export type SubjectStatsQueryContextValue = {
  selectedCareers: CareerOption[];
  setSelectedCareers: React.Dispatch<React.SetStateAction<CareerOption[]>>;

  selectedStudentsFilter: StudentsFilter;
  setSelectedStudentsFilter: React.Dispatch<React.SetStateAction<StudentsFilter>>;

  startingTrimester: string | undefined;
  setStartingTrimester: React.Dispatch<React.SetStateAction<string | undefined>>;

  endingTrimester: string | undefined;
  setEndingTrimester: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const SubjectStatsQueryContext = React.createContext<SubjectStatsQueryContextValue | null>(null);

export function SubjectStatsQueryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCareers, setSelectedCareers] = React.useState<CareerOption[]>([]);
  const [selectedStudentsFilter, setSelectedStudentsFilter] = React.useState<StudentsFilter>('all');

  const [startingTrimester, setStartingTrimester] = React.useState<string | undefined>(undefined);
  const [endingTrimester, setEndingTrimester] = React.useState<string | undefined>(undefined);

  const value: SubjectStatsQueryContextValue = React.useMemo(
    () => ({
      selectedCareers,
      setSelectedCareers,
      selectedStudentsFilter,
      setSelectedStudentsFilter,
      startingTrimester,
      setStartingTrimester,
      endingTrimester,
      setEndingTrimester,
    }),
    [selectedCareers, selectedStudentsFilter, startingTrimester, endingTrimester],
  );

  return <SubjectStatsQueryContext.Provider value={value}>{children}</SubjectStatsQueryContext.Provider>;
}

export function useSubjectStatsQueryContext() {
  const ctx = React.use(SubjectStatsQueryContext);
  if (!ctx) throw new Error('useSubjectStatsQuery must be used within SubjectStatsQueryProvider');
  return ctx;
}
