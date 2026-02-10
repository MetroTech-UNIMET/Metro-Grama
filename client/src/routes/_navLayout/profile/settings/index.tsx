import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';

import { fetchMyPreferencesOptions } from '@/hooks/queries/preferences/use-fetch-my-preferences';

import SettingsForm from '@/features/student/Settings/SettingsForm';

export const Route = createFileRoute('/_navLayout/profile/settings/')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(fetchMyPreferencesOptions()),
  head: () => ({
    meta: [
      {
        title: 'Configuración | MetroGrama',
      },
    ],
  }),
  component: function ProfileSettingsRoute() {
    const { data: preferences } = useSuspenseQuery(fetchMyPreferencesOptions());
    return (
      <div className="space-y-6 p-4">
        <header>
          <h1 className="text-2xl font-bold">Configuración de perfil</h1>
          <p className="text-muted-foreground mt-2">Aquí podrás ajustar la configuración de tu perfil.</p>
        </header>

        <SettingsForm preferences={preferences} />
      </div>
    );
  },
});
