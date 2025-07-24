import { useState, useCallback } from "react";

import { forEachPromiseAll } from "@/lib/utils/promises";

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

  const validateFields = useCallback(
    async (stepIndex: number) => {
      const fields = steps[stepIndex].fields;
      return await trigger(fields, { shouldFocus: true });
    },
    [steps, trigger]
  );

  const next = useCallback(
    async (validate = false) => {
      if (validate && !(await validateFields(currentStep))) return;

      if (currentStep < steps.length - 1) {
        onPageChange?.(currentStep, currentStep + 1);
        setCurrentStep((prev) => prev + 1);
        return;
      }

      return handleSubmit();
    },
    [currentStep, steps, validateFields, onPageChange, handleSubmit]
  );

  const previous = useCallback(
    async (validate = false) => {
      if (validate && !(await validateFields(currentStep))) return;

      if (currentStep > 0) {
        onPageChange?.(currentStep, currentStep + 1);
        setCurrentStep((prev) => prev - 1);
      }
    },
    [currentStep, validateFields, onPageChange]
  );

  const jumpTo = useCallback(
    async (step: number, validate = false) => {
      if (validate) {
        const isValid = await validateFields(currentStep);
        if (!isValid) return;
      } else {
        validateFields(currentStep);
      }

      if (step >= 0 && step < steps.length) {
        onPageChange?.(currentStep, step);
        setCurrentStep(step);
      }
    },
    [currentStep, steps, validateFields, onPageChange]
  );

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
    validateFields,
  };
}
