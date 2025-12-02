import { cn } from '@utils/className';

import { TabsList, TabsTrigger } from '@ui/tabs';

import type { Step, ValidateAction } from '@/hooks/useFormStep';
import type { FieldErrors, FieldNamesMarkedBoolean, FieldValues } from 'react-hook-form';

type TouchedFields<T extends FieldValues> = Partial<Readonly<FieldNamesMarkedBoolean<T>>>;

interface Props<T extends FieldValues> {
  steps: Step[];
  currentStep: number;
  jumpTo: (step: number, validateCurrentStep?: ValidateAction) => Promise<boolean>;
  stepHasErrors?: (step: Step, currentStep: number, errors: FieldErrors<T>) => boolean;
  headerClassName?: string;
  errors: FieldErrors<T>;
  touchedFields: TouchedFields<T>;
}

export default function StepsNavigator<T extends FieldValues>({
  steps,
  currentStep,
  jumpTo,
  headerClassName,
  stepHasErrors,
  errors,
}: Props<T>) {
  return (
    <TabsList className={cn('flex gap-4', headerClassName)} variant='ghost'>
      {steps.map((step, index) => {
        const hasError = stepHasErrors?.(step, index, errors) ?? false;

        return (
          <TabsTrigger key={step.id} value={String(step.id)} asChild  variant='ghost'>
            <button
              onClick={async () => await jumpTo(index, index > currentStep ? 'callOnError' : undefined)}
              type="button"
              className={cn('rounded-full bg-gray-200 p-2 text-gray-800', {
                'bg-destructive data-[state=active]:border-destructive text-white data-[state=active]:border-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white':
                  hasError,
              })}
            >
              {step.id}
            </button>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}

// function isAllFieldsTouched<T extends FieldValues>(step: Step<T>, touchedFields: TouchedFields<T>) {
//   return step.fields.every(
//     (field) =>  touchedFields?.[field as keyof typeof touchedFields]
//   );
// }

// function getNestedProperty<T extends Record<string, any>>(
//   obj: T,
//   path: string
// ) {
//   return path.split(".").reduce((acc, part) => acc && acc[part], obj);
// }
