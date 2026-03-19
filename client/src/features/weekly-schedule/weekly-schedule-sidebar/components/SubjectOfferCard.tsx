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

  const differentFriends = subjectOffer.differentFriends;
  const numSections = subjectOffer.sections.length;
  const numPrelations = subjectOffer.prelations.length;

  const handleSelect = () => onSelect(subjectOffer);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <Card
      className={cn('cursor-pointer transition-shadow hover:shadow-lg', {
        'border-green-400 bg-green-50': state === 'isEnrolled',
        'border-blue-400 bg-blue-50': state === 'isEnrollable',
        'border-gray-200': state === 'default',
      })}
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
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

        {differentFriends > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <div className="relative">
                <span className="absolute -top-2 left-full font-bold">{differentFriends}</span>
                <User />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {differentFriends} amig{differentFriends !== 1 ? 'os' : 'o'} planea{differentFriends !== 1 ? 'n' : ''} inscribir esta materia
            </TooltipContent>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
}
