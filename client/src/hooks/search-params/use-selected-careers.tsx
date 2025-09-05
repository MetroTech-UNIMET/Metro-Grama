import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import type { CareerOption } from '../queries/use-FetchCareersOptions';

interface Props {
  careerOptions: CareerOption[];
}

export function useSelectedCareers({ careerOptions }: Props) {
  const navigate = useNavigate();
  const search = useSearch({ from: '/horario/' });

  const [selectedCareers, setSelectedCareers] = useState<CareerOption[]>([]);
  const gotInitialValue = useRef(false);

  // Initialize once from URL query params
  useEffect(() => {
    if (gotInitialValue.current || !careerOptions.length) return;

    const ids = (search?.careers as string[]) ?? [];
    const initial = careerOptions.filter((option) => ids.includes(option.value));
    setSelectedCareers(initial);

    gotInitialValue.current = true;
  }, [search?.careers, careerOptions]);

  // Keep URL in sync when careers change
  useEffect(() => {
    const newCareersParam = selectedCareers.map((c) => c.value).sort();

    const currentIds = ((search?.careers as string[]) ?? []).slice().join(',');
    const nextIds = newCareersParam.slice().join(',');
    if (currentIds !== nextIds) {
      navigate({
        to: '/horario',
        search: { ...search, careers: newCareersParam },
        replace: true,
      });
    }
  }, [selectedCareers, navigate, search?.careers]);

  return { selectedCareers, setSelectedCareers };
}
