import { useEffect, useState } from 'react';

import {
  isNodeViewed,
  isNodeAccessible,
  isNodeEnrolled,
  isInitialNodeFreeFromCredits,
  checkDependencies,
} from './functions';
import { edgeStyle, useNodeStyle } from './graph-styles';

import { useFetchEnrolledSubjects } from '@/hooks/queries/student/use-fetch-enrolled-subjects';
import { useFetchCareers, type CareerOption } from '@/hooks/queries/career/use-fetch-careers';

import { useStatusActions } from '@/features/grafo/behaviors/StatusActions';

import type { GraphinData } from '@antv/graphin';
import type { AxiosError } from 'axios';
import type { Subject, SubjectNoCareers } from '@/interfaces/Subject';
import type { NodeStatuses } from '@/features/grafo/behaviors/StatusActions';
import type { Graph, Node4j } from '@/interfaces/Graph';

export default function useSubjectGraph<TData extends Subject | SubjectNoCareers>(
  data: Graph<TData> | undefined,
  selectedCareers: CareerOption[],
) {
  const careersQuery = useFetchCareers();

  const [graph, setGraph] = useState<GraphinData>({ nodes: [], edges: [] });

  const { nodeStatuses, setSubjectWithCredits } = useStatusActions();

  const { data: enrolledSubjects, error: errorEnrolledSubjects } = useFetchEnrolledSubjects({
    params: { onlyPassed: true },
  });

  const { getNodeStyle } = useNodeStyle(selectedCareers, careersQuery.data);

  useEffect(() => {
    if (data?.nodes.length === 0) {
      setGraph({ nodes: [], edges: [] });
      return;
    }

    const setEnrolledSubjects = getSetEnrolledSubjects(enrolledSubjects, errorEnrolledSubjects, nodeStatuses);

    if (!data || !setEnrolledSubjects || !getNodeStyle) return;

    // Record the prelations of each subject.
    const subjectRelations: Record<string, Set<string>> = {};
    // Record the number of dependencies each subject has.
    const subjectDependencyCount: Record<string, number> = {};

    const subjectWithCredits: TData[] = [];

    const newGraph: GraphinData = {
      edges: data.edges!.map((edge) => {
        if (!subjectRelations[edge.from]) {
          subjectRelations[edge.from] = new Set();
        }
        subjectRelations[edge.from].add(edge.to);

        if (!subjectDependencyCount[edge.to]) {
          subjectDependencyCount[edge.to] = 0;
        }
        subjectDependencyCount[edge.to] += 1;

        return {
          source: edge.from,
          target: edge.to,
          style: edgeStyle,
        };
      }),

      //@ts-ignore
      nodes: data.nodes!.map((node) => {
        const dependecyCount = subjectDependencyCount[node.id] ?? 0;

        const [isEnrolled, isAccesible] = getNodeStatus(
          node,
          setEnrolledSubjects,
          subjectRelations,
          dependecyCount,
          nodeStatuses,
        );

        if (node.data.credits + node.data.BPCredits > 0) {
          subjectWithCredits.push(node.data);
        }

        return {
          id: node.id,
          label: node.data.name,
          data: node,
          status: {
            viewed: isEnrolled,
            accesible: isAccesible,
          },

          style: getNodeStyle(node),
        };
      }),
    };

    setSubjectWithCredits(subjectWithCredits);
    setGraph(newGraph);
  }, [data, selectedCareers, enrolledSubjects, getNodeStyle]);

  return { graph };
}

function getSetEnrolledSubjects<TData extends Subject | SubjectNoCareers>(
  enrolledSubjects: string[] | undefined,
  errorEnrolledSubjects: AxiosError | null,
  nodeStatuses: NodeStatuses<TData>,
) {
  // If there is an error fetching the enrolled subjects,
  // we will use the viewed subjects from the context.
  if (errorEnrolledSubjects) {
    const enrrolledSubjects = new Set<string>(nodeStatuses.viewed.keys());

    return enrrolledSubjects;
  }

  return new Set<string>(enrolledSubjects ?? []);
}

/**
 * Determines the status of a node in the subject graph.
 * @param node - The node to determine the status for.
 * @param enrolledSubjects - A set of enrolled subjects.
 * @param subjectRelations - A record of subject relations.
 * @param dependencyCount - The number of dependencies the node has.
 * @param nodeStatuses - Responsible from maintaining the node status across different career fetchers.
 * @returns An array containing two boolean values: [isEnrolled, isAccessible].
 */
function getNodeStatus<TData extends Subject | SubjectNoCareers>(
  node: Node4j<TData>,
  enrolledSubjects: Set<string>,
  subjectRelations: Record<string, Set<string>>,
  dependencyCount: number,
  nodeStatuses: NodeStatuses<TData>,
) {
  if (isNodeViewed(node.id, nodeStatuses)) {
    return [true, false];
  }

  if (isNodeAccessible(node.id, nodeStatuses)) {
    return [false, true];
  }

  if (isNodeEnrolled(node.id, enrolledSubjects)) {
    return [true, false];
  }

  // If the node has no dependencies,  is an initial node
  if (dependencyCount === 0) {
    if (isInitialNodeFreeFromCredits(node)) {
      return [false, true];
    } else {
      return [false, false];
    }
  }

  const isAccessible = checkDependencies(node.id, enrolledSubjects, subjectRelations, dependencyCount);
  return [false, isAccessible];
}
