// Taken from hookform-resolvers zod: https://github.com/react-hook-form/resolvers/blob/master/zod/src/zod.ts
import z4 from 'zod/v4/core';
import {
  appendErrors,
  get,
  set,
  type Field,
  type FieldErrors,
  type FieldValues,
  type ResolverOptions,
  type FieldError,
  type InternalFieldName,
} from 'react-hook-form';
import { ZodObject, ZodPipe, ZodTransform, ZodType } from 'zod/v4';

export function zodErrorToFieldErrors<TFieldValues extends FieldValues>(
  error: z4.$ZodError,
  validateAllFieldCriteria: boolean,
) {
  const errors = parseZod4Issues(error.issues, validateAllFieldCriteria);
  return toNestErrors<TFieldValues>(errors, {
    fields: {},
    shouldUseNativeValidation: false,
  });
}

function parseZod4Issues(zodErrors: z4.$ZodIssue[], validateAllFieldCriteria: boolean) {
  const errors: Record<string, FieldError> = {};
  for (; zodErrors.length; ) {
    const error = zodErrors[0];
    const { code, message, path } = error;
    const _path = path.join('.');

    if (!errors[_path]) {
      if (error.code === 'invalid_union' && error.errors.length > 0) {
        const unionError = error.errors[0][0];

        errors[_path] = {
          message: unionError.message,
          type: unionError.code,
        };
      } else {
        errors[_path] = { message, type: code };
      }
    }

    if (error.code === 'invalid_union') {
      error.errors.forEach((unionError) => unionError.forEach((e) => zodErrors.push(e)));
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types && types[error.code];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        code,
        messages ? ([] as string[]).concat(messages as string[], error.message) : error.message,
      ) as FieldError;
    }

    zodErrors.shift();
  }

  return errors;
}

const toNestErrors = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>,
): FieldErrors<TFieldValues> => {
  // options.shouldUseNativeValidation && validateFieldsNatively(errors, options);

  const fieldErrors = {} as FieldErrors<TFieldValues>;
  for (const path in errors) {
    const field = get(options.fields, path) as Field['_f'] | undefined;
    const error = Object.assign(errors[path] || {}, {
      ref: field && field.ref,
    });

    if (isNameInFieldArray(options.names || Object.keys(errors), path)) {
      const fieldArrayErrors = Object.assign({}, get(fieldErrors, path));

      set(fieldArrayErrors, 'root', error);
      set(fieldErrors, path, fieldArrayErrors);
    } else {
      set(fieldErrors, path, error);
    }
  }

  return fieldErrors;
};

const isNameInFieldArray = (names: InternalFieldName[], name: InternalFieldName) => {
  const path = escapeBrackets(name);
  return names.some((n) => escapeBrackets(n).match(`^${path}\\.\\d+`));
};

/**
 * Escapes special characters in a string to be used in a regex pattern.
 * it removes the brackets from the string to match the `set` method.
 *
 * @param input - The input string to escape.
 * @returns The escaped string.
 */
function escapeBrackets(input: string): string {
  return input.replace(/\]|\[/g, '');
}

export function clearErrors<T extends Readonly<{ [k: string]: ZodType }>, Path>(
  schema: ZodPipe<ZodObject<T>, ZodTransform<any>> | ZodObject<T>,
  clear: (path: Path) => void,
) {
  let shape = null;
  if (schema instanceof ZodPipe) {
    shape = schema.in.shape;
  } else {
    shape = schema.shape;
  }

  Object.keys(shape).forEach((key) => {
    clear(key as Path);
  });
}
