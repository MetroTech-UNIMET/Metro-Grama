import { toast } from 'sonner';

import type {
  FieldError,
  FieldErrors,
  FieldNamesMarkedBoolean,
  FieldValues,
  SubmitErrorHandler,
} from 'react-hook-form';

// FIXME - Utilizar sooner para los toasts
export const onInvalidToast: SubmitErrorHandler<FieldValues> = (errors) => {
  const firstError = findFirstError(errors);
  const errorMessage = firstError?.message;

  if (typeof errorMessage === 'string') {
    toast.error(errorMessage);
  } else {
    toast.error('An unknown error occurred.');
  }
};

function findFirstError<T extends FieldValues>(errors: FieldErrors<T>): FieldError | undefined {
  for (const key in errors) {
    const error = errors[key];
    if (error && 'message' in error) return error as FieldError;
    else if (error && typeof error === 'object') {
      const nestedError = findFirstError(error as FieldErrors<T>);
      if (nestedError) return nestedError;
    }
  }
  return undefined;
}

export type DirtyFields<T extends FieldValues> = Partial<Readonly<FieldNamesMarkedBoolean<T>>>;

export function getDirtyFields<T extends FieldValues>(data: T, dirty: DirtyFields<T>): Partial<T> {
  let result: Partial<T> = {};

  for (let key in dirty) {
    if (dirty[key]) {
      result[key as keyof T] = data[key as keyof T];
    }
  }

  return result;
}

export function isSomeFieldDirty<T extends FieldValues>(dirty: DirtyFields<T>): boolean {
  const walk = (node: DirtyFields<T> | boolean): boolean => {
    if (node === true) return true;
    if (Array.isArray(node)) {
      for (const item of node) {
        if (walk(item)) return true;
      }
      return false;
    }
    if (node && typeof node === 'object') {
      for (const value of Object.values(node as Record<string, DirtyFields<T>>)) {
        if (walk(value)) return true;
      }
      return false;
    }
    return false;
  };

  return walk(dirty);
}

// export type ArrayToObject<T> = T extends (infer U)[]
//   ? { [key: number]: ArrayToObject<U> }
//   : T extends object
//   ? { [K in keyof T]: ArrayToObject<T[K]> }
//   : T;

export type ArrayToObject<T, PreserveArrayKeys extends keyof any = never> = T extends (infer U)[]
  ? { [key: number]: ArrayToObject<U, PreserveArrayKeys> }
  : T extends object
    ? {
        [K in keyof T]: K extends PreserveArrayKeys ? T[K] : ArrayToObject<T[K], PreserveArrayKeys>;
      }
    : T;

/**
 * Filters the dirty fields from a form and returns only the dirty fields and their values
 * @param data Original data from the form
 * @param dirty Object with the dirty fields from formState.dirtyFields
 * @returns An object with only the dirty fields and their values
 * @example
 * const dirtyFields = getDirtyNestedFields(data, {
 *   "subjects": [
 *     [
 *       {
 *         "name": true
 *       }, null, null, null,
 *       {
 *         "name": true
 *       }
 *     ]
 *   ]
 * });
 *
 * dirtyFields = {
 *   "0": {
 *     "0": {
 *       "name": "Name 0"
 *     },
 *     "4": {
 *       "name": "Name 4"
 *     }
 *   }
 * }
 */
export function getDirtyNestedFields<T extends FieldValues>(data: T, dirty: DirtyFields<T>): Partial<ArrayToObject<T>> {
  let result: Partial<ArrayToObject<T>> = {};

  function traverse(currentData: T, currentDirty: DirtyFields<T>, path: string[] = []) {
    if (typeof currentDirty === 'boolean' && currentDirty) {
      const value = path.reduce((acc, key) => acc[key], data);

      path.reduce((acc: Record<keyof T, any>, key: keyof T, index) => {
        if (index === path.length - 1) {
          acc[key] = value;
        } else {
          acc[key] = acc[key] || {};
        }
        return acc[key];
      }, result);
    } else if (typeof currentDirty === 'object' && currentDirty !== null) {
      for (const key in currentDirty) {
        traverse(currentData[key], currentDirty[key]!!, [...path, key]);
      }
    }
  }

  traverse(data, dirty);

  return result;
}
