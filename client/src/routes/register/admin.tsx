import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/register/admin')({
  component: RegisterAdmin,
});

function RegisterAdmin() {
  return <div>RegisterAdmin</div>;
}
