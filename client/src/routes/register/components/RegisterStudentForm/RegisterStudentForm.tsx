import { useCallback, useEffect } from 'react';
import { type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Step1 } from './components/Step1';
import { Step2 } from './components/Step2';
import {
  defaultRegisterStudentValues,
  registerStudentSchema,
  step1Schema,
  step2Schema,
  type RegisterStudentSchema,
  type RegisterStudentOutput,
} from './schema';
import { registerStudent } from './functions';

import { useAuth } from '@/contexts/AuthenticationContext';
import { onInvalidToast } from '@utils/forms';
import { extractShema } from '@utils/zod/zod-type-guards';

import { useFormStep, type Step } from '@/hooks/useFormStep';

import StepsNavigator from '@components/forms/StepsNavigator';
import SubmitButton from '@ui/derived/submit-button';
import { Form } from '@ui/form';
import { Button } from '@ui/button';
import { Tabs, TabsContent } from '@ui/tabs';

const formSteps: Step[] = [
  {
    id: 'Datos personales',
    schema: step1Schema,
  },
  {
    id: 'Datos académicos',
    schema: step2Schema,
  },
];

export default function RegisterStudentForm() {
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(registerStudentSchema),
    defaultValues: defaultRegisterStudentValues,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    form.reset({
      ...form.getValues(),
      name: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  }, [user]);

  // const { data: subjects } = useFetchSubjects(form.watch('careers').map((career) => career.career.value));

  async function onSubmit(data: RegisterStudentOutput) {
    if (!user) throw new Error('Para poder completar su perfil, necesita loguearse primero');
    await registerStudent(user.id.ID, data);

    navigate({
      to: '/materias',
      search: {
        careers: data.careersWithTrimesters.map((career) => career.career as `${string}:${string}`),
        isElective: false,
      },
    });
  }

  const formSubmit = useCallback(
    form.handleSubmit(onSubmit, (errors) => {
      onInvalidToast(errors);
      jumpToFirstErrorStep();
    }),
    [form.handleSubmit, onSubmit],
  );

  const { currentStep, next, previous, jumpTo, jumpToFirstErrorStep } = useFormStep({
    steps: formSteps,
    form: form,
  });

  return (
    <div className="w-full max-w-5xl">
      <Form {...form}>
        <div className="rounded-4xl border border-white/15 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <Tabs asChild value="Datos académicos">
            <form id="studentForm" onSubmit={formSubmit} className="space-y-6 p-5 sm:p-8 lg:p-12">
              <div className="space-y-2">
                <p className="text-primary-foreground/80 text-sm tracking-[0.28em] uppercase">Registro de estudiante</p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Completa tu perfil académico</h1>
                <p className="text-primary-foreground/70 max-w-2xl text-sm sm:text-base">
                  Ingresa tus datos personales y selecciona las carreras con las que quieres comenzar.
                </p>
              </div>

              <StepsNavigator
                jumpTo={jumpTo}
                steps={formSteps}
                currentStep={currentStep}
                headerClassName="mb-6 overflow-x-auto pb-2"
                errors={form.formState.errors}
                touchedFields={form.formState.touchedFields}
                stepHasErrors={(step, _, errors) => {
                  if (!step.schema) return false;

                  const extracted = extractShema(step.schema);
                  const careerSchemaKeys = Object.keys(extracted.shape);
                  const hasError = careerSchemaKeys.some((key) => {
                    return errors[key as keyof FieldErrors<RegisterStudentSchema>] !== undefined;
                  });
                  return hasError;
                }}
              />

              <TabsContent value="Datos personales" className="mt-0 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Step1 />
              </TabsContent>

              <TabsContent value="Datos académicos" className="mt-0 grid gap-4">
                <Step2 />
              </TabsContent>
            </form>
          </Tabs>

          <div className="flex flex-row gap-3 border-t border-white/10 px-5 py-5 sm:justify-between sm:px-8 lg:px-12">
            <Button type="button" onClick={() => previous()} size="icon" className="self-start w-1/2">
              <ArrowLeft />
            </Button>

            {currentStep !== formSteps.length - 1 ? (
              <Button type="button" onClick={() => next('callOnError')} size="icon" className="self-end w-1/2">
                <ArrowRight />
              </Button>
            ) : (
              <SubmitButton form="studentForm" colors="primary" className="self-end w-1/2">
                Guardar Perfil
              </SubmitButton>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}
