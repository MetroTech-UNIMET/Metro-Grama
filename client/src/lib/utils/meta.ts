import type { DetailedHTMLProps, MetaHTMLAttributes } from 'react';

interface Props {
  title: string;
  description: string;
}

export function getMetaTags({ title, description }: Props) {
  const meta: DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>[] = [
    { name: 'title', content: title },

    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },

    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ];
  return meta;
}
