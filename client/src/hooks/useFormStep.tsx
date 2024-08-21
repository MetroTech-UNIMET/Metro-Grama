import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { forEachPromiseAll } from "@utils/promises";

import type { FieldValues, Path, UseFormTrigger } from "react-hook-form";

export interface Step<T extends FieldValues> {
  id: string | number;
  fields: Path<T>[];
}

interface Props<T extends FieldValues> {
  steps: Step<T>[];
  trigger: UseFormTrigger<T>;
  handleSubmit: () => void;
  onPageChange?: (prevPage: number, nextPage: number) => void;
}

export default function useFormStep<T extends FieldValues>({
  steps,
  trigger,
  handleSubmit,
  onPageChange,
}: Props<T>) {
  const [currentStep, setCurrentStep] = useState(0);

  const { mutateAsync: validateFieldsMutation } = useMutation({
    mutationFn: validateFields,
  });

  async function next(validate = false) {
    if (validate && !(await validateFieldsMutation(currentStep))) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        return handleSubmit();
      }

      onPageChange?.(currentStep, currentStep + 1);
      setCurrentStep((prev) => prev + 1);
    }
  }

  async function previous(validate = false) {
    if (validate && !(await validateFieldsMutation(currentStep))) return;

    if (currentStep > 0) {
      onPageChange?.(currentStep, currentStep + 1);
      setCurrentStep((prev) => prev - 1);
    }
  }

  function jumpTo(step: number, validate = false) {
    if (validate && !validateFieldsMutation(currentStep)) return;

    if (step >= 0 && step < steps.length) {
      onPageChange?.(currentStep, step);
      setCurrentStep(step);
    }
  }

  async function validateFields(stepIndex: number) {
    const fields = steps[stepIndex].fields;
    return await trigger(fields, { shouldFocus: true });
  }

  async function jumpToFirstErrorStep() {
    const validationResults = await forEachPromiseAll(steps, async (_, i) =>
      validateFields(i)
    );

    const firstInvalidStep = validationResults.findIndex((isValid) => !isValid);
    if (firstInvalidStep !== -1) {
      setCurrentStep(firstInvalidStep);
    }
  }

  return {
    currentStep,
    next,
    previous,
    jumpTo,
    jumpToFirstErrorStep,
  };
}
