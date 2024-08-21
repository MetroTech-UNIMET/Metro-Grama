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
import useSubjectOptions from "./hooks/useSubjectOptions";
import { createCareers } from "@/api/careersApi";
import { forEachPromiseAll } from "@utils/promises";
import { toast } from "@ui/use-toast";

import StepsNavigator from "./StepsNavigator";
import SubjectInput from "./SubjectInput";
import { Spinner } from "@ui/spinner";
import { FloatingLabelInputField } from "@ui/derived/floating-label-input";
import { Form } from "@ui/form";
import { Button } from "@ui/button";

import type { CreateCareerFormType } from "./schema";

// TODO - Transiciones entre los pasos
export default function CreateCareer() {
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

  const { currentStep, next, previous, jumpTo, jumpToFirstErrorStep } =
    useFormStep({
      steps: steps,
      trigger: form.trigger,
      handleSubmit: form.handleSubmit(onSubmit, onInvalid),
      onPageChange,
    });

  // REVIEW - Considerar no enviar id unico y crearlo en go
  function onSubmit(data: CreateCareerFormType) {
    console.log("Se hizo submit");
    if (!validateOnSubmit(data)) return;

    const newData = {
      ...data,
      subjects: data.subjects.map((trimester) =>
        trimester.map((subject) => {
          if (subject.subjectType === "elective") {
            return undefined;
          }
          return {
            ...subject,
            prelations: subject.prelations.map((prelation) => prelation.value),
          };
        })
      ),
    };

    createCareers(newData);
  }

  async function onInvalid() {
    await jumpToFirstErrorStep();
  }

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

  console.log(form.formState.errors);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
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

// TODO - Validar que prelations solo sea hacia atrás
function validateOnSubmit(data: CreateCareerFormType) {
  // TODO - Hacerlo más efiiciente con fors
  const allCodes = data.subjects
    .flat()
    .map((subject) => subject.code)
    .filter((code) => code !== undefined);
  const repeatedCodes = allCodes.filter(
    (code, index) => allCodes.indexOf(code) !== index
  );

  if (repeatedCodes.length > 0) {
    const message =
      repeatedCodes.length > 1
        ? `Los códigos ${repeatedCodes.join(", ")} están repetidos`
        : `El código ${repeatedCodes[0]} está repetido`;

    toast({
      title: "Códigos repetidos",
      description: message,
      variant: "destructive",
    });

    return false;
  }

  return true;
}
