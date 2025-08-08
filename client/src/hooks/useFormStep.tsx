import { useState, useCallback } from 'react';

import { zodErrorToFieldErrors } from '@utils/zod/zod-to-hook-form-errors';
import { combinePaths, getZodPathFields } from '@utils/zod/zod-schema-paths';

import type { FieldErrors, FieldValues, Path, SubmitErrorHandler, UseFormReturn } from 'react-hook-form';
import type { FormSchema } from '@utils/zod/types';

export type ValidateAction = boolean | 'callOnError';

export interface Step {
  schema?: FormSchema;
  id: string | number;
  validateBeforeJumping?: ValidateAction;
}

interface Props<T extends FieldValues> {
  steps: Step[];
  form: UseFormReturn<T>;
  /**
   * Called when the form encounters an error when validating and if `callOnError` is true.
   */
  onError?: SubmitErrorHandler<T>;
  /**
   * Called when the schema validation is successful
   */
  onSuccess?: (step: number, schema: FormSchema, data: any) => void;
  /**
   * Function to transform the data from form.getValues() before validation.
   * @description This is useful if you need to only get a subset of the form values or transform them in some way before validation.
   */
  transformBeforeValidation?: (data: T, currentStep: number) => T;
  onPageChange?: (prevPage: number, nextPage: number) => void;
}

export default function useFormStep<T extends FieldValues>({
  steps,
  form: { getValues, clearErrors, setError },
  onError,
  onSuccess,
  transformBeforeValidation,
  onPageChange,
}: Props<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const stepsLength = steps.length;

  const changeStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      onPageChange?.(currentStep, step);
    },
    [onPageChange],
  );

  const validateFields = useCallback(
    async (currentStep: number, callOnError: boolean) => {
      const currentSchema = steps[currentStep].schema;
      if (!currentSchema) return true;

      let currentFormValues = getValues();
      if (transformBeforeValidation) currentFormValues = transformBeforeValidation(currentFormValues, currentStep);

      const parsed = await currentSchema.safeParseAsync(currentFormValues);
      if (parsed.error) {
        const rhfErrors = zodErrorToFieldErrors<T>(parsed.error, true);
        const [pathFields, arrayPaths] = getZodPathFields(currentSchema);

        const paths = generateRHFPaths(pathFields, arrayPaths, currentFormValues);

        paths.forEach((path) => {
          let { field, auxError } = getError();

          if (!auxError) {
            clearErrors(field as Path<T>);
            return;
          }
          const root = auxError?.root;
          const message = auxError?.message;

          if (root) {
            setError(field as Path<T>, root as any, {
              shouldFocus: true,
            });
          } else if (message) {
            setError(
              field as Path<T>,
              {
                message: message as any,
                type: auxError.type as any,
                types: auxError.types as any,
              },
              {
                shouldFocus: true,
              },
            );
          } else {
            clearErrors(field as Path<T>);
          }

          function getError() {
            const segments = path.split('.');

            let field = '';
            let auxError = rhfErrors;

            for (let i = 0; i < segments.length; i++) {
              const segment = segments[i];
              field = combinePaths(field, segment);

              auxError = auxError[segment] as FieldErrors<T>;
              if (!auxError) return { field, auxError: undefined };
            }

            return { field, auxError };
          }
        });

        if (callOnError) {
          onError?.(rhfErrors);
        }
      } else {
        onSuccess?.(currentStep, currentSchema, parsed.data);
      }

      return parsed.success;
    },
    [steps, onError, transformBeforeValidation, onSuccess, getValues, setError, clearErrors],
  );

  const next = useCallback(
    async (validate: ValidateAction = false) => {
      if (!!validate && !(await validateFields(currentStep, validate === 'callOnError'))) return false;

      if (currentStep < stepsLength - 1) changeStep(currentStep + 1);
    },
    [currentStep, stepsLength, validateFields, changeStep],
  );

  const previous = useCallback(
    async (validate: ValidateAction = false) => {
      if (!!validate && !(await validateFields(currentStep, validate === 'callOnError'))) return false;

      if (currentStep > 0) {
        changeStep(currentStep - 1);
      }
    },
    [currentStep, validateFields, changeStep],
  );

  const jumpToFirstErrorStep = useCallback(async () => {
    for (let i = 0; i < steps.length; i++) {
      const isValid = await validateFields(i, false);
      if (!isValid) {
        changeStep(i);
        return false;
      }
    }
    return true;
  }, [steps, validateFields, changeStep]);

  const jumpTo = useCallback(
    async (step: number, validateCurrentStep: ValidateAction = false) => {
      if (validateCurrentStep) {
        const isValid = await validateFields(currentStep, validateCurrentStep === 'callOnError');
        if (!isValid) return false;
      }

      const nextStep = steps[step];

      if (steps[step].validateBeforeJumping) {
        const isValid = await validateFields(step, nextStep.validateBeforeJumping === 'callOnError');
        if (!isValid) {
          jumpToFirstErrorStep();
          return false;
        }
      }

      if (step >= 0 && step < steps.length) {
        changeStep(step);
      }
    },
    [currentStep, steps, validateFields, changeStep, jumpToFirstErrorStep],
  );

  return {
    currentStep,
    next,
    previous,
    jumpTo,
    jumpToFirstErrorStep,
    validateFields,
  };
}

function generateRHFPaths<T extends FieldValues>(
  pathFields: string[],
  arrayPaths: string[],
  currentFormValues: T,
): string[] {
  const allPaths: string[] = [];

  function resolveArrayPaths(basePath: string, remainingPath: string[], currentValue: any) {
    if (!remainingPath.length) {
      allPaths.push(basePath);
      return;
    }

    const [currentSegment, ...restSegments] = remainingPath;

    if (currentSegment === '[index]') {
      if (Array.isArray(currentValue)) {
        currentValue.forEach((_, index) => {
          resolveArrayPaths(`${basePath}.${index}`, restSegments, currentValue[index]);
        });
      }
    } else {
      resolveArrayPaths(`${basePath}.${currentSegment}`, restSegments, currentValue?.[currentSegment]);
    }
  }

  pathFields.forEach((path) => {
    allPaths.push(path);
  });

  arrayPaths.forEach((arrayPath) => {
    const segments = arrayPath.split('.');
    resolveArrayPaths(segments[0], segments.slice(1), currentFormValues[segments[0]]);
  });

  return allPaths;
}
