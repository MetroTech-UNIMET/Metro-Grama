import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

interface Props {
  subjectOffer: SubjectOfferWithSections;
  onSelect: (subjectOffer: SubjectOfferWithSections) => void;
}
// REVIEW - Puedo poner los amigos que la están viendo
export default function SubjectOfferCard({ subjectOffer, onSelect }: Props) {
  const { subject } = subjectOffer;

  const numSections = subjectOffer.sections.length;

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => onSelect(subjectOffer)}>
      <CardHeader>
        <CardTitle className="text-lg">{subject.name}</CardTitle>
        <CardDescription>{subject.id.ID}</CardDescription>
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
