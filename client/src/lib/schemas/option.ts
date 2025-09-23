import { z } from 'zod/v4';

import type { $ZodErrorMap, $ZodIssueInvalidType, $ZodIssueUnrecognizedKeys } from 'zod/v4/core';

export const optionStringSchema_NoTransform = z.object({
  label: z.string(),
  value: z.string(),
});
export const optionStringSchema = optionStringSchema_NoTransform.transform((data) => data.value);

export function createOptionSchema(
  error:
    | string
    | $ZodErrorMap<NonNullable<$ZodIssueInvalidType<unknown> | $ZodIssueUnrecognizedKeys>>
    | undefined = undefined,
  valueSchema: z.ZodType<any> = z.string(),
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
