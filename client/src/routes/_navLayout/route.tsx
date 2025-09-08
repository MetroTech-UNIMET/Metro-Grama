import { createFileRoute } from '@tanstack/react-router';
import NavLayout from '@/layouts/NavLayout';

export const Route = createFileRoute('/_navLayout')({
  component: () => <NavLayout />,
});