import { FormSelectField } from '@ui/derived/form-fields/form-field-select';

import type { Option } from '@ui/types/option.types';
import type { StudentSettingsFormInput, Visibility } from '../schema';

const visibilityOptions: Option<Visibility>[] = [
  { value: 'public', label: 'Público' },
  { value: 'onlyFriends', label: 'Solo amigos' },
  { value: 'friendsFriends', label: 'Amigos de amigos' },
  { value: 'private', label: 'Privado' },
];
export function PrivacySection() {
  return (
    <>
      <section className="space-y-1">
        <h2 className="text-lg font-semibold">Privacidad</h2>
        <p className="text-muted-foreground text-sm">Elige quién puede ver cada sección de tu perfil.</p>
      </section>

      <div className="grid grid-cols-2 gap-6">
        <FormSelectField<StudentSettingsFormInput, Visibility>
          name="privacyPreferences.show_friends"
          label="Amigos"
          options={visibilityOptions}
          className="min-w-56"
        />

        <FormSelectField<StudentSettingsFormInput, Visibility>
          name="privacyPreferences.show_schedule"
          label="Horario"
          options={visibilityOptions}
          className="min-w-56"
        />

        <FormSelectField<StudentSettingsFormInput, Visibility>
          name="privacyPreferences.show_subjects"
          label="Materias"
          options={visibilityOptions}
          className="min-w-56"
        />
      </div>
    </>
  );
}
