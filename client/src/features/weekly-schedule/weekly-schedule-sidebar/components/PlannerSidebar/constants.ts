import { OrderBySubjectOffers } from '@/interfaces/preferences/StudentPreferences';

import type{ Option } from "@ui/types/option.types";

export const orderSelectOptions: Option<OrderBySubjectOffers>[] = [
  { label: 'Alfabético', value: OrderBySubjectOffers.Alphabetical },
  { label: 'Dificultad', value: OrderBySubjectOffers.Difficulty },
  { label: 'Nota', value: OrderBySubjectOffers.Grade },
  { label: 'Carga', value: OrderBySubjectOffers.Workload },
  { label: 'Número de Prelaciones', value: OrderBySubjectOffers.Prelations },
  { label: 'Amigos diferentes', value: OrderBySubjectOffers.Friends },
];