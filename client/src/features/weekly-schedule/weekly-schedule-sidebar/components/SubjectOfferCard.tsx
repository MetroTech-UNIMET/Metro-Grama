import { useMemo } from 'react';
import { Target, User } from 'lucide-react';

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
export default function SubjectOfferCard({ subjectOffer, onSelect, state }: Props) {
  const { subject } = subjectOffer;

  const { getIsSubjectSelected } = usePlannerSidebarContext();

  const isSelected = useMemo(() => getIsSubjectSelected(subjectOffer), [getIsSubjectSelected, subjectOffer]);
  const maxFriends = useMemo(
    () => Math.max(...subjectOffer.sections.map((section) => section.differentFriends)),
    [subjectOffer],
  );

  const numSections = subjectOffer.sections.length;
  const numPrelations = subjectOffer.prelations.length;

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

      <CardContent className="space-y-2">
        <div className="flex w-full justify-between gap-2">
          <p>Desbloquea: {numPrelations}</p>

          {numSections !== 0 ? (
            <Badge>
              {numSections} sección{numSections !== 1 ? 'es' : ''}
            </Badge>
          ) : (
            <Badge>Sin secciones</Badge>
          )}
        </div>

        {maxFriends > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <div className="relative">
                <span className="absolute -top-2 left-full font-bold">{maxFriends}</span>
                <User />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {/* REVIEw - Pensar si vale la pena poner como minimo */}
              {maxFriends} amig{maxFriends !== 1 ? 'os' : 'o'} como mínimo planean inscribir esta materia
            </TooltipContent>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
}
