import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';

import type { SubjectOfferWithSchedules } from '@/interfaces/SubjectOffer';

interface Props {
  subjectOffer: SubjectOfferWithSchedules;
  onSelect: (subjectOffer: SubjectOfferWithSchedules) => void;
}
// REVIEW - Puedo poner los amigos que la están viendo
export default function SubjectOfferCard({ subjectOffer, onSelect }: Props) {
  const { subject } = subjectOffer;

  const numSchedules = subjectOffer.schedules.length;

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => onSelect(subjectOffer)}>
      <CardHeader>
        <CardTitle className="text-lg">{subject.name}</CardTitle>
        <CardDescription>{subject.id.ID}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex w-full justify-between">
          <p>Desbloquea: 2</p>

          {numSchedules !== 0 ? (
            <Badge>
              {numSchedules} horario{numSchedules !== 1 ? 's' : ''}
            </Badge>
          ) : (
            <Badge>Sin horarios</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
