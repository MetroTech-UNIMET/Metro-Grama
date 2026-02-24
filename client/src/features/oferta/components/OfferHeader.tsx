import { useRef, type ChangeEvent } from 'react';
import { Upload, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { pdfFileSchema } from './schema';

import { useSelectedCareer } from '../hooks/search-params/use-selected-career';
import { useMutationUploadAnnualOfferPDF } from '../hooks/mutations/use-mutation-uploadAnnualOfferPDF';

import { useFetchCareersOptions } from '@/hooks/queries/career/use-fetch-careers';

import AutoComplete from '@ui/derived/autocomplete';
import { Button } from '@ui/button';
import { Spinner } from '@ui/spinner';

interface Props {
  year: string | undefined;
  setYear: (year: string) => void;
  from: '/_navLayout/oferta/' | '/_navLayout/oferta/edit';
  showUpload: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  changesCount?: number;
}

export function OfferHeader({
  year,
  setYear,
  from,
  showUpload,
  onSave,
  isSaving = false,
  changesCount = 0,
}: Props) {
  const careerOptionsQuery = useFetchCareersOptions();

  const { selectedCareer, setSelectedCareer } = useSelectedCareer({
    from,
    careerOptions: careerOptionsQuery.data,
    useStudentCareersAsDefault: true,
  });

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadMutation = useMutationUploadAnnualOfferPDF();

  const handleOpenFileDialog = () => fileInputRef.current?.click();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsed = pdfFileSchema.safeParse(file);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Archivo inválido';
      toast.error('Error al subir el PDF', { description: message });
      e.target.value = '';
      return;
    }

    uploadMutation.mutate(
      { file: parsed.data },
      {
        onSettled: () => {
          e.target.value = '';
        },
      },
    );
  };

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <AutoComplete
          options={careerOptionsQuery.data || []}
          isLoading={careerOptionsQuery.isLoading}
          value={selectedCareer}
          onSelect={(option) => setSelectedCareer(option as any)}
          placeholder="Selecciona carrera"
        />

        {showUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button colors={'secondary'} onClick={handleOpenFileDialog} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? <Spinner /> : <Upload />}
              {uploadMutation.isPending ? 'Subiendo…' : 'Subir PDF de la Oferta Anual'}
            </Button>

            {changesCount > 0 && onSave && (
              <Button
                onClick={onSave}
                disabled={isSaving}
                variant='outline'
                className="animate-in fade-in zoom-in slide-in-from-left-4 duration-300"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar cambios ({changesCount})
              </Button>
            )}
          </>
        )}
      </div>

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
    </header>
  );
}
