import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_navLayout/profile/settings/')({
  component: function ProfileSettingsRoute() {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Configuración de perfil</h1>
        <p className="text-muted-foreground mt-2">Aquí podrás ajustar la configuración de tu perfil.</p>
      </div>
    );
  },
});
