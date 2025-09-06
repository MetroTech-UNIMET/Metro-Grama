import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import type { TrimesterOption } from '@/hooks/queries/trimester/use-FetchTrimesters';

interface Props {
  trimesterOptions: TrimesterOption[];
}

export function useSelectedTrimester({ trimesterOptions }: Props) {
  const navigate = useNavigate();
  const search = useSearch({ from: '/horario/' });

  const [selectedTrimester, setSelectedTrimester] = useState<TrimesterOption | undefined>(
    search.trimester !== 'none'
      ? {
          label: search.trimester,
          value: search.trimester,
          data: undefined,
        }
      : undefined,
  );

  const initializedRef = useRef(false);
  // Prefer URL trimester if present (and valid), else compute default from options
  const initialTrimesterId = useMemo(
    () => (search?.trimester && search.trimester !== 'none' ? search.trimester : ''),
    [search?.trimester],
  );

  // TODO - Considerar usar queryClient.ensureQueryData en vez de pasar por props
  useEffect(() => {
    if (initializedRef.current) return;
    if (trimesterOptions.length === 0) return;

    let initial: TrimesterOption | undefined;
    if (initialTrimesterId) {
      initial = trimesterOptions.find((t) => t.value === initialTrimesterId);
    }
    if (!initial) {
      initial = getInitialTrimester(trimesterOptions);
    }

    setSelectedTrimester(initial);
    initializedRef.current = true;
  }, [trimesterOptions, initialTrimesterId]);

  // Keep URL in sync when selection changes
  useEffect(() => {
    const newValue = selectedTrimester?.value ?? 'none';
    if ((search?.trimester ?? 'none') !== newValue) {
      navigate({
        to: '/horario',
        search: { ...search, trimester: newValue || 'none' },
        replace: true,
      });
    }
  }, [selectedTrimester, navigate, search?.trimester]);

  return {
    selectedTrimester,
    setSelectedTrimester,
  };
}

export function getInitialTrimester(trimestersOptions: TrimesterOption[]) {
  let found: TrimesterOption | undefined = undefined;
  for (const option of trimestersOptions) {
    if (option.data?.is_current) {
      found = option;
      break;
    }
    if (!found && option.data?.is_next) {
      found = option;
    }
  }
  return found;
}
