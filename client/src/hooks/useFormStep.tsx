import { useState, useCallback } from 'react';

import { zodErrorToFieldErrors } from '@/lib/utils/zod/zod-to-hook-form-errors';
import { combinePaths, getZodPathFields } from '@/lib/utils/zod/zod-schema-paths';

import type { FieldErrors, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import type { FormSchema } from '@/lib/utils/zod/types';

/**
 * Type representing the action to take when validating a step.
 * - `boolean`: Indicates whether to validate the step.
 * - `'callOnError'`: Validates the step and calls the `onError` callback if validation fails.
 * - `'ignoreValidation'`: Still validates the step, but does not block the navigation.
 */
export type ValidateAction = boolean | 'callOnError' | 'ignoreValidation';

export interface Step {
  schema?: FormSchema;
  id: string | number;
  validateBeforeJumping?: ValidateAction;
}

interface Props<T extends FieldValues, TTransformedValues = T> {
  steps: Step[];
  form: UseFormReturn<T, unknown, TTransformedValues>;
  /**
   * Called when the form encounters an error when validating and if `callOnError` is true.
   * @param errors The validation errors.
   * @param currentStep The current step index.
   * @param event The event that triggered the validation.
   */
  onError?: (
    errors: FieldErrors<T>,
    currentStep: number,
    event?: React.BaseSyntheticEvent,
  ) => unknown | Promise<unknown>;
  /**
   * Called when the schema validation is successful
   * @param step The current step index.
   * @param schema The schema used for validation.
   * @param data The data after it was parsed by the schema.
   */
  onSuccess?: (step: number, schema: FormSchema, data: any) => void;
  /**
   * Function to transform the errors before comparing them with the schema path.
   * @description This is useful if you need to only get a subset of the form errors or transform them in some way before validation.
   * For example, you might want to remove some fields when wanting to validate a specific step.
   * @param errors The form errors.
   * @param currentStep The current step index.
   * @returns The transformed form errors.
   */
  transformErrors?: (errors: FieldErrors<T>, currentStep: number) => FieldErrors<T>;
  /**
   * Optional function to filter the paths that will be validated.
   * @description This is useful if you want to validate only a subset of the paths in the schema.
   * @param paths The paths of the form to filter.
   * @param currentStep The current step index.
   * @returns The filtered paths.
   */
  filterPaths?: (paths: Path<T>[], currentStep: number) => Path<T>[];
  /**
   * Called when the user navigates between pages. Useful for triggering side effects when the current
   * page changes.
   * @param prevPage The previous page number.
   * @param nextPage The next page number.
   */
  onPageChange?: (prevPage: number, nextPage: number) => void;

  /**
   * Called for additional validation before moving to the next step.
   * @param currentStep The current step index.
   * @returns A promise that resolves to a boolean indicating whether the validation passed.
   */
  extraValidation?: (currentStep: number) => Promise<boolean>;
}

export default function useFormStepAsync<T extends FieldValues, TTransformedValues = T>({
  steps,
  form: { getValues, clearErrors, setError },
  onError,
  onSuccess,
  transformErrors,
  filterPaths,
  onPageChange,
  extraValidation,
}: Props<T, TTransformedValues>) {
  const [currentStep, setCurrentStep] = useState(0);
  const stepsLength = steps.length;

  const changeStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      onPageChange?.(currentStep, step);
    },
    [currentStep, onPageChange],
  );

  const validateFields = useCallback(
    async (currentStep: number, callOnError: boolean) => {
      try {
        const currentSchema = steps[currentStep].schema;
        if (!currentSchema) return true;

        const currentFormValues = getValues();

        const passExtraValidation = (await extraValidation?.(currentStep)) ?? true;
        if (!passExtraValidation) return false;

        const parsed = await currentSchema.safeParseAsync(currentFormValues);

        const [pathFields, arrayPaths] = getZodPathFields(currentSchema);
        let paths = generateRHFPaths(pathFields, arrayPaths, currentFormValues);
        if (filterPaths) paths = filterPaths(paths, currentStep);

        if (parsed.error) {
          let rhfErrors = zodErrorToFieldErrors<T>(parsed.error, true);
          const originalRhfErrors = rhfErrors;
          if (transformErrors) rhfErrors = transformErrors(rhfErrors, currentStep);

          paths.forEach((path) => {
            const { field, auxError } = getError();

            if (!auxError) {
              clearErrors(field);
              return;
            }
            const root = auxError?.root;
            const message = auxError?.message;

            if (root) {
              setError(field, root as any, {
                shouldFocus: true,
              });
            } else if (message) {
              setError(
                field,
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
              // clearErrors(field);
            }

            function getError() {
              const segments = path.split('.');

              let field = '' as Path<T>;
              let auxError = rhfErrors;

              for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                field = combinePaths(field, segment) as Path<T>;

                auxError = auxError[segment] as FieldErrors<T>;
                if (!auxError) return { field, auxError: undefined };
              }

              return { field, auxError };
            }
          });

          if (callOnError) {
            await onError?.(originalRhfErrors, currentStep);
          }
        } else {
          paths.forEach((path) => {
            clearErrors(path);
          });
          onSuccess?.(currentStep, currentSchema, parsed.data);
        }

        return parsed.success;
      } catch (_) {
        return false;
      }
    },
    [
      steps,
      onError,
      transformErrors,
      onSuccess,
      filterPaths,
      extraValidation,
      getValues,
      setError,
      clearErrors,
    ],
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

  const next = useCallback(
    async (validate: ValidateAction = false) => {
      if (validate) {
        const validationPromise = validateFields(currentStep, validate === 'callOnError');
        if (validate !== 'ignoreValidation' && !(await validationPromise)) {
          return false;
        }
      }

      const newStepIndex = currentStep + 1;
      const nextStep = steps[newStepIndex];

      if (nextStep.validateBeforeJumping) {
        const isValid = await validateFields(
          newStepIndex,
          nextStep.validateBeforeJumping === 'callOnError',
        );
        if (!isValid) {
          jumpToFirstErrorStep();
          return false;
        }
      }

      if (currentStep < stepsLength - 1) changeStep(newStepIndex);
      return true;
    },
    [currentStep, stepsLength, validateFields, changeStep, steps, jumpToFirstErrorStep],
  );

  const previous = useCallback(
    async (validate: ValidateAction = false) => {
      if (validate) {
        const validationPromise = validateFields(currentStep, validate === 'callOnError');
        if (validate !== 'ignoreValidation' && !(await validationPromise)) {
          return false;
        }
      }

      const newStepIndex = currentStep - 1;
      const nextStep = steps[newStepIndex];

      if (nextStep.validateBeforeJumping) {
        const isValid = await validateFields(
          newStepIndex,
          nextStep.validateBeforeJumping === 'callOnError',
        );
        if (!isValid) {
          jumpToFirstErrorStep();
          return false;
        }
      }

      if (currentStep > 0) changeStep(newStepIndex);
      return true;
    },
    [currentStep, validateFields, changeStep, steps, jumpToFirstErrorStep],
  );

  const jumpTo = useCallback(
    async (step: number, validateCurrentStep: ValidateAction = false) => {
      if (validateCurrentStep) {
        const validationPromise = validateFields(
          currentStep,
          validateCurrentStep === 'callOnError',
        );
        if (validateCurrentStep !== 'ignoreValidation' && !(await validationPromise)) {
          return false;
        }
      }

      const nextStep = steps[step];

      if (nextStep.validateBeforeJumping) {
        const isValid = await validateFields(
          step,
          nextStep.validateBeforeJumping === 'callOnError',
        );
        if (!isValid) {
          jumpToFirstErrorStep();
          return false;
        }
      }

      if (step >= 0 && step < steps.length) changeStep(step);
      return true;
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
): Path<T>[] {
  const allPaths: Path<T>[] = [];

  function resolveArrayPaths(basePath: string, remainingPath: string[], currentValue: any) {
    if (!remainingPath.length) {
      allPaths.push(basePath as Path<T>);
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
      resolveArrayPaths(
        `${basePath}.${currentSegment}`,
        restSegments,
        currentValue?.[currentSegment],
      );
    }
  }

  pathFields.forEach((path) => {
    allPaths.push(path as Path<T>);
  });

  arrayPaths.forEach((arrayPath) => {
    const segments = arrayPath.split('.');
    resolveArrayPaths(segments[0], segments.slice(1), currentFormValues[segments[0]]);
  });

  return allPaths;
}
