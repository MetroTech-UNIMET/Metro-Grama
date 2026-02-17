import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/materias', search: { careers: [] } });
  },
  head: () => {
    return {
      meta: getRootMeta(),
    };
  },
});

export function getRootMeta() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const image = origin ? `${origin}/og-image.png` : '/og-image.png';

  return [
    { title: 'MetroGrama' },
    {
      name: 'description',
      content: 'MetroGrama - Planifica tu horario y visualiza tus materias de forma interactiva',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'MetroGrama' },
    {
      property: 'og:description',
      content: 'MetroGrama - Planifica tu horario y visualiza tus materias de forma interactiva',
    },
    { property: 'og:image', content: image },
    { property: 'og:url', content: url },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'MetroGrama' },
    {
      name: 'twitter:description',
      content: 'MetroGrama - Planifica tu horario y visualiza tus materias de forma interactiva',
    },
    { name: 'twitter:image', content: image },
    { name: 'twitter:url', content: url },
  ];
}
