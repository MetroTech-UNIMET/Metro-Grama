import { z } from 'zod/v4';

// Overload when ID type not provided (defaults to string)
export function createSurrealIdSchema<T extends string>(
  tableName: T,
): z.ZodObject<{ ID: z.ZodString; Table: z.ZodLiteral<T> }>; // overload 1

// Overload when a custom Zod type for ID is provided
export function createSurrealIdSchema<T extends string, J extends z.ZodTypeAny>(
  tableName: T,
  IDType: J,
): z.ZodObject<{ ID: J; Table: z.ZodLiteral<T> }>; // overload 2

// Implementation signature (non-generic to satisfy overloads)
export function createSurrealIdSchema(
  tableName: string,
  IDType?: z.ZodTypeAny,
) {
  return z.object({
    ID: IDType ?? z.string(),
    Table: z.literal(tableName),
  });
}
