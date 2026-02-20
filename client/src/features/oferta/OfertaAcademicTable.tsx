import { useEffect, useState } from 'react';
import { useSearch } from '@tanstack/react-router';

import { OfferHeader } from './components/OfferHeader';

import { useAcademicYear } from './hooks/search-params/use-academic-year';
import { useMutationCreateOfferForSubject } from './hooks/mutations/use-mutation-createOfferForSubject';

import { numberToRoman } from './utils/numberToRoman';

import { cn } from '@utils/className';

import { useFetchAnnualOfferByYear } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-year';

import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { ButtonLink } from '@/components/ui/link';

import type { Id } from '@/interfaces/surrealDb';
import type { SubjectEntity } from '@/interfaces/Subject';

type OfferedCols = { T1: boolean; T2: boolean; T3: boolean; I: boolean };

interface Props {
  from: '/_navLayout/oferta/' | '/_navLayout/oferta/edit';
  editMode: boolean;
}

// TODO - Considerar usar rate limiting tanto en cliente como en server
export function OfertaAcademicTable({ from, editMode }: Props) {
  const { year, setYear, debouncedYear } = useAcademicYear({ from });
  const search = useSearch({ from: from as any });

  const { data, isLoading } = useFetchAnnualOfferByYear({
    year: debouncedYear || undefined,
    career: (search as any).career,
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
      <OfferHeader year={year} setYear={setYear} from={from} showUpload={editMode} />

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
          {!data || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No se encontraron asignaturas.
              </TableCell>
            </TableRow>
          ) : (
            (data ?? []).map((item) => {
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
                    <OfferCell
                      key={col}
                      subject={item.subject}
                      col={col}
                      checked={offered[col]}
                      academicYear={(debouncedYear || '').trim()}
                      disabled={isLoading || !editMode}
                      onToggle={() => toggleOffer(code, col)}
                    />
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {!editMode && (
        <div className="text-muted-foreground flex items-center justify-center gap-2 pt-4 text-sm">
          <span>Si encuentras un error en la oferta académica puedes modificarlo aquí</span>
          <ButtonLink to="/oferta/edit" search={{}} variant="link" className="h-auto p-0 text-blue-600 underline">
            Editar oferta
          </ButtonLink>
        </div>
      )}
    </Card>
  );
}

type OfferCellProps = {
  subject: SubjectEntity;
  col: keyof OfferedCols;
  checked: boolean;
  academicYear: string;
  disabled?: boolean;
  onToggle: () => void;
};

function OfferCell({ subject, col, checked, academicYear, disabled, onToggle }: OfferCellProps) {
  // const [localPending, setLocalPending] = useState(false);
  const { createOfferMutation, deleteOfferMutation } = useMutationCreateOfferForSubject(subject);
  const mutationsPending = createOfferMutation.isPending || deleteOfferMutation.isPending;

  const handleChange = () => {
    if (disabled || mutationsPending) return;
    // Optimistic parent update

    onToggle();
    const symbol = col === 'T1' ? '1' : col === 'T2' ? '2' : col === 'T3' ? '3' : 'INTENSIVO';
    const trimesterId: Id<'trimester', `${string}-${string}`> = { Table: 'trimester', ID: `${academicYear}-${symbol}` };

    // If on error, toggle again
    if (checked) {
      deleteOfferMutation.mutate(
        { trimesterId },
        {
          onError: () => onToggle(),
        },
      );
    } else {
      createOfferMutation.mutate(
        { trimesterId },
        {
          onError: () => onToggle(),
        },
      );
    }
  };

  return (
    <TableCell className="p-2 text-center">
      {mutationsPending ? (
        <Spinner size="small" className="mx-auto" />
      ) : (
        <Checkbox checked={checked} onCheckedChange={handleChange} className="mx-auto" disabled={disabled} />
      )}
    </TableCell>
  );
}
