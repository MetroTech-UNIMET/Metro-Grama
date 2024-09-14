import { memo, useState } from "react";
import { BanIcon, XIcon } from "lucide-react";

import { cn } from "@utils/className";

import { TooltipArrow } from "@radix-ui/react-tooltip";
import { FloatingLabelInputField } from "@ui/derived/floating-label-input";
import { FormControl, FormField, FormItem, FormLabel } from "@ui/form";
import { Switch } from "@ui/switch";
import MultipleSelector from "@ui/derived/multidropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { Skeleton } from "@ui/skeleton";
import AutoComplete from "@ui/derived/autocomplete";

import type { Option } from "@ui/derived/multidropdown";
import type { CreateCareerFormType, CreateSubjectType } from "./schema";
import type {
  FieldError,
  FieldErrors,
  UseFormResetField,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";
import type { CodeOption } from "./hooks/useSubjectOptions";
import type { Subject } from "@/interfaces/Subject";

type SubjectErrors = FieldErrors<CreateSubjectType> | undefined;

interface Props {
  setValue: UseFormSetValue<CreateCareerFormType>;
  resetField: UseFormResetField<CreateCareerFormType>;
  trigger: UseFormTrigger<CreateCareerFormType>;

  subjectIndex: number;
  trimesterIndex: number;

  codeOptions: CodeOption[];
  prelationOptions: Option[];
  loadingSubjects: boolean;

  isSubjectElective: boolean;
  initialExistingSubject?: boolean;
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

  initialExistingSubject = false,
  isSubjectElective,
  error,
}: Props) {
  const subjectName = `subjects.${trimesterIndex}.${subjectIndex}` as const;
  const [usingExistingSubject, setUsingExistingSubject] = useState(initialExistingSubject);

  //  onMouseLeave={handleTooltipClose}
  // TODO - Mejorar responsive
  return (
    <div className="flex flex-row gap-4">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <div className="w-full space-y-4">
            <fieldset className="flex flex-row gap-4 ">
              <FormField
                name={`${subjectName}.code`}
                disabled={isSubjectElective}
                render={({ field: { ref, ...field }, fieldState }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <AutoComplete
                        placeholder="Código"
                        options={codeOptions as Option[]}
                        emptyMessage={"No hay materias para escoger"}
                        listRelativeContainerClassName="z-[99]"
                        isLoading={loadingSubjects}
                        allowFreeInput={true}
                        inputWrapperClassName={cn({
                          "bg-destructive/10 border-destructive":
                            fieldState.invalid,
                          "bg-success/10 border-success":
                            !fieldState.invalid && fieldState.isTouched,
                        })}
                        customOnSelectLabeling={(option) => option.value}
                        onSelect={(option) => {
                          const subject: Subject = (option as any).subject;
                          const setValueOption = {
                            shouldTouch: true,
                            shouldValidate: true,
                          };

                          setValue(
                            `${subjectName}.name`,
                            subject.name,
                            setValueOption
                          );
                          setValue(
                            `${subjectName}.credits`,
                            subject.credits,
                            setValueOption
                          );
                          setValue(
                            `${subjectName}.BPCredits`,
                            subject.BPCredits,
                            setValueOption
                          );
                        }}
                        onValueChange={(value) => {
                          const setValueOption = {
                            shouldTouch: true,
                            shouldValidate: true,
                            shouldDirty: true,
                          };
                          if (typeof value === "string") {
                            if (usingExistingSubject === false) return;
                            setUsingExistingSubject(false);

                            resetField(`${subjectName}.name`);
                            resetField(`${subjectName}.credits`);
                            resetField(`${subjectName}.BPCredits`);
                            resetField(`${subjectName}.subjectType`);

                            setValue(
                              `${subjectName}.subjectType`,
                              "new",
                              setValueOption
                            );
                          } else {
                            setUsingExistingSubject(true);
                            setValue(
                              `${subjectName}.subjectType`,
                              "existing",
                              setValueOption
                            );
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FloatingLabelInputField
                name={`${subjectName}.name`}
                id={`${subjectName}.name`}
                label="Nombre de la materia"
                containerClassname="w-ful  h-full"
                readOnly={usingExistingSubject}
                disabled={isSubjectElective}
              />

              {/* TODO - Mejor tamaño */}
              <FormField
                name={`${subjectName}.subjectType`}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem className="space-y-2 flex flex-col">
                    <FormLabel>Electiva?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={value === "elective"}
                        onCheckedChange={(checked) => {
                          onChange(checked ? "elective" : "existing");
                          if (checked) {
                            trigger(`${subjectName}.code`);
                            trigger(`${subjectName}.name`);
                            trigger(`${subjectName}.credits`);
                            trigger(`${subjectName}.BPCredits`);
                          } else {
                            setValue(`${subjectName}.code`, "");
                          }
                        }}
                        size="sm"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </fieldset>

            <fieldset className="flex flex-row gap-4">
              <FloatingLabelInputField
                name={`${subjectName}.credits`}
                id={`${subjectName}.credits`}
                label="Créditos Necesarios"
                type="number"
                min={0}
                max={150}
                containerClassname="max-w-[10rem] w-full h-full"
                readOnly={usingExistingSubject}
                disabled={isSubjectElective}
              />

              <FloatingLabelInputField
                name={`${subjectName}.BPCredits`}
                id={`${subjectName}.BPCredits`}
                label="Créditos BP Necesarios"
                type="number"
                min={0}
                max={150}
                containerClassname="max-w-[11rem] w-full h-full"
                readOnly={usingExistingSubject}
                disabled={isSubjectElective}
              />

              <FormField
                name={`${subjectName}.prelations`}
                disabled={isSubjectElective}
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      {/* TODO - Mejorar styling disabled */}
                      <MultipleSelector
                        {...field}
                        options={prelationOptions}
                        placeholder="Escoje las prelaciones "
                        loadingOptions={loadingSubjects}
                        listRelativeContainerClassName="z-[99]"
                        className={cn("h-full w-full flex items-center", {
                          "bg-destructive/10":
                            fieldState.invalid && fieldState.isTouched,
                          "bg-success/10":
                            !fieldState.invalid && fieldState.isTouched,
                        })}
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
                        maxSelected={3}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* 
              <Controller
                control={control}
                name={`${subjectName}.prelations`}
                render={({ field }) => (
                  <MultipleSelector
                    {...field}
                    options={prelationOptions}
                    placeholder="Escoje las prelaciones de esta materia"
                    loadingOptions={loadingSubjects}
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
                    maxSelected={3}
                  />
                )}
              /> */}
            </fieldset>
          </div>

          {/* TODO - Analizar como prohibir que se abra si no hay errores */}
          <aside className="flex items-center">
            <TooltipTrigger disabled={!error} type="button">
              <div
                className={cn(
                  "flex items-center justify-center text-destructive bg-destructive/10 hover:bg-destructive hover:text-UI-white rounded-full duration-300 h-10 w-10",
                  { "opacity-10 pointer-events-none": !error }
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
    <div className="flex flex-row gap-1 items-center">
      <XIcon className="w-4 h-4 text-destructive" />

      <span className="flex flex-row gap-1 items-center">
        <p className="text-destructive font-semibold">{field}: </p>
        <p className="text-destructive/80">{error.message}</p>
      </span>
    </div>
  );
}

export default memo(SubjectInput);
