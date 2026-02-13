import { useCallback, useEffect, useMemo } from 'react';
import { type FieldErrors, type Path, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { createCareerSchema, defaultCreateCareerValues, steps } from './schema';
import { onCreate, onEdit } from './functions';
import { Step1 } from './components/steps/Step1';
import StepSubjects from './components/steps/StepSubjects';
import { numberOfTrimesters } from './constants';
import StepsNavigator from '@/components/forms/StepsNavigator';

import useSubjectOptions from './hooks/useSubjectOptions';
import { useFormStep } from '@/hooks/useFormStep/useFormStep';

import { onInvalidToast } from '@utils/forms';
import { extractShema } from '@utils/zod/zod-type-guards';

import { Tabs, TabsContent } from '@ui/tabs';
import { Form } from '@ui/form';
import { Button } from '@ui/button';
import SubmitButton from '@ui/derived/submit-button';

import type { CreateCareerInput, CreateCareerOutput, CreateSubjectInput } from './schema';
import type { CareerWithSubjects } from '@/interfaces/Career';

interface Props {
  mode: 'create' | 'edit';
  data?: CareerWithSubjects;
}

export default function CareerForm({ mode, data }: Props) {
  const {
    options: [prelationsOptions, codeOptions],
    query,
    addAdditionalSubject,
    removeAdditionalSubject,
  } = useSubjectOptions();

  const form = useForm({
    resolver: zodResolver(createCareerSchema),
    mode: 'onBlur',
    defaultValues: defaultCreateCareerValues,
  });
  const { handleSubmit, getValues } = form;

  useEffect(() => {
    if (!data) return;

    const subjectsById: Record<string, string> = {};

    const defaultData: CreateCareerInput = {
      emoji: data.emoji,
      name: data.name,
      id: data.id.ID,
      subjects: data.subjects.map((subjects) =>
        subjects.map((subject) => {
          if (!subject)
            return {
              subjectType: 'elective',
              prelations: [],
            };
          const subjectCode = subject.code.ID;

          subjectsById[subjectCode] = subject.name;

          const createSubject: CreateSubjectInput = {
            subjectType: 'existing',
            code: subjectCode,
            name: subject.name,
            credits: subject.credits,
            BPCredits: subject.BPCredits,
            prelations: subject.prelations.map(({ ID }) => ({
              value: ID,
              label: subjectsById[ID] ?? 'Materia no encontrada',
            })),
          };

          return createSubject;
        }),
      ),
    };

    form.reset(defaultData);
  }, [data]);

  // TODO - create hooks mutation for create and edit to invalidate
  async function onSubmit(formData: CreateCareerOutput) {
    let toastInfo: { title: string; description: string } = { title: '', description: '' };
    try {
      if (mode === 'create') {
        toastInfo = await onCreate(formData);
      } else {
        if (!data) return;

        const editResult = await onEdit(data, formData, form.formState.dirtyFields);
        if (!editResult) return;

        toastInfo = editResult;
      }

      toast.success(toastInfo.title, {
        ...toastInfo,
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  const onPageChange = useCallback(
    (prevPage: number) => {
      if (prevPage === 0) return;

      const subjects = getValues(`subjects.${prevPage - 1}`);
      subjects.forEach((subject) => {
        const isNewSubject = subject.subjectType === 'new';
        const code = subject.code;
        if (!code) return;
        const subjectCode = `subject:${code}`;

        if (!isNewSubject) {
          removeAdditionalSubject(subjectCode);
          return;
        }

        const name = subject.name;
        if (!name) return;

        addAdditionalSubject({
          code: {
            Table: 'subject',
            ID: subjectCode,
          },
          name,
        });
      });
    },
    [getValues, addAdditionalSubject, removeAdditionalSubject],
  );

  const onError = useCallback(
    (errors: FieldErrors<CreateCareerInput>, currentStep: number) => {
      if (currentStep === 0) return;

      console.log(errors);
      const subjects = getValues(`subjects.${currentStep - 1}`);
      subjects.forEach((subject) => {
        const code = subject.code;
        if (!code) return;
        const subjectCode = `subject:${code}`;

        removeAdditionalSubject(subjectCode);
      });

      onInvalidToast(errors);
    },
    [getValues, removeAdditionalSubject],
  );

  const stepHasErrors = useCallback(
    (step: (typeof steps)[number], index: number, errors: FieldErrors<CreateCareerInput>) => {
      if (!step.schema) return false;

      if (index === 0) {
        const extracted = extractShema(step.schema);
        const careerSchemaKeys = Object.keys(extracted.shape);
        const hasError = careerSchemaKeys.some((key) => {
          return errors[key as keyof FieldErrors<CreateCareerInput>] !== undefined;
        });
        return hasError;
      }

      const currentSubjectStep = index - 1;
      if (errors.subjects) {
        return errors.subjects[currentSubjectStep] !== undefined;
      }

      return false;
    },
    [],
  );

  const { currentStep, next, previous, jumpTo, jumpToFirstErrorStep } = useFormStep({
    steps,
    form,
    onPageChange: onPageChange,
    onError,
    transformErrors,
    filterPaths,
  });

  const trimesterStepsForm = useMemo(
    () =>
      Array.from({ length: numberOfTrimesters }).map((_, trimesterIndex) => (
        <TabsContent key={trimesterIndex} value={steps[trimesterIndex + 1].id.toString()}>
          <StepSubjects
            trimesterIndex={trimesterIndex}
            mode={mode}
            codeOptions={codeOptions}
            prelationsOptions={prelationsOptions}
            isLoading={query.isLoading}
          />
        </TabsContent>
      )),
    [codeOptions, prelationsOptions, mode, query.isLoading],
  );

  return (
    <Form {...form}>
      <Tabs asChild value={String(steps[currentStep].id)}>
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            onInvalidToast(errors);
            jumpToFirstErrorStep();
          })}
          className="bg-background p-16"
        >
          <StepsNavigator
            jumpTo={jumpTo}
            steps={steps}
            currentStep={currentStep}
            headerClassName="mb-8"
            errors={form.formState.errors}
            touchedFields={form.formState.touchedFields}
            stepHasErrors={stepHasErrors}
          />

          <TabsContent value="Carrera">
            <Step1 mode={mode} />
          </TabsContent>

          {trimesterStepsForm}

          <footer className="mt-8 flex flex-row items-center gap-4">
            <Button type="button" onClick={() => previous()} size="icon" colors="secondary">
              <ArrowLeft />
            </Button>

            <SubmitButton colors="primary" disabled={currentStep === steps.length }>
              {mode === 'edit' ? 'Editar' : 'Crear'} Carrera
            </SubmitButton>
            <Button type="button" onClick={() => next('ignoreValidation')} size="icon" colors="secondary">
              <ArrowRight />
            </Button>
          </footer>

          {/* <DevTool control={form.control} /> */}
        </form>
      </Tabs>
    </Form>
  );
}

function transformErrors(errors: FieldErrors<CreateCareerInput>, currentStep: number) {
  if (currentStep === 0) return errors;

  const stepIndex = currentStep - 1;
  const subjectErrors = errors?.subjects?.[stepIndex];
  return { subjects: { [stepIndex]: subjectErrors } };
}

function filterPaths(paths: Path<CreateCareerInput>[], steps: number) {
  if (steps === 0) return paths;

  const subjectPath = `subjects.${steps - 1}`;
  return paths.filter((path) => {
    return path.startsWith(subjectPath) || path === 'subjects';
  });
}
