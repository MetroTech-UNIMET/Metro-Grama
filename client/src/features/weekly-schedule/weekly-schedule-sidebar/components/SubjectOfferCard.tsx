import { useMemo } from 'react';
import { Target } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

interface Props {
  subjectOffer: SubjectOfferWithSections;
  onSelect: (subjectOffer: SubjectOfferWithSections) => void;
  getIsSubjectSelected: (subjectOffer: SubjectOfferWithSections) => boolean;
}
// REVIEW - Puedo poner los amigos que la están viendo
export default function SubjectOfferCard({ subjectOffer, onSelect, getIsSubjectSelected }: Props) {
  const { subject } = subjectOffer;

  const numSections = subjectOffer.sections.length;
  const isSelected = useMemo(() => getIsSubjectSelected(subjectOffer), [getIsSubjectSelected, subjectOffer]);

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => onSelect(subjectOffer)}>
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
