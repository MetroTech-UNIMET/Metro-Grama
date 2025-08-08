import { extractShema, isZodArray, isZodObject } from './zod-type-guards';
import type { ZodArray } from 'zod';
import type { FieldValues, Path } from 'react-hook-form';
import type { FormSchema } from './types';

export function getZodPathFields<T extends FieldValues>(schema: FormSchema, root = '') {
  const paths: Path<T>[] = [];
  const arrayPaths: string[] = [];
  const realSchema = extractShema(schema);

  const basicFields = realSchema.keyof().options;
  basicFields.forEach((field) => {
    const fieldSchema = realSchema.shape[field];

    if (isZodObject(fieldSchema)) {
      const [nestedPaths, nestedArrayPaths] = getZodPathFields(fieldSchema, combinePaths(root, field));
      paths.push(...(nestedPaths as Path<T>[]));
      arrayPaths.push(...(nestedArrayPaths as Path<T>[]));
    } else if (isZodArray(fieldSchema)) {
      const arrayFieldPath = combinePaths(root, field);
      arrayPaths.push(arrayFieldPath as Path<T>);
      handleZodArray(fieldSchema, arrayFieldPath);
    } else {
      paths.push(combinePaths(root, field) as Path<T>);
    }
  });

  return [paths, arrayPaths] as const;

  function handleZodArray(arraySchema: ZodArray<any>, root: string) {
    const elementSchema = arraySchema.element;
    const arrayRoot = `${root}.[index]`;
    arrayPaths.push(arrayRoot as Path<T>);

    if (isZodObject(elementSchema)) {
      const [nestedPaths, nestedArrayPaths] = getZodPathFields(elementSchema, arrayRoot);
      arrayPaths.push(...(nestedPaths as Path<T>[]));
      arrayPaths.push(...(nestedArrayPaths as Path<T>[]));
    } else if (isZodArray(elementSchema)) {
      handleZodArray(elementSchema, arrayRoot);
    }
  }
}

export function combinePaths(root: string, field: string) {
  return root ? `${root}.${field}` : field;
}
