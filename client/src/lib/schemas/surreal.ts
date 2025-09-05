import z from 'zod/v4';

export function createIdSchema(tableName: string, idSchema: z.ZodType<any> = z.string()) {
  return z.object(
    {
      Table: z.literal(tableName, {
        error: (issue) =>
          !issue.input
            ? `El campo de la tabla ${tableName} es requerido`
            : `El campo de la tabla debe ser ${tableName}`,
      }),
      ID: idSchema,
    },
    {
      error: `El ID de la tabla ${tableName} es requerido`,
    },
  );
}

export function createStringIdSchema(tableName: string) {
  return z.templateLiteral([tableName, ':', z.string().min(1)], {
    error: `El ID de la tabla ${tableName} es requerido y debe ser una cadena no vacía`,
  });
}
