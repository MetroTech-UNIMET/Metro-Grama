import { useCallback, useRef, useState } from 'react';

export function useSectionEnrollmentAdjustments() {
  const initialSelectedSectionsRef = useRef<Set<string>>(new Set());
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const setInitialSelectedSections = useCallback((sectionIds: string[]) => {
    initialSelectedSectionsRef.current = new Set(sectionIds);
    setAdjustments({});
  }, []);

  const handleAddSelection = useCallback((sectionId: string | undefined) => {
    if (!sectionId) return;
    setAdjustments((prev) => {
      const next = { ...prev };
      const wasInitiallySelected = initialSelectedSectionsRef.current.has(sectionId);
      if (wasInitiallySelected) {
        delete next[sectionId];
      } else {
        next[sectionId] = 1;
      }
      return next;
    });
  }, []);

  const handleRemoveSelection = useCallback((sectionId: string | undefined) => {
    if (!sectionId) return;
    setAdjustments((prev) => {
      const next = { ...prev };
      const wasInitiallySelected = initialSelectedSectionsRef.current.has(sectionId);
      if (wasInitiallySelected) {
        next[sectionId] = -1;
      } else {
        delete next[sectionId];
      }
      return next;
    });
  }, []);

  const getAdjustedCount = useCallback(
    (sectionId: string | undefined, baseCount: number) => {
      if (!sectionId) return baseCount;
      const delta = adjustments[sectionId] ?? 0;
      return Math.max(0, baseCount + delta);
    },
    [adjustments],
  );

  return {
    setInitialSelectedSections,
    handleAddSelection,
    handleRemoveSelection,
    getAdjustedCount,
  };
}
