import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useFetchStudentCareers } from '../queries/student/use-fetch-student-careers';

import { idToSurrealId } from '@utils/queries';

import type { CareerOption } from '../queries/use-FetchCareersOptions';

interface Props {
  careerOptions: CareerOption[];
  activeUrl: '/_navLayout/horario/' | '/_navLayout/materias/';
  /**
   * When true, and the URL search param `careers` is empty / absent,
   * the hook will fetch the authenticated student's careers via `useFetchStudentCareers`
   * and use those career IDs as the initial selected careers.
   *
   * Flow:
   * 1. If search params already contain careers, they win.
   * 2. Else, if this flag is true and the student careers request resolves with IDs,
   *    those IDs are mapped against `careerOptions` and set as initial selection.
   */
  useStudentCareersAsDefault?: boolean;
}

export function useSelectedCareers({ careerOptions, activeUrl, useStudentCareersAsDefault }: Props) {
  const navigate = useNavigate();
  const search = useSearch({ from: activeUrl });

  const { data: studentCareersData } = useFetchStudentCareers({
    queryOptions: { enabled: !!useStudentCareersAsDefault },
  });

  const [selectedCareers, setSelectedCareers] = useState<CareerOption[]>([]);
  const gotInitialValue = useRef(false);

  // Initialize once from URL query params or (optionally) student's careers
  useEffect(() => {
    if (gotInitialValue.current || !careerOptions.length) return;

    let ids: string[] = search?.careers ?? [];

    // If no careers provided in search and flag enabled, try student careers
    if (ids.length === 0 && useStudentCareersAsDefault && studentCareersData?.length) {
      ids = studentCareersData.map((c) => idToSurrealId(c.ID, c.Table)).slice();
    }

    gotInitialValue.current = true;
    if (ids.length === 0) return; // still nothing to initialize with

    const initial = careerOptions.filter((option) => ids.includes(option.value));
    setSelectedCareers(initial);
  }, [search?.careers, careerOptions, useStudentCareersAsDefault, studentCareersData]);

  // Keep URL in sync when careers change
  useEffect(() => {
    if (!gotInitialValue.current) return;
    const newCareersParam = selectedCareers.map((c) => c.value).sort();

    const currentIds = ((search?.careers as string[]) ?? []).slice().join(',');
    const nextIds = newCareersParam.slice().join(',');
    if (currentIds !== nextIds) {
      navigate({
        to: activeUrl === '/_navLayout/horario/' ? '/horario' : '/materias',
        search: { ...search, careers: newCareersParam },
        replace: true,
      });
    }
  }, [selectedCareers, navigate, search?.careers, search]);

  return { selectedCareers, setSelectedCareers };
}
