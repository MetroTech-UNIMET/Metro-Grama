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
    navigate({ to: '/' });
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
    <div>
      <Form {...form}>
        <Tabs asChild value={String(formSteps[currentStep].id)}>
          <form id="studentForm" onSubmit={formSubmit} className="p-16">
            <StepsNavigator
              jumpTo={jumpTo}
              steps={formSteps}
              currentStep={currentStep}
              headerClassName="mb-8"
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

            <TabsContent value="Datos personales" className="grid grid-cols-2 gap-4">
              <Step1 />
            </TabsContent>

            <TabsContent value="Datos académicos" className="grid gap-4">
              <Step2 />
            </TabsContent>
          </form>
        </Tabs>

        <div className="flex flex-row gap-2">
          <Button type="button" onClick={() => previous()} size="icon">
            <ArrowLeft />
          </Button>

          {currentStep !== formSteps.length - 1 ? (
            <Button type="button" onClick={() => next('callOnError')} size="icon">
              <ArrowRight />
            </Button>
          ) : (
            <SubmitButton form="studentForm" colors="primary">
              Guardar Perfil
            </SubmitButton>
          )}
        </div>
      </Form>
    </div>
  );
}
