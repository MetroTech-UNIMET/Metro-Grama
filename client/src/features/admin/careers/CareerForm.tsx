import { useEffect, useMemo } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { createCareerSchema, defaultCreateCareerValues, steps } from './schema';
import { onCreate, onEdit } from './functions';
import { Step1 } from './components/steps/Step1';
import StepSubjects from './components/steps/StepSubjects';
import { numberOfTrimesters } from './constants';
import StepsNavigator from './components/StepsNavigator';

import useSubjectOptions from './hooks/useSubjectOptions';
import useFormStep from '@/hooks/useFormStep';

import { onInvalidToast } from '@utils/forms';
import { extractShema } from '@utils/zod/zod-type-guards';

import { Tabs, TabsContent } from '@ui/tabs';
import { Spinner } from '@ui/spinner';
import { Form } from '@ui/form';
import { Button } from '@ui/button';

import type { CreateCareerFormType, CreateSubjectType } from './schema';
import type { CareerWithSubjects } from '@/interfaces/Career';

interface Props {
  mode: 'create' | 'edit';
  data?: CareerWithSubjects;
}

// TODO - Transiciones entre los pasos
export default function CareerForm({ mode, data }: Props) {
  const {
    options: [prelationsOptions, codeOptions],
    query,
    addAdditionalSubject,
    removeAdditionalSubject,
  } = useSubjectOptions();

  const form = useForm<CreateCareerFormType>({
    resolver: standardSchemaResolver(createCareerSchema),
    mode: 'onBlur',
    defaultValues: defaultCreateCareerValues,
  });
  const { handleSubmit } = form;

  useEffect(() => {
    if (!data) return;

    const subjectsById: Record<string, string> = {};

    const defaultData: CreateCareerFormType = {
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

          subjectsById[subject.code.ID] = subject.name;

          const createSubject: CreateSubjectType = {
            subjectType: 'existing',
            code: subject.code.ID,
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

  async function onSubmit(formData: CreateCareerFormType) {
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

  const { currentStep, next, previous, jumpTo, jumpToFirstErrorStep } = useFormStep({
    steps,
    form,
    onPageChange: (prevPage) => {
      if (currentStep === 0) return;

      const subjects = form.getValues(`subjects.${prevPage - 1}`);
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
    onError: (errors, currentStep) => {
      if (currentStep === 0) return;

      const subjects = form.getValues(`subjects.${currentStep - 1}`);
      subjects.forEach((subject) => {
        const code = subject.code;
        if (!code) return;
        const subjectCode = `subject:${code}`;

        removeAdditionalSubject(subjectCode);
      });

      onInvalidToast(errors);
    },
    transformErrors: (errors, currentStep) => {
      if (currentStep === 0) return errors;

      const stepIndex = currentStep - 1;
      const subjectErrors = errors?.subjects?.[stepIndex];
      return { subjects: { [stepIndex]: subjectErrors } };
    },
    filterPaths: (paths, steps) => {
      if (steps === 0) return paths;

      const subjectPath = `subjects.${steps - 1}`;
      return paths.filter((path) => {
        return path.startsWith(subjectPath) || path === 'subjects';
      });
    },
  });

  const trimesterStepsForm = useMemo(
    () =>
      Array.from({ length: numberOfTrimesters }).map((_, trimesterIndex) => (
        <TabsContent value={steps[trimesterIndex + 1].id.toString()} key={trimesterIndex}>
          <StepSubjects
            trimesterIndex={trimesterIndex}
            form={form}
            mode={mode}
            codeOptions={codeOptions}
            prelationsOptions={prelationsOptions}
            isLoading={query.isLoading}
          />
        </TabsContent>
      )),
    [codeOptions, prelationsOptions, form, mode, query.isLoading],
  );

  return (
    <Form {...form}>
      <Tabs asChild value={String(steps[currentStep].id)}>
        <form
          onSubmit={handleSubmit(onSubmit, async (errors) => {
            onInvalidToast(errors);
            await jumpToFirstErrorStep();
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
            stepHasErrors={(step, index, errors) => {
              if (!step.schema) return false;

              if (index === 0) {
                const extracted = extractShema(step.schema);
                const careerSchemaKeys = Object.keys(extracted.shape);
                const hasError = careerSchemaKeys.some((key) => {
                  return errors[key as keyof FieldErrors<CreateCareerFormType>] !== undefined;
                });
                return hasError;
              }

              const currentSubjectStep = index - 1;
              if (errors.subjects) {
                return errors.subjects[currentSubjectStep] !== undefined;
              }

              return false;
            }}
          />

          <TabsContent value="Carrera">
            <Step1 mode={mode} />
          </TabsContent>

          {currentStep >= 1 && <>{trimesterStepsForm[currentStep - 1]}</>}

          <footer className="mt-8">
            <Button type="button" onClick={() => previous()} size="icon">
              <ArrowLeft />
            </Button>

            <Button type="button" onClick={async () => await next('callOnError')} size="icon">
              <ArrowRight />
            </Button>
          </footer>

          <Button type="submit" className="mt-8 gap-x-2" disabled={form.formState.isSubmitting}>
            <Spinner className="text-white" show={form.formState.isSubmitting} />
            {mode === 'edit' ? 'Editar' : 'Crear'} Carrera
          </Button>

          {/* <DevTool control={form.control} /> */}
        </form>
      </Tabs>
    </Form>
  );
}
