import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

export function useFilterByAverages() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });

  // State for all 6 params
  const [filters, setFilters] = useState({
    minDifficulty: search.minDifficulty ?? 0,
    maxDifficulty: search.maxDifficulty ?? 10,
    minGrade: search.minGrade ?? 0,
    maxGrade: search.maxGrade ?? 20,
    minWorkload: search.minWorkload ?? 0,
    maxWorkload: search.maxWorkload ?? 10,
  });

  const lastSynced = useRef(JSON.stringify(filters));

  useEffect(() => {
    const currentFromSearch = {
      minDifficulty: search.minDifficulty ?? 0,
      maxDifficulty: search.maxDifficulty ?? 10,
      minGrade: search.minGrade ?? 0,
      maxGrade: search.maxGrade ?? 20,
      minWorkload: search.minWorkload ?? 0,
      maxWorkload: search.maxWorkload ?? 10,
    };
    const currentStr = JSON.stringify(currentFromSearch);

    const internalStr = JSON.stringify(filters);

    if (currentStr !== internalStr) {
      setFilters(currentFromSearch);
      lastSynced.current = currentStr;
    }
  }, [
    search.minDifficulty,
    search.maxDifficulty,
    search.minGrade,
    search.maxGrade,
    search.minWorkload,
    search.maxWorkload,
  ]);

  useEffect(() => {
    const currentStr = JSON.stringify(filters);
    if (currentStr === lastSynced.current) return;

    navigate({
      to: '/horario',
      search: {
        ...search,
        ...filters,
      },
      replace: true,
    });
    lastSynced.current = currentStr;
  }, [filters, navigate]);

  const setDifficultyRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, minDifficulty: range[0], maxDifficulty: range[1] }));
  }, []);

  const setGradeRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, minGrade: range[0], maxGrade: range[1] }));
  }, []);

  const setWorkloadRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, minWorkload: range[0], maxWorkload: range[1] }));
  }, []);

  const reset = useCallback(() => {
    setFilters({
      minDifficulty: 0,
      maxDifficulty: 10,
      minGrade: 0,
      maxGrade: 20,
      minWorkload: 0,
      maxWorkload: 10,
    });
  }, []);

  return { filters, setDifficultyRange, setGradeRange, setWorkloadRange, reset };
}
