import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DevTool } from "@hookform/devtools";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  createCareerSchema,
  defaultCreateCareerValues,
  numberOfSubjectsByTrimester,
  numberOfTrimesters,
  steps,
  groupedFieldNames,
} from "./schema";

import useFormStep from "@/hooks/useFormStep";
import useFormSubmit from "@/hooks/useFormSubmit";
import useSubjectOptions from "./hooks/useSubjectOptions";

import { forEachPromiseAll } from "@utils/promises";
import { surrealIdToId } from "@utils/queries";
import { onCreate, onEdit } from "./functions";

import StepsNavigator from "./StepsNavigator";
import SubjectInput from "./SubjectInput";
import { Spinner } from "@ui/spinner";
import { FloatingLabelInputField } from "@ui/derived/floating-label-input";
import { Form } from "@ui/form";
import { Button } from "@ui/button";

import type { CreateCareerFormType, CreateSubjectType } from "./schema";
import type { CareerWithSubjects } from "@/interfaces/Career";

interface Props {
  mode: "create" | "edit";
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
    resolver: zodResolver(createCareerSchema),
    mode: "onBlur",
    defaultValues: defaultCreateCareerValues,
  });

  useEffect(() => {
    if (!data) return;

    const subjectsById: Record<string, string> = {};

    const defaultData: CreateCareerFormType = {
      emoji: data.emoji,
      name: data.name,
      subjects: data.subjects.map((subjects) =>
        subjects.map((subject) => {
          if (!subject)
            return {
              subjectType: "elective",
              code: "",
              name: "",
              prelations: [],
            };

          subjectsById[subject.code] = subject.name;

          const createSubject: CreateSubjectType = {
            subjectType: "existing",
            code: surrealIdToId(subject.code),
            name: subject.name,
            credits: subject.credits,
            BPCredits: subject.BPCredits,
            prelations: subject.prelations.map((prelation) => ({
              value: prelation,
              label: subjectsById[prelation],
            })),
          };

          return createSubject;
        })
      ),
    };
    console.log(defaultData, subjectsById);

    form.reset(defaultData);
  }, [data]);

  const {onSubmit} = useFormSubmit({
    mode,
    onCreate,
    onEdit
  })
  
  async function onInvalid() {
    await jumpToFirstErrorStep();
  }
  const formSubmit = form.handleSubmit(onSubmit, onInvalid);

  const { currentStep, next, previous, jumpTo, jumpToFirstErrorStep } =
    useFormStep({
      steps,
      trigger: form.trigger,
      handleSubmit: formSubmit,
      onPageChange,
    });


  // REVIEW - Hay veces que no se ejecuta
  async function onPageChange(prevPage: number, nextPage: number) {
    console.log("Cambiando de página", prevPage, nextPage);

    if (prevPage === 0) return;

    const fieldsNamesToCheck = groupedFieldNames[prevPage - 1];

    await forEachPromiseAll(
      Object.entries(fieldsNamesToCheck),
      async ([subjectName, fields]) => {
        const typedSubjectName = subjectName as `subjects.${number}.${number}`;

        const validSubject = await form.trigger(fields);
        const isNewSubject =
          form.getValues(`${typedSubjectName}.subjectType`) === "new";

        const code = form.getValues(`${typedSubjectName}.code`);
        if (!code) return;
        const subjectCode = `subject:${code}`;

        if (!validSubject || !isNewSubject) {
          removeAdditionalSubject(subjectCode);
          return;
        }

        const name = form.getValues(`${typedSubjectName}.name`);

        if (!name) return;

        addAdditionalSubject({
          code: subjectCode,
          name,
        });
      }
    );
  }

  const trimesterStepsForm = Array.from({ length: numberOfTrimesters }).map(
    (_, trimesterIndex) => (
      <div className="flex flex-col gap-8">
        <section key={trimesterIndex} className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Trimestre {trimesterIndex + 1}</h2>

          <div className="space-y-6">
            {Array.from({ length: numberOfSubjectsByTrimester }).map(
              (_, subjectIndex) => (
                <SubjectInput
                  key={subjectIndex}
                  setValue={form.setValue}
                  resetField={form.resetField}
                  trigger={form.trigger}
                  subjectIndex={subjectIndex}
                  trimesterIndex={trimesterIndex}
                  codeOptions={codeOptions}
                  prelationOptions={prelationsOptions}
                  loadingSubjects={query.isLoading}
                  error={
                    form.formState.errors?.subjects?.[trimesterIndex]?.[
                      subjectIndex
                    ]
                  }
                  isSubjectElective={
                    form.watch(
                      `subjects.${trimesterIndex}.${subjectIndex}.subjectType`
                    ) === "elective"
                  }
                />
              )
            )}
          </div>
        </section>
      </div>
    )
  );


  return (
    <Form {...form}>
      <form
        onSubmit={formSubmit}
        className="p-16 bg-background"
      >
        <StepsNavigator
          jumpTo={jumpTo}
          steps={steps}
          currentStep={currentStep}
          headerClassName="mb-8"
          errors={form.formState.errors}
          touchedFields={form.formState.touchedFields}
        />

        {currentStep === 0 && (
          <fieldset className="flex flex-row gap-4 mb-8">
            <FloatingLabelInputField
              name="name"
              label="Nombre de la carrera"
              containerClassname="w-full"
              showErrors={true}
            />

            <FloatingLabelInputField
              name="emoji"
              label="Emoji"
              containerClassname=" max-w-16"
              showErrors={true}
            />
          </fieldset>
        )}

        {currentStep >= 1 && <>{trimesterStepsForm[currentStep - 1]}</>}

        <footer className="mt-8">
          <Button type="button" onClick={() => previous()} size="icon">
            <ArrowLeft />
          </Button>

          <Button
            type="button"
            onClick={async () => await next(true)}
            size="icon"
          >
            <ArrowRight />
          </Button>
        </footer>

        <Button
          type="submit"
          className="mt-8 gap-x-2"
          disabled={form.formState.isSubmitting}
        >
          <Spinner className="text-white" show={form.formState.isSubmitting} />
          Crear Carrera
        </Button>

        {/* <DevTool control={form.control} /> */}
      </form>
    </Form>
  );
}
