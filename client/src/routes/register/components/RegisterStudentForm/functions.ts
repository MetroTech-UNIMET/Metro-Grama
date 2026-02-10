import { toast } from 'sonner';

import { completeStudent } from '@/api/authApi';

import type { RegisterStudentOutput } from './schema';

export async function registerStudent(userId: string, data: RegisterStudentOutput) {
  try {
    const { data: studentCreated } = await completeStudent(userId, data);

    toast.success('Registro completado exitosamente', {
      description: `Bienvenido a MetroGrama ${studentCreated.user.firstName} ${studentCreated.user.lastName}`,
    });
  } catch (error) {
    toast.error('Error al completar el registro');
    throw error;
  }
}
