import { useState, useCallback } from 'react';

import { generateRHFPaths } from './functions';

import { zodErrorToFieldErrors } from '@/lib/utils/zod/zod-to-hook-form-errors';
import { combinePaths, getZodPathFields } from '@/lib/utils/zod/zod-schema-paths';

import type { FieldErrors, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import type { FormSchema } from '@/lib/utils/zod/types';
import type { Step, ValidateAction } from './types';

interface Props<T extends FieldValues, TTransformedValues = T> {
  steps: Step[];
  form: UseFormReturn<T, unknown, TTransformedValues>;
  /**
   * Called when the form encounters an error when validating and if `callOnError` is true.
   * @param errors The validation errors.
   * @param currentStep The current step index.
   * @param event The event that triggered the validation.
   */
  onError?: (errors: FieldErrors<T>, currentStep: number, event?: React.BaseSyntheticEvent) => unknown;
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
  extraValidation?: (currentStep: number) => boolean;
}

export function useFormStep<T extends FieldValues, TTransformedValues = T>({
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
    ({ currentStep, callOnError }: { currentStep: number; callOnError: boolean }) => {
      try {
        if (!steps[currentStep]) throw new Error('Step does not exist');

        const currentSchema = steps[currentStep].schema;
        if (!currentSchema) return true;

        const currentFormValues = getValues();

        const passExtraValidation = extraValidation?.(currentStep) ?? true;
        if (!passExtraValidation) return false;

        const parsed = currentSchema.safeParse(currentFormValues);

        const [pathFields, arrayPaths] = getZodPathFields(currentSchema);
        let paths = generateRHFPaths(pathFields, arrayPaths, currentFormValues);
        if (filterPaths) paths = filterPaths(paths, currentStep);

        if (parsed.error) {
          let rhfErrors = zodErrorToFieldErrors<T>(parsed.error, true);
          const originalRhfErrors = rhfErrors;
          if (transformErrors) rhfErrors = transformErrors(rhfErrors, currentStep);

          let hasErrors = false;

          paths.forEach((path) => {
            const { field, auxError } = getError();

            if (!auxError) {
              clearErrors(field);
              return;
            }
            const root = auxError?.root;
            const message = auxError?.message;

            if (root) {
              hasErrors = true;
              setError(field, root as any, {
                shouldFocus: true,
              });
            } else if (message) {
              hasErrors = true;
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
              if (setNestedErrors(field, auxError)) {
                hasErrors = true;
              }
            }

            function setNestedErrors(baseField: string, errorObj: any) {
              let foundError = false;
              Object.keys(errorObj).forEach((key) => {
                const nested = errorObj[key];
                const newField = `${baseField}.${key}`;
                if (nested?.root) {
                  foundError = true;
                  setError(newField as Path<T>, nested.root as any, {
                    shouldFocus: true,
                  });
                } else if (nested?.message) {
                  foundError = true;
                  setError(
                    newField as Path<T>,
                    {
                      message: nested.message as any,
                      type: nested.type as any,
                      types: nested.types as any,
                    },
                    {
                      shouldFocus: true,
                    },
                  );
                } else if (nested && typeof nested === 'object') {
                  if (setNestedErrors(newField, nested)) {
                    foundError = true;
                  }
                }
              });
              return foundError;
            }

            function getError() {
              const segments = path.split('.');

              let field = '' as Path<T>;
              let auxError = rhfErrors;

              for (const segment of segments) {
                field = combinePaths(field, segment) as Path<T>;

                auxError = auxError[segment] as FieldErrors<T>;
                if (!auxError) return { field, auxError: undefined };
              }

              return { field, auxError };
            }
          });

          if (callOnError && hasErrors) {
            onError?.(originalRhfErrors, currentStep);
            return false;
          }
          return true;
        } else {
          paths.forEach((path) => {
            clearErrors(path);
          });
          onSuccess?.(currentStep, currentSchema, parsed.data);
        }

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    [steps, getValues, clearErrors, setError, onError, onSuccess, transformErrors, filterPaths, extraValidation],
  );

  const jumpToFirstErrorStep = useCallback(() => {
    for (let i = 0; i < steps.length; i++) {
      const isValid = validateFields({
        currentStep: i,
        callOnError: false,
      });
      if (!isValid) {
        changeStep(i);
        return false;
      }
    }
    return true;
  }, [steps, changeStep, validateFields]);

  const next = useCallback(
    (validate: ValidateAction = false) => {
      if (validate) {
        const validationResult = validateFields({
          currentStep,
          callOnError: validate === 'callOnError',
        });
        if (validate !== 'ignoreValidation' && !validationResult) {
          return false;
        }
      }

      const newStepIndex = currentStep + 1;
      const nextStep = steps[newStepIndex];
      if (!nextStep) throw new Error('Next step does not exist');

      if (nextStep.validateBeforeJumping) {
        const isValid = validateFields({
          currentStep: newStepIndex,
          callOnError: nextStep.validateBeforeJumping === 'callOnError',
        });
        if (!isValid) {
          jumpToFirstErrorStep();
          return false;
        }
      }

      if (currentStep < stepsLength - 1) changeStep(newStepIndex);
      return true;
    },
    [currentStep, stepsLength, changeStep, steps, jumpToFirstErrorStep, validateFields],
  );

  const previous = useCallback(
    (validate: ValidateAction = false) => {
      if (validate) {
        const validationResult = validateFields({
          currentStep,
          callOnError: validate === 'callOnError',
        });
        if (validate !== 'ignoreValidation' && !validationResult) {
          return false;
        }
      }

      const newStepIndex = currentStep - 1;
      const nextStep = steps[newStepIndex];
      if (!nextStep) throw new Error('Previous step does not exist');

      if (nextStep.validateBeforeJumping) {
        const isValid = validateFields({
          currentStep: newStepIndex,
          callOnError: nextStep.validateBeforeJumping === 'callOnError',
        });
        if (!isValid) {
          jumpToFirstErrorStep();
          return false;
        }
      }

      if (currentStep > 0) changeStep(newStepIndex);
      return true;
    },
    [currentStep, changeStep, steps, jumpToFirstErrorStep, validateFields],
  );

  const jumpTo = useCallback(
    (step: number, validateCurrentStep: ValidateAction = false) => {
      if (validateCurrentStep) {
        const validationResult = validateFields({
          currentStep,
          callOnError: validateCurrentStep === 'callOnError',
        });
        if (validateCurrentStep !== 'ignoreValidation' && !validationResult) {
          return false;
        }
      }

      const nextStep = steps[step];
      if (!nextStep) throw new Error('Step to jump does not exist');

      if (nextStep.validateBeforeJumping) {
        const isValid = validateFields({
          currentStep: step,
          callOnError: nextStep.validateBeforeJumping === 'callOnError',
        });
        if (!isValid) {
          jumpToFirstErrorStep();
          return false;
        }
      }

      if (step >= 0 && step < steps.length) changeStep(step);
      return true;
    },
    [currentStep, steps, changeStep, jumpToFirstErrorStep, validateFields],
  );

  return {
    currentStep,
    next,
    previous,
    jumpTo,
    jumpToFirstErrorStep,
  };
}
