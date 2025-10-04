import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/tabs';
import type { MyStudentDetails, OtherStudentDetails, PassedSubjectEntry } from '@/interfaces/Student';
import { BicepsFlexed, Hourglass, Star } from 'lucide-react';

interface Props {
  // Array of groups: { trimester: RecordID; subjects: [{ subject: SubjectEntity; grade; difficulty; workload }] }
  passed_subjects: (MyStudentDetails | OtherStudentDetails)['passed_subjects'];
}

export function SubjectsCard({ passed_subjects }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materias aprobadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {passed_subjects.length === 0 ? (
          <div className="text-muted-foreground text-sm">Aún no hay materias aprobadas</div>
        ) : (
          <Tabs defaultValue={(passed_subjects[0]?.trimester).ID}>
            <TabsList>
              {passed_subjects.map((group) => {
                const value = group.trimester.ID;
                return (
                  <TabsTrigger key={value} value={value}>
                    {value}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {passed_subjects.map((group) => {
              const value = group.trimester.ID;
              return (
                <TabsContent key={value} value={value}>
                  <div className="my-2 ml-auto w-fit">
                    <span className="text-muted-foreground">Promedio del trimestre:</span> {/* TODO - Redondear */}
                    <span className="font-medium">{group.average_grade}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.subjects.map((s, idx) => (
                      <SubjectCard key={`${s.subject.id.ID}-${idx}`} subjectEntry={s} />
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

interface SubjectsCardProps {
  subjectEntry: PassedSubjectEntry;
}

function SubjectCard({ subjectEntry }: SubjectsCardProps) {
  const subjectCode = subjectEntry.subject.id.ID;
  return (
    <Card variant="outline" className="flex flex-row items-center justify-between gap-2">
      <CardContent className="px-2 pb-4">
        <CardTitle>{subjectEntry.subject.name}</CardTitle>
        <span>({subjectCode})</span>
        <div className="mt-4 space-y-2">
          {/* Difficulty Row */}
          <div className="mr-4 flex items-center gap-2">
            <BicepsFlexed className="text-muted-foreground h-4 w-4" />
            <Stars value={subjectEntry.difficulty} max={5} />
          </div>

          {/* Workload Row */}
          <div className="flex items-center gap-2">
            <Hourglass className="text-muted-foreground h-4 w-4" />
            <Stars value={subjectEntry.workload} max={5} />
          </div>
        </div>
      </CardContent>

      <span className="text-2xl font-bold">{subjectEntry.grade}</span>
    </Card>
  );
}

function Stars({ value, max }: { value: number | null; max: number }) {
  const safe = typeof value === 'number' ? value : 0;
  const clamped = Math.max(0, Math.min(safe, max));
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < clamped;
        return (
          <Star
            key={i}
            className={filled ? 'text-yellow-500' : 'text-muted-foreground'}
            size={16}
            strokeWidth={2}
            fill={filled ? 'currentColor' : 'none'}
          />
        );
      })}
    </div>
  );
}
