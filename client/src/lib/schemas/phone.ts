import z from 'zod/v4';
import { isValidPhoneNumber } from 'libphonenumber-js';

export const phoneSchema = z.string().refine(isValidPhoneNumber, {
  error: 'Número de teléfono inválido. (+58412XXXXXXX)',
});
