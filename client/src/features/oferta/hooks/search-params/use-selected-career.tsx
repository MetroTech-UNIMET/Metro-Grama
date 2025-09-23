import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useFetchStudentCareers } from '@/hooks/queries/student/use-fetch-student-careers';
import { idToSurrealId } from '@utils/queries';
import type { CareerOption } from '@/hooks/queries/use-FetchCareersOptions';

interface Props {
  careerOptions: CareerOption[];
  useStudentCareersAsDefault?: boolean;
}

export function useSelectedCareer({ careerOptions, useStudentCareersAsDefault }: Props) {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/oferta/' });

  const { data: studentCareersData } = useFetchStudentCareers({
    queryOptions: { enabled: !!useStudentCareersAsDefault },
  });

  const [selectedCareer, setSelectedCareer] = useState<CareerOption | undefined>(undefined);
  const gotInitialValue = useRef(false);

  // Initialize once from URL query param or (optionally) student's careers
  useEffect(() => {
    if (gotInitialValue.current || !careerOptions.length) return;

    let id: string | undefined = (search as any)?.career;

    // If no career in search and flag enabled, try student careers (pick first)
    if ((!id || id.length === 0) && useStudentCareersAsDefault && studentCareersData?.length) {
      const firstStudentCareer = studentCareersData[0];
      id = idToSurrealId(firstStudentCareer.ID, firstStudentCareer.Table);
    }

    gotInitialValue.current = true;
    if (!id) return;

    const initial = careerOptions.find((option) => option.value === id);
    setSelectedCareer(initial);
  }, [search, careerOptions, useStudentCareersAsDefault, studentCareersData]);

  // Keep URL in sync when career changes
  useEffect(() => {
    if (!gotInitialValue.current) return;
    const currentId = ((search as any)?.career as string) ?? '';
    const nextId = selectedCareer?.value ?? '';
    if (currentId !== nextId) {
      navigate({
        to: '/oferta',
        search: { ...search, career: nextId || undefined },
        replace: true,
      });
    }
  }, [selectedCareer, navigate, search]);

  return { selectedCareer, setSelectedCareer };
}
