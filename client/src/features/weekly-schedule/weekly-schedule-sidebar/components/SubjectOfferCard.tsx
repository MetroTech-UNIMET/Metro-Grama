import { useMemo } from 'react';
import { Target } from 'lucide-react';

import { usePlannerSidebarContext } from '../context/PlannerSidebarContext';

import { cn } from '@utils/className';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

interface Props {
  subjectOffer: SubjectOfferWithSections;
  onSelect: (subjectOffer: SubjectOfferWithSections) => void;

  state: 'isEnrollable' | 'isEnrolled' | 'default';
}
// REVIEW - Puedo poner los amigos que la están viendo
export default function SubjectOfferCard({ subjectOffer, onSelect, state }: Props) {
  const { subject } = subjectOffer;

  const { getIsSubjectSelected } = usePlannerSidebarContext();

  const numSections = subjectOffer.sections.length;
  const isSelected = useMemo(() => getIsSubjectSelected(subjectOffer), [getIsSubjectSelected, subjectOffer]);

  return (
    <Card
      className={cn('cursor-pointer transition-shadow hover:shadow-lg', {
        'border-green-400 bg-green-50': state === 'isEnrolled',
        'border-blue-400 bg-blue-50': state === 'isEnrollable',
        'border-gray-200': state === 'default',
      })}
      onClick={() => onSelect(subjectOffer)}
    >
      <CardHeader>
        <CardTitle className="text-lg">{subject.name}</CardTitle>
        <CardDescription>{subject.id.ID}</CardDescription>
        {isSelected && (
          <Tooltip>
            <TooltipTrigger className="absolute right-8">
              <Target className="text-success" />
            </TooltipTrigger>
            <TooltipContent className="bg-success text-success-foreground">Seleccionada en el horario</TooltipContent>
          </Tooltip>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex w-full justify-between">
          <p>Desbloquea: 2</p>

          {numSections !== 0 ? (
            <Badge>
              {numSections} sección{numSections !== 1 ? 'es' : ''}
            </Badge>
          ) : (
            <Badge>Sin secciones</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
