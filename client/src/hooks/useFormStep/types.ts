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
