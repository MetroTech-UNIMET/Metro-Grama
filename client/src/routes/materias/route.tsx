import { createFileRoute } from '@tanstack/react-router'
import GraphLayout from '@/layouts/GraphLayout'
import { z } from 'zod'

export const Route = createFileRoute('/materias')({
  validateSearch: z
    .object({
      careers: z.string().catch('none'),
    })
    .catch({ careers: 'none' as const }),
  component: GraphLayout,
})
