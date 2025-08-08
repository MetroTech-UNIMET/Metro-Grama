import { cn } from "@utils/className";

import type { Step, ValidateAction } from "@/hooks/useFormStep";
import type {
  FieldErrors,
  FieldNamesMarkedBoolean,
  FieldValues,
} from "react-hook-form";

type TouchedFields<T extends FieldValues> = Partial<Readonly<FieldNamesMarkedBoolean<T>>>;

interface Props<T extends FieldValues> {
  steps: Step[];
  currentStep: number;
  jumpTo: (step: number, validateCurrentStep?: ValidateAction) => Promise<false | undefined>
  headerClassName?: string;
  errors: FieldErrors<T>;
  touchedFields: TouchedFields<T>;
}

export default function StepsNavigator<T extends FieldValues>({
  steps,
  currentStep,
  jumpTo,
  headerClassName,
  errors,
  touchedFields,
}: Props<T>) {
  return (
    <header className={cn("flex gap-4", headerClassName)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const hasError = false; 
        // const hasError = stepHasErrors(step, errors);
        // const allFieldsTouched = isAllFieldsTouched(step, touchedFields);
        // const stepsIsValid = allFieldsTouched && !hasError;
        // console.log({step, allFieldsTouched, hasError})

        // TODO - Mejorar bastante el styling
        return (
          <button
            key={step.id}
            onClick={() => jumpTo(index, index > currentStep ? 'callOnError' : undefined)}
            type="button"
            className={cn("p-2 rounded-full bg-gray-200 text-gray-800", {
              "bg-destructive text-white": !isActive && hasError,
              // "bg-gray-800 text-white border border-destructive":
              //   isActive && hasError,
              "bg-gray-800 text-white": isActive && !hasError,

              // "bg-gray-800 text-white border border-success":
              //   stepsIsValid && isActive,
              // "bg-success text-white": stepsIsValid && !isActive,
            })}
          >
            {step.id}
          </button>
        );
      })}
    </header>
  );
}

// function isAllFieldsTouched<T extends FieldValues>(step: Step<T>, touchedFields: TouchedFields<T>) {
//   return step.fields.every(
//     (field) =>  touchedFields?.[field as keyof typeof touchedFields]
//   );
// }

// function stepHasErrors<T extends FieldValues>(
//   step: Step<T>,
//   errors: FieldErrors<T>
// ) {
//   return step.fields.some(
//     (field) => getNestedProperty(errors, field) !== undefined
//   );
// }

// function getNestedProperty<T extends Record<string, any>>(
//   obj: T,
//   path: string
// ) {
//   return path.split(".").reduce((acc, part) => acc && acc[part], obj);
// }
