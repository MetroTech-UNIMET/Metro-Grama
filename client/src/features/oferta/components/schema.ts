import { z } from 'zod';

export const pdfFileSchema = z
  .instanceof(File, { message: 'Archivo inválido' })
  .refine((f) => f.type === 'application/pdf', {
    message: 'El archivo debe ser un PDF',
  })
  .refine((f) => f.size <= 100 * 1024, {
    message: 'El archivo debe pesar máximo 100KB',
  });
