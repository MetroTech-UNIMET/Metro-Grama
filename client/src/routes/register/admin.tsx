import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { ArrowRight, BriefcaseBusiness, Plus, ShieldCheck } from 'lucide-react';

import { getMetaTags } from '@utils/meta';
import { checkIsAuthenticated } from '@utils/auth';
import { useFetchCareers } from '@/hooks/queries/career/use-fetch-careers';

import { Button } from '@ui/button';

import type { Career } from '@/interfaces/Career';
import { surrealIdToId } from '@utils/queries';

export const Route = createFileRoute('/register/admin')({
  beforeLoad: async ({ context }) => {
    const user = await checkIsAuthenticated(context.auth);
    if (user.role.ID !== 'admin') {
      throw redirect({
        to: '/materias',
        search: {
          isElective: false,
          careers: [],
        },
      });
    }
  },
  head: () => ({
    meta: getMetaTags({
      title: 'Registro Admin | MetroGrama',
      description: 'Acceso administrativo para crear y modificar carreras dentro de MetroGrama.',
    }),
  }),
  component: RegisterAdmin,
});

function RegisterAdmin() {
  const { data: careers, isLoading } = useFetchCareers();

  return (
    <main className="text-UI-white relative min-h-svh overflow-hidden bg-linear-to-b from-[#0B1026] via-[#101B3D] to-[#17265A] px-6 py-10 sm:px-10 sm:py-14">
      <div className="bg-secondary-500/20 pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl" />
      <div className="bg-tertiary-500/20 pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full blur-3xl" />

      <section className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-white/15 bg-white/8 p-6 shadow-2xl backdrop-blur-md sm:p-10">
        <header className="space-y-3">
          <h1 className="text-3xl leading-tight font-black sm:text-4xl">
            Tienes acceso para crear y modificar carreras
          </h1>
          <p className="max-w-2xl text-sm text-white/80 sm:text-base">
            Este rol permite gestionar la estructura academica del sistema. Cada cambio impacta a estudiantes, horarios
            y reportes, por lo que tus decisiones deben ser claras, auditables y consistentes.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/15 bg-black/20 p-4">
            <div className="bg-secondary-500/25 text-secondary-100 mb-3 inline-flex rounded-lg p-2">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Que puedes hacer</h2>
            <p className="mt-2 text-sm text-white/80">
              Crear nuevas carreras, ajustar nombres, codigos y configuraciones clave para mantener actualizado el plan
              academico.
            </p>
          </article>

          <article className="rounded-2xl border border-white/15 bg-black/20 p-4">
            <div className="bg-tertiary-500/25 text-tertiary-100 mb-3 inline-flex rounded-lg p-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Responsabilidad alta</h2>
            <p className="mt-2 text-sm text-white/80">
              Un cambio incorrecto puede afectar inscripciones, historiales y visualizacion de materias. Verifica
              siempre antes de publicar.
            </p>
          </article>
        </div>

        <div className="border-warning-foreground/20 bg-warning/10 text-warning-foreground rounded-2xl border p-4 text-sm">
          Usa este acceso con criterio profesional: cada carrera representa una ruta academica real para muchos
          estudiantes.
        </div>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Gestion de carreras</h2>

            <Button asChild colors="secondary" className="font-semibold">
              <Link to="/admin/carreras/crear">
                <Plus className="h-4 w-4" />
                Crear nueva carrera
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-white/15 bg-black/20 p-4 text-sm text-white/80">
              Cargando carreras...
            </div>
          ) : careers?.length ? (
            <div className="grid gap-3">
              {careers.map((career) => (
                <CareerCard key={`${career.id.Table}:${career.id.ID}`} career={career} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/15 bg-black/20 p-4 text-sm text-white/80">
              No hay carreras registradas todavia.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function CareerCard({ career }: { career: Career }) {
  return (
    <Link
      to="/admin/carreras/editar/$id"
      params={{ id: surrealIdToId(career.id) }}
      className="group flex items-center justify-between rounded-2xl border border-white/15 bg-black/20 p-4 transition-colors hover:bg-black/35"
    >
      <div className="min-w-0">
        <p className="truncate text-base font-semibold">
          {career.emoji} {career.name}
        </p>
        <p className="text-xs text-white/60">ID: {career.id.ID}</p>
      </div>

      <span className="text-secondary-100 inline-flex items-center gap-1 text-sm font-medium">
        Editar
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
