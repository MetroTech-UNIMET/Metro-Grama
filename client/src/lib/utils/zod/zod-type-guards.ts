import { ZodPrefault, ZodDefault, ZodPipe, ZodObject, ZodArray } from 'zod';
import { SomeType } from 'zod/v4/core';
import type { FormSchema } from './types';

export function extractShema(schema: FormSchema) {
  if (isZodPipe(schema)) {
    return schema.in;
  } else {
    return schema;
  }
}

export function getUnwrappedSchema(schema: SomeType): SomeType {
  if (schema instanceof ZodPrefault || schema instanceof ZodDefault) {
    return schema.unwrap();
  }
  return schema;
}

export function isZodPipe(schema: SomeType): schema is ZodPipe<any, any> {
  const toValidate = getUnwrappedSchema(schema);

  return toValidate instanceof ZodPipe;
}

export function isZodObject(schema: SomeType): schema is ZodObject<any> {
  const toValidate = getUnwrappedSchema(schema);

  return toValidate && typeof toValidate === 'object' && toValidate instanceof ZodObject;
}

export function isZodArray(schema: SomeType): schema is ZodArray<any> {
  const toValidate = getUnwrappedSchema(schema);

  return toValidate && typeof toValidate === 'object' && toValidate instanceof ZodArray;
}
