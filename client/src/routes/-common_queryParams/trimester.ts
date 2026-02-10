import z from 'zod/v4';

export const trimesterQueryParam = z.union([z.literal('none'), z.string()]).catch('none');
