import { useState, useCallback } from 'react';

import { zodErrorToFieldErrors } from '@utils/zod/zod-to-hook-form-errors';
import { combinePaths, getZodPathFields } from '@utils/zod/zod-schema-paths';

import type { FieldErrors, FieldValues, Path, UseFormReturn } from 'react-hook-form';
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
  onError?: (
    errors: FieldErrors<T>,
    currentStep: number,
    event?: React.BaseSyntheticEvent,
  ) => unknown | Promise<unknown>;
  /**
   * Called when the schema validation is successful
   */
  onSuccess?: (step: number, schema: FormSchema, data: any) => void;
  /**
   * Function to transform the errors before comparing them with the schema path.
   * @description This is useful if you need to only get a subset of the form errors or transform them in some way before validation.
   * For example, you might want to remove some fields when wanting to validate a specific step.
   */
  transformErrors?: (errors: FieldErrors<T>, currentStep: number) => FieldErrors<T>;
  /**
   * Optional function to filter the paths that will be validated.
   * @description This is useful if you want to validate only a subset of the paths in the schema.
   */
  filterPaths?: (paths: Path<T>[], currentStep: number) => Path<T>[];
  onPageChange?: (prevPage: number, nextPage: number) => void;
}

export default function useFormStep<T extends FieldValues>({
  steps,
  form: { getValues, clearErrors, setError },
  onError,
  onSuccess,
  transformErrors,
  filterPaths,
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

      const currentFormValues = getValues();

      const parsed = await currentSchema.safeParseAsync(currentFormValues);

      const [pathFields, arrayPaths] = getZodPathFields(currentSchema);
      let paths = generateRHFPaths(pathFields, arrayPaths, currentFormValues);
      if (filterPaths) paths = filterPaths(paths, currentStep);

      if (parsed.error) {
        let rhfErrors = zodErrorToFieldErrors<T>(parsed.error, true);
        const originalRhfErrors = rhfErrors;
        if (transformErrors) rhfErrors = transformErrors(rhfErrors, currentStep);

        paths.forEach((path) => {
          let { field, auxError } = getError();

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
    },
    [steps, onError, transformErrors, onSuccess, filterPaths, getValues, setError, clearErrors],
  );

  const next = useCallback(
    async (validate: ValidateAction = false) => {
      if (!!validate && !(await validateFields(currentStep, validate === 'callOnError'))) return false;

      if (currentStep < stepsLength - 1) changeStep(currentStep + 1);
      return true;
    },
    [currentStep, stepsLength, validateFields, changeStep],
  );

  const previous = useCallback(
    async (validate: ValidateAction = false) => {
      if (!!validate && !(await validateFields(currentStep, validate === 'callOnError'))) return false;

      if (currentStep > 0) changeStep(currentStep - 1);
      return true;
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
      resolveArrayPaths(`${basePath}.${currentSegment}`, restSegments, currentValue?.[currentSegment]);
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
