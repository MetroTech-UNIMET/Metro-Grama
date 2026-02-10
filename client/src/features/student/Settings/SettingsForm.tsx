import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { studentSettingsSchema, type StudentSettingsFormInput, type Visibility } from './schema';
import { useMutationUpdateMyPreferences } from './mutations/use-update-my-preferences';

import { onInvalidToast } from '@utils/forms';

import { FormSelectField } from '@ui/derived/form-fields/form-field-select';
import SubmitButton from '@ui/derived/submit-button';
import { Form } from '@ui/form';

import type { StudentPreferencesEntity } from '@/interfaces/preferences/StudentPreferences';
import type { Option } from '@ui/types/option.types';

const visibilityOptions: Option<Visibility>[] = [
  { value: 'public', label: 'Público' },
  { value: 'onlyFriends', label: 'Solo amigos' },
  { value: 'private', label: 'Privado' },
];

interface Props {
  preferences: StudentPreferencesEntity;
}

export default function SettingsForm({ preferences }: Props) {
  const form = useForm({
    resolver: zodResolver(studentSettingsSchema),
    defaultValues: {
      show_friends: preferences.show_friends,
      show_schedule: preferences.show_schedule,
      show_subjects: preferences.show_subjects,
    },
    mode: 'onChange',
  });

  const updatePreferences = useMutationUpdateMyPreferences();

  const submitFunction = form.handleSubmit(async (values) => updatePreferences.mutateAsync(values), onInvalidToast);

  return (
    <Form {...form}>
      <form id="my-preferences-form" className="space-y-6" onSubmit={submitFunction}>
        <section className="space-y-1">
          <h2 className="text-lg font-semibold">Privacidad</h2>
          <p className="text-muted-foreground text-sm">Elige quién puede ver cada sección de tu perfil.</p>
        </section>

        <div className="grid grid-cols-2 gap-6">
          <FormSelectField<StudentSettingsFormInput, Visibility>
            name="show_friends"
            label="Amigos"
            options={visibilityOptions}
            className="min-w-56"
          />

          <FormSelectField<StudentSettingsFormInput, Visibility>
            name="show_schedule"
            label="Horario"
            options={visibilityOptions}
            className="min-w-56"
          />

          <FormSelectField<StudentSettingsFormInput, Visibility>
            name="show_subjects"
            label="Materias"
            options={visibilityOptions}
            className="min-w-56"
          />
        </div>
      </form>

      <SubmitButton colors="primary" form="my-preferences-form">
        Actualizar Preferencias
      </SubmitButton>
    </Form>
  );
}
