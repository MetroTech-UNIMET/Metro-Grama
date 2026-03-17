import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

export function useIncludeElectives() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });

  const [includeElectives, setIncludeElectives] = useState(search.includeElectives);

  useEffect(() => {
    setIncludeElectives(search.includeElectives);
  }, [search.includeElectives]);

  useEffect(() => {
    const current = search.includeElectives;
    if (current === includeElectives) return;

    navigate({
      to: '/horario',
      search: { ...search, includeElectives },
      replace: true,
    });
  }, [includeElectives, navigate, search]);

  return { includeElectives, setIncludeElectives };
}
