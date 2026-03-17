import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

type ValidRoutes = '/_navLayout/oferta/' | '/_navLayout/oferta/edit';

export function useIncludeElectives({ from }: { from: ValidRoutes }) {
  const navigate = useNavigate();
  const search = useSearch({ from });

  const [includeElectives, setIncludeElectives] = useState(search.includeElectives);

  useEffect(() => {
    setIncludeElectives(search.includeElectives);
  }, [search.includeElectives]);

  useEffect(() => {
    const current = search.includeElectives;
    if (current === includeElectives) return;

    navigate({
      to: normalizeForm(from),
      search: { ...search, includeElectives },
      replace: true,
    });
  }, [includeElectives, navigate, search, from]);

  return { includeElectives, setIncludeElectives };
}

function normalizeForm(from: ValidRoutes) {
  return from.split('/_navLayout')[1] as '/oferta' | '/oferta/edit';
}
