import { useEffect, useState } from 'react';

import { useAcademicYear } from './hooks/use-academic-year';
import { useSelectedCareer } from './hooks/use-selected-career';
import { numberToRoman } from './utils/numberToRoman';

import { cn } from '@utils/className';

import useFetchCareersOptions from '@/hooks/queries/use-FetchCareersOptions';
import { useFetchAnnualOfferByYear } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-year';

import AutoComplete from '@ui/derived/autocomplete';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

type OfferedCols = { T1: boolean; T2: boolean; T3: boolean; I: boolean };

export function OfertaAcademicTable() {
  const { year, setYear, debouncedYear } = useAcademicYear();
  const careerOptionsQuery = useFetchCareersOptions();
  const { selectedCareer, setSelectedCareer } = useSelectedCareer({
    careerOptions: careerOptionsQuery.options,
    useStudentCareersAsDefault: true,
  });

  const { data, isLoading } = useFetchAnnualOfferByYear({
    year: debouncedYear || undefined,
    career: selectedCareer?.value,
  });

  // Keep only user edits for trimesters, keyed by subject code/id
  const [offeredEdits, setOfferedEdits] = useState<Record<string, OfferedCols>>({});

  // Seed offeredEdits when data is fetched (do not compute in render)
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    setOfferedEdits((prev) => {
      const next = { ...prev };
      for (const item of data) {
        const code = item.subject.id.ID as string;
        if (!(code in next)) {
          next[code] = toOffered(item.trimesters);
        }
      }
      return next;
    });
  }, [data]);

  const toOffered = (trimesters?: { ID: string }[]): OfferedCols => {
    const offered: OfferedCols = { T1: false, T2: false, T3: false, I: false };
    trimesters?.forEach((t) => {
      const [, trimesterSymbol] = t.ID.split('-');
      if (trimesterSymbol === '1') offered.T1 = true;
      else if (trimesterSymbol === '2') offered.T2 = true;
      else if (trimesterSymbol === '3') offered.T3 = true;
      else if (trimesterSymbol === 'INTENSIVO') offered.I = true;
    });
    return offered;
  };

  const toggleOffer = (subjectCode: string, col: keyof OfferedCols) => {
    setOfferedEdits((prev) => {
      const current = prev[subjectCode] ?? { T1: false, T2: false, T3: false, I: false };
      return { ...prev, [subjectCode]: { ...current, [col]: !current[col] } };
    });
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <AutoComplete
          options={careerOptionsQuery.options || []}
          isLoading={careerOptionsQuery.isLoading}
          value={selectedCareer}
          onSelect={(option) => setSelectedCareer(option as any)}
          placeholder="Selecciona carrera"
        />
        <div className="flex items-center gap-2 text-sm">
          <span>Año:</span>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2324"
            className="bg-background h-8 w-20 rounded border border-gray-300 px-2 text-sm"
          />
        </div>
      </div>
      <Separator />

      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead colSpan={3} className="bg-muted h-10">
              <div className="font-semibold">OFERTA ACADÉMICA</div>
            </TableHead>
            <TableHead colSpan={5} className="bg-muted h-10 text-center">
              <div className="font-semibold">PERÍODOS EN QUE SE OFRECE</div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="bg-muted/50 w-16">PERIODO</TableHead>
            <TableHead className="bg-muted/50 w-28">CÓDIGO</TableHead>
            <TableHead className="bg-muted/50">ASIGNATURA</TableHead>
            <TableHead className="bg-muted/50 w-16 text-center">T1</TableHead>
            <TableHead className="bg-muted/50 w-16 text-center">T2</TableHead>
            <TableHead className="bg-muted/50 w-16 text-center">T3</TableHead>
            <TableHead className="bg-muted/50 w-16 text-center">I</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((item) => {
            const code = item.subject.id.ID as string;
            const name = item.subject.name as string;
            const period = item.period as number;
            const offered = offeredEdits[code] ?? { T1: false, T2: false, T3: false, I: false };

            return (
              <TableRow key={code} className={cn(period % 2 === 0 && 'bg-muted/40')}>
                <TableCell className="w-16 p-2 align-top font-medium">{numberToRoman(period)}</TableCell>
                <TableCell className="w-28 p-2 align-top font-mono text-xs">{code}</TableCell>
                <TableCell className="p-2 align-top">{name}</TableCell>
                {(['T1', 'T2', 'T3', 'I'] as const).map((col) => (
                  <TableCell key={col} className="p-2 text-center">
                    <Checkbox
                      checked={offered[col]}
                      onCheckedChange={() => toggleOffer(code, col)}
                      className="mx-auto"
                      disabled={isLoading}
                    />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
