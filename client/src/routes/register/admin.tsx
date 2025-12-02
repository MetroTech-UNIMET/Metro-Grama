import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/register/admin')({
  head: () => ({
    meta: [
      {
        title: 'Registro Admin | MetroGrama',
      },
    ],
  }),
  component: RegisterAdmin,
});

function RegisterAdmin() {
  return <div>RegisterAdmin</div>;
}
