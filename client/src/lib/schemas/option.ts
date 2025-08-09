import { z } from "zod/v4";

export const optionSchema_NoTransform = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
});

export const optionSchema = optionSchema_NoTransform.transform(
  (data) => data.value
);

export const optionStringSchemz_NoTransform = z.object({
  label: z.string(),
  value: z.string(),
});
export const optionStringSchema = optionStringSchemz_NoTransform.transform(
  (data) => data.value
);
