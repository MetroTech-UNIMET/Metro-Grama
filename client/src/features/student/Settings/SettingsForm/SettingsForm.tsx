import { set } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { studentSettingsSchema } from './schema';
import { PrivacySection } from './sections/PrivacySection';
import { ScheduleSection } from './sections/ScheduleSection';

import { useMutationUpdateMyPreferences } from '../hooks/mutations/use-update-my-preferences';

import { onInvalidToast } from '@utils/forms';

import SubmitButton from '@ui/derived/submit-button';

import { Form } from '@ui/form';
import { Button } from '@ui/button';

import type { StudentPreferencesEntity } from '@/interfaces/preferences/StudentPreferences';

interface Props {
  preferences: StudentPreferencesEntity;
}

function toDateFromTime(hours: number, minutes: number) {
  return set(new Date(), { hours, minutes, seconds: 0, milliseconds: 0 });
}

export default function SettingsForm({ preferences }: Props) {
  const form = useForm({
    resolver: zodResolver(studentSettingsSchema),
    defaultValues: {
      privacyPreferences: {
        show_friends: preferences.privacyPreferences.show_friends,
        show_schedule: preferences.privacyPreferences.show_schedule,
        show_subjects: preferences.privacyPreferences.show_subjects,
      },
      schedulePreferences: {
        default_order: preferences.schedulePreferences.default_order,
        preferred_schedules: preferences.schedulePreferences.preferred_schedules?.map((schedule) => ({
          day_of_week: schedule.day_of_week,
          starting_time: toDateFromTime(schedule.starting_hour, schedule.starting_minute),
          ending_time: toDateFromTime(schedule.ending_hour, schedule.ending_minute),
        })),
        prohibited_schedules: preferences.schedulePreferences.prohibited_schedules?.map((schedule) => ({
          day_of_week: schedule.day_of_week,
          starting_time: toDateFromTime(schedule.starting_hour, schedule.starting_minute),
          ending_time: toDateFromTime(schedule.ending_hour, schedule.ending_minute),
        })),
      },
    },
    mode: 'onChange',
  });

  const navigate = useNavigate();

  const updatePreferences = useMutationUpdateMyPreferences();

  const submitFunction = form.handleSubmit(async (values) => updatePreferences.mutateAsync(values), onInvalidToast);

  return (
    <Form {...form}>
      <form id="my-preferences-form" className="space-y-6" onSubmit={submitFunction}>
        <PrivacySection />

        <ScheduleSection />
      </form>

      <footer className="flex flex-row gap-4">
        <Button variant="outline" onClick={() => navigate({ to: '/profile' })}>
          <ArrowLeft className="size-5!" />
          Volver al perfil
        </Button>

        <SubmitButton colors="primary" form="my-preferences-form">
          Actualizar Preferencias
        </SubmitButton>
      </footer>
    </Form>
  );
}
