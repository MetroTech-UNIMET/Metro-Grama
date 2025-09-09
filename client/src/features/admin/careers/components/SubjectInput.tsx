import { memo, useState } from 'react';
import { BanIcon, XIcon } from 'lucide-react';

import { cn } from '@utils/className';

import { FormInputField } from '@ui/derived/form-fields/form-field-input';
import { FormAutocompleteField } from '@ui/derived/form-fields/form-field-autocomplete';
import { FormMultipleSelectorField } from '@ui/derived/form-fields/form-field-multiselect';
import { FormControl, FormField, FormItem, FormLabel } from '@ui/form';
import { Switch } from '@ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipArrow } from '@ui/tooltip';
import { Skeleton } from '@ui/skeleton';

import type { Option } from '@ui/types/option.types';
import type { CreateCareerFormInput, CreateSubjectType } from '../schema';
import type { FieldError, FieldErrors, UseFormResetField, UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import type { CodeOption } from '../hooks/useSubjectOptions';
import type { Subject } from '@/interfaces/Subject';

type SubjectErrors = FieldErrors<CreateSubjectType> | undefined;

interface Props {
  setValue: UseFormSetValue<CreateCareerFormInput>;
  resetField: UseFormResetField<CreateCareerFormInput>;
  trigger: UseFormTrigger<CreateCareerFormInput>;

  subjectIndex: number;
  trimesterIndex: number;

  codeOptions: CodeOption[];
  prelationOptions: Option[];
  loadingSubjects: boolean;

  isSubjectElective: boolean;
  isModeEdit?: boolean;
  error: SubjectErrors;
}

// FIXME - Al hacer tab en Autocomplete con un codigo existente, no la selecciona sino que es como si fuera materia nueva
// FIXME - Problemas de re-render cuando se seleccio un codigo -> Afecta a otras materias
// FIXME - Cuando el codigo no existe y lo demás estaba disabled, al hacer focus focusea el switch
// y no el nombre
// TODO - Afer submission, show error tooltip if there are errors
function SubjectInput({
  setValue,
  resetField,
  trigger,
  subjectIndex,
  trimesterIndex,
  codeOptions,
  prelationOptions,
  loadingSubjects,

  isModeEdit = false,
  isSubjectElective,
  error,
}: Props) {
  const subjectName = `subjects.${trimesterIndex}.${subjectIndex}` as const;
  const [usingExistingSubject, setUsingExistingSubject] = useState(isModeEdit);

  //  onMouseLeave={handleTooltipClose}
  // TODO - Mejorar responsive
  return (
    <div className="flex flex-row gap-4">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <div className="w-full space-y-4">
            <fieldset className="flex flex-row gap-4">
              <FormAutocompleteField
                name={`${subjectName}.code`}
                label="Código de la materia"
                disabled={isSubjectElective}
                placeholder="Código"
                options={codeOptions as Option[]}
                emptyIndicator={'No hay materias para escoger'}
                // listRelativeContainerClassName="z-99"
                isLoading={loadingSubjects}
                allowFreeInput={true}
                // inputWrapperClassName={cn({
                //   'bg-destructive/10 border-destructive': fieldState.invalid,
                //   'bg-success/10 border-success': !fieldState.invalid && fieldState.isTouched,
                // })}
                onSelect={(option) => {
                  console.log('onSelect', option);
                  const subject: Subject = (option as any).subject;
                  const setValueOption = {
                    shouldTouch: true,
                    shouldValidate: true,
                  };

                  setValue(`${subjectName}.name`, subject.name, setValueOption);
                  setValue(`${subjectName}.credits`, subject.credits, setValueOption);
                  setValue(`${subjectName}.BPCredits`, subject.BPCredits, setValueOption);
                }}
                onValueChange={(value) => {
                  const setValueOption = {
                    shouldTouch: true,
                    shouldValidate: true,
                    shouldDirty: true,
                  };
                  if (typeof value === 'string') {
                    if (usingExistingSubject === false) return;
                    setUsingExistingSubject(false);
                    resetField(`${subjectName}.name`);
                    resetField(`${subjectName}.credits`);
                    resetField(`${subjectName}.BPCredits`);
                    resetField(`${subjectName}.subjectType`);
                    setValue(`${subjectName}.subjectType`, 'new', setValueOption);
                  } else {
                    setUsingExistingSubject(true);
                    setValue(`${subjectName}.subjectType`, 'existing', setValueOption);
                  }
                }}
              />

              <FormInputField
                name={`${subjectName}.name`}
                id={`${subjectName}.name`}
                label="Nombre de la materia"
                containerClassName="w-full h-full"
                readOnly={usingExistingSubject && !isModeEdit}
                disabled={isSubjectElective}
                showErrors={false}
              />

              <FormField
                name={`${subjectName}.subjectType`}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem className="mt-auto flex flex-col space-y-2">
                    <FormLabel>Electiva?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={value === 'elective'}
                        onCheckedChange={(checked) => {
                          onChange(checked ? 'elective' : 'existing');
                          if (checked) {
                            trigger(`${subjectName}.code`);
                            trigger(`${subjectName}.name`);
                            trigger(`${subjectName}.credits`);
                            trigger(`${subjectName}.BPCredits`);
                          } else {
                            setValue(`${subjectName}.code`, '');
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </fieldset>

            <fieldset className="flex flex-row gap-4">
              <FormInputField
                name={`${subjectName}.credits`}
                id={`${subjectName}.credits`}
                label="Créditos Necesarios"
                type="number"
                min={0}
                max={150}
                containerClassName="max-w-40 w-full h-full"
                readOnly={usingExistingSubject && !isModeEdit}
                disabled={isSubjectElective}
              />

              <FormInputField
                name={`${subjectName}.BPCredits`}
                id={`${subjectName}.BPCredits`}
                label="Créditos BP Necesarios"
                type="number"
                min={0}
                max={150}
                containerClassName="max-w-44 w-full h-full"
                readOnly={usingExistingSubject && !isModeEdit}
                disabled={isSubjectElective}
              />

              <FormMultipleSelectorField
                name={`${subjectName}.prelations`}
                disabled={isSubjectElective}
                label="Prelaciones"
                options={prelationOptions}
                placeholder="Escoje las prelaciones "
                isLoading={loadingSubjects}
                // className={cn('flex h-full w-full items-center', {
                //   'bg-destructive/10': fieldState.invalid && fieldState.isTouched,
                //   'bg-success/10': !fieldState.invalid && fieldState.isTouched,
                // })}
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                    No se encontraron materias.
                  </p>
                }
                loadingIndicator={
                  <div className="p-1">
                    <Skeleton className="h-8 w-full" />
                  </div>
                }
                containerClassName="w-full mt-auto"
                maxSelected={3}
              />
            </fieldset>
          </div>

          {/* TODO - Analizar como prohibir que se abra si no hay errores */}
          <aside className="flex items-center">
            <TooltipTrigger disabled={!error} type="button">
              <div
                className={cn(
                  'text-destructive bg-destructive/10 hover:bg-destructive hover:text-UI-white flex h-10 w-10 items-center justify-center rounded-full duration-300',
                  { 'pointer-events-none opacity-10': !error },
                )}
              >
                <BanIcon />
              </div>
            </TooltipTrigger>
          </aside>

          {error && <ErrorTooltip errors={error} />}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function ErrorTooltip({ errors }: { errors: SubjectErrors }) {
  return (
    <TooltipContent sideOffset={-2} side="top">
      <div className="flex flex-col gap-2">
        <ErrorMessage field="Código" error={errors?.code} />
        <ErrorMessage field="Nombre" error={errors?.name} />
        <ErrorMessage field="Créditos" error={errors?.credits} />
        <ErrorMessage field="Créditos BP" error={errors?.BPCredits} />

        {/* FIXME - Como prelations es un objeto, es más complicado trabajar sus sub-errores */}
        {/* <ErrorMessage field="Prelaciones" error={errors?.prelations} /> */}
      </div>
      <TooltipArrow className="fill-popover shadow-lg" />
    </TooltipContent>
  );
}

function ErrorMessage({ field, error }: { field: string; error?: FieldError }) {
  if (!error) return null;
  return (
    <div className="flex flex-row items-center gap-1">
      <XIcon className="text-destructive h-4 w-4" />

      <span className="flex flex-row items-center gap-1">
        <p className="text-destructive font-semibold">{field}: </p>
        <p className="text-destructive/80">{error.message}</p>
      </span>
    </div>
  );
}

export default memo(SubjectInput);
