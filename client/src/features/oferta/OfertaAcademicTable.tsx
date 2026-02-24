import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { OfferHeader } from './components/OfferHeader';
import { ConfirmSaveDialog } from './components/ConfirmSaveDialog';
import { useAcademicYear } from './hooks/search-params/use-academic-year';
import { numberToRoman } from './utils/numberToRoman';

import { useFetchAnnualOfferByYear } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-year';
import {
  useMutationBatchUpdateOffers,
  type BatchUpdatePayload,
} from './hooks/mutations/use-mutation-batch-update-offers';

import { cn } from '@utils/className';

import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ButtonLink } from '@/components/ui/link';

type OfferedCols = { [key: string]: boolean }; // T1, T2, T3, I or others if needed

interface Props {
  from: '/_navLayout/oferta/' | '/_navLayout/oferta/edit';
  editMode: boolean;
}

export function OfertaAcademicTable({ from, editMode }: Props) {
  const { year, setYear, debouncedYear } = useAcademicYear({ from });
  const search = useSearch({ from });

  const { executeRecaptcha } = useGoogleReCaptcha();

  const { data, isLoading } = useFetchAnnualOfferByYear({
    year: debouncedYear || undefined,
    career: search.career,
  });

  const batchMutation = useMutationBatchUpdateOffers();

  const [localOffers, setLocalOffers] = useState<Record<string, OfferedCols>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Helper to convert array of trimester objects to boolean map
  const toOfferedMap = (trimesters?: { ID: string }[]) => {
    const map: OfferedCols = { T1: false, T2: false, T3: false, I: false };
    trimesters?.forEach((t) => {
      const [, suffix] = t.ID.split('-');
      if (suffix === '1') map.T1 = true;
      else if (suffix === '2') map.T2 = true;
      else if (suffix === '3') map.T3 = true;
      else if (suffix === 'INTENSIVO') map.I = true;
    });
    return map;
  };

  // Synch local state with fetched data when it changes
  useEffect(() => {
    if (!data) return;
    const initial: Record<string, OfferedCols> = {};
    data.forEach((item) => {
      initial[item.subject.id.ID as string] = toOfferedMap(item.trimesters);
    });
    setLocalOffers(initial);
  }, [data]);

  const toggleOffer = (subjectId: string, col: string) => {
    if (!editMode) return;
    setLocalOffers((prev) => {
      const row = prev[subjectId] || { T1: false, T2: false, T3: false, I: false };
      return {
        ...prev,
        [subjectId]: { ...row, [col]: !row[col] },
      };
    });
  };

  // Calculate changes derived from data vs localOffers
  const changes = useMemo(() => {
    if (!data) return [];
    const diffs: BatchUpdatePayload['changes'] = [];

    data.forEach((item) => {
      const subjectId = item.subject.id.ID as string;
      const original = toOfferedMap(item.trimesters);
      const current = localOffers[subjectId];

      if (!current) return;

      const addList: string[] = [];
      const removeList: string[] = [];

      (['T1', 'T2', 'T3', 'I'] as const).forEach((col) => {
        if (current[col] !== original[col]) {
          // Map col back to trimester ID suffix
          const suffix = col === 'T1' ? '1' : col === 'T2' ? '2' : col === 'T3' ? '3' : 'INTENSIVO';
          const trimesterId = `${debouncedYear}-${suffix}`;

          if (current[col]) {
            addList.push(trimesterId);
          } else {
            removeList.push(trimesterId);
          }
        }
      });

      if (addList.length > 0 || removeList.length > 0) {
        diffs.push({ subjectId, add: addList, remove: removeList });
      }
    });

    return diffs;
  }, [data, localOffers, debouncedYear]);

  const hasChanges = changes.length > 0;

  const handleSaveClick = () => {
    if (!hasChanges) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = useCallback(async () => {
    if (!executeRecaptcha) return;

    try {
      const token = await executeRecaptcha('batch_update_offers');
      await batchMutation.mutateAsync({ changes, captcha: token });
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('ReCAPTCHA failed:', error);
    }
  }, [changes, executeRecaptcha, batchMutation]);

  return (
    <Card className="space-y-4 p-4">
      <OfferHeader
        year={year}
        setYear={setYear}
        from={from}
        showUpload={editMode}
        onSave={handleSaveClick}
        isSaving={batchMutation.isPending}
        changesCount={changes.length}
      />

      <ConfirmSaveDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmSave}
        isLoading={batchMutation.isPending}
        changes={changes}
      />

      <div className="relative w-full overflow-auto">
        <Table className="min-w-150">
          <TableHeader>
            <TableRow>
              <TableHead colSpan={3} className="bg-muted h-10">
                <div className="font-semibold">OFERTA ACADÉMICA</div>
              </TableHead>
              <TableHead colSpan={4} className="bg-muted h-10 text-center">
                <div className="font-semibold">PERÍODOS EN QUE SE OFRECE</div>
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="bg-muted/50 w-16">PEROIODO</TableHead>
              <TableHead className="bg-muted/50 w-24">CÓDIGO</TableHead>
              <TableHead className="bg-muted/50">ASIGNATURA</TableHead>
              <TableHead className="bg-muted/50 w-16 text-center">T1</TableHead>
              <TableHead className="bg-muted/50 w-16 text-center">T2</TableHead>
              <TableHead className="bg-muted/50 w-16 text-center">T3</TableHead>
              <TableHead className="bg-muted/50 w-16 text-center">I</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !data ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="text-muted-foreground mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                  No se encontraron asignaturas para esta selección.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const code = item.subject.id.ID as string;
                const name = item.subject.name as string;
                const period = item.period as number;
                const rowState = localOffers[code] || { T1: false, T2: false, T3: false, I: false };

                return (
                  <TableRow key={code} className={cn(period % 2 === 0 && 'bg-muted/30 hover:bg-muted/50')}>
                    <TableCell className="text-muted-foreground font-medium">{numberToRoman(period)}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{code}</TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    {(['T1', 'T2', 'T3', 'I'] as const).map((col) => (
                      <TableCell key={col} className="p-0 text-center">
                        <div className="flex h-full w-full items-center justify-center py-2">
                          <Checkbox
                            checked={rowState[col]}
                            onCheckedChange={() => toggleOffer(code, col)}
                            disabled={!editMode || batchMutation.isPending}
                          />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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
