import { z } from 'zod/v4';

import type { $ZodErrorMap, $ZodIssueInvalidType, $ZodIssueUnrecognizedKeys } from 'zod/v4/core';

export const optionStringSchema_NoTransform = z.object({
  label: z.string(),
  value: z.string(),
});
export const optionStringSchema = optionStringSchema_NoTransform.transform((data) => data.value);

export function createOptionSchema<T extends z.ZodType<any>>(
  error:
    | string
    | $ZodErrorMap<NonNullable<$ZodIssueInvalidType<unknown> | $ZodIssueUnrecognizedKeys>>
    | undefined = undefined,
  valueSchema: T = z.string() as unknown as T,
) {
  return z.object(
    {
      label: z.string(),
      value: valueSchema,
    },
    {
      error: error,
    },
  );
}
