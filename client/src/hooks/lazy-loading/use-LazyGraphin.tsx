import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

export default function useLazyGraphin() {
  const { data: graphinImport, ...query } = useQuery({
    queryKey: ["graphin"],
    queryFn: async () => {
      const GraphinModule = await import("@antv/graphin");

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

  const graphinContext = useContext(GraphinContext);

  return graphinContext
}
