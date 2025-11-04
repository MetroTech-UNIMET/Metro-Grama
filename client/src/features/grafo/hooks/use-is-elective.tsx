import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export default function useIsElective() {
  const search = useSearch({ from: '/_navLayout/materias/' });
  const navigate = useNavigate();

  const [onlyElectives, setOnlyElectives] = useState(search.isElective);

  useEffect(() => {
    if (onlyElectives === search.isElective) return;
    navigate({
      to: '/materias',
      search: { ...search, isElective: onlyElectives },
      replace: true,
    });
  }, [onlyElectives, navigate, search.isElective, search]);

  return { onlyElectives, setOnlyElectives };
}
