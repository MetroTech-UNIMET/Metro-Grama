import { useFormContext } from 'react-hook-form';

import SubjectInput from '../SubjectInput';
import { numberOfSubjectsByTrimester } from '../../constants';

import type { CodeOption } from '../../hooks/useSubjectOptions';
import type { Option } from '@ui/types/option.types';
import type { CreateCareerInput } from '../../schema';

interface Props {
  trimesterIndex: number;
  mode: 'create' | 'edit';

  codeOptions: CodeOption[];
  prelationsOptions: Option[];
  isLoading: boolean;
}

export default function StepSubjects({ trimesterIndex, mode, codeOptions, prelationsOptions, isLoading }: Props) {
  const form = useFormContext<CreateCareerInput>();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Trimestre {trimesterIndex + 1}</h2>

        <div className="space-y-6">
          {Array.from({ length: numberOfSubjectsByTrimester }).map((_, subjectIndex) => (
            <SubjectInput
              key={subjectIndex}
              setValue={form.setValue}
              resetField={form.resetField}
              trigger={form.trigger}
              subjectIndex={subjectIndex}
              trimesterIndex={trimesterIndex}
              codeOptions={codeOptions}
              prelationOptions={prelationsOptions}
              loadingSubjects={isLoading}
              error={form.formState.errors?.subjects?.[trimesterIndex]?.[subjectIndex]}
              isModeEdit={mode === 'edit'}
              isSubjectElective={form.watch(`subjects.${trimesterIndex}.${subjectIndex}.subjectType`) === 'elective'}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
