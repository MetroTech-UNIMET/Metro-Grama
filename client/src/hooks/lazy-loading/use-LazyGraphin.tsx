import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { queryKeys } from '@/lib/query-keys';

export default function useLazyGraphin() {
  const { data: graphinImport, ...query } = useQuery({
    queryKey: queryKeys.lazy.graphin.queryKey,
    queryFn: async () => {
      const GraphinModule = await import('@antv/graphin');

      const Graphin = GraphinModule.default;

      return { Graphin, ...GraphinModule };
    },
  });

  return { graphinImport, ...query };
}

export function useLazyGraphinContext() {
  const { graphinImport } = useLazyGraphin();

  if (!graphinImport) return null;

  const { GraphinContext } = graphinImport;

  const graphinContext = use(GraphinContext);

  return graphinContext;
}
