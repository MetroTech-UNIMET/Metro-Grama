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
import { cn } from '@utils/className';
import { extractShema } from '@utils/zod/zod-type-guards';
import { useDirections } from '@/hooks/use-directions';

import useFormStep, { type Step } from '@/hooks/useFormStep';

import StepsNavigator from '@components/forms/StepsNavigator';
import { Form } from '@ui/form';
import SubmitButton from '@ui/derived/submit-button';
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
    form.handleSubmit(onSubmit, async (errors) => {
      onInvalidToast(errors);
      await jumpToFirstErrorStep();
    }),
    [form.handleSubmit, onSubmit],
  );

  const { currentStep, next, previous, jumpTo, jumpToFirstErrorStep } = useFormStep({
    steps: formSteps,
    form: form,
  });
  const { direction, goNext, goPrevious, goTo } = useDirections({
    currentStep,
    next,
    previous,
    jumpTo,
  });

  return (
    <div>
      <Form {...form}>
        <Tabs asChild value={String(formSteps[currentStep].id)}>
          <form id="studentForm" onSubmit={formSubmit} className="p-16">
            <StepsNavigator
              jumpTo={goTo}
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

            <TabsContent
              value="Datos personales"
              className={cn(
                'grid grid-cols-2 gap-4',
                'data-[state=active]:animate-in slide-in-from-left duration-300',
                direction === 'right' && 'direction-reverse',
              )}
            >
              <Step1 />
            </TabsContent>

            {/* FIXME - Hay un bug que al avanzar a la derecha hay como un flicking */}
            <TabsContent
              value="Datos académicos"
              className={cn(
                'grid grid-cols-2 gap-4',
                'data-[state=active]:animate-in slide-in-from-left duration-300',
                direction === 'right' && 'direction-reverse',
              )}
            >
              <Step2 />
            </TabsContent>
          </form>
        </Tabs>

        <div className="flex flex-row gap-2">
          <Button type="button" onClick={() => goPrevious()} size="icon">
            <ArrowLeft />
          </Button>

          {currentStep !== formSteps.length - 1 ? (
            <Button type="button" onClick={async () => await goNext('callOnError')} size="icon">
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
