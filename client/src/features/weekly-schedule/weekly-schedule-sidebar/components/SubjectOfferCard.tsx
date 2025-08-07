import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';

import type { Subject } from '@/interfaces/Subject';
import { Badge } from '@ui/badge';

interface Props {
  subject: Subject;
}
// REVIEW - Puedo poner los amigos que la están viendo
export default function SubjectOfferCard({ subject }: Props) {
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => {}}>
      <CardHeader>
        <CardTitle className="text-lg">{subject.name}</CardTitle>
        <CardDescription>{subject.code.ID}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex w-full justify-between">
          <p>Desbloquea: 2</p>

          <Badge>1 horario</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
