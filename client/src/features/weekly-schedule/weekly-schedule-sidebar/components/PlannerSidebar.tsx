import SubjectOfferCard from './SubjectOfferCard';

import { Input } from '@ui/input';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarRail } from '@ui/sidebar';

import { Subject } from '@/interfaces/Subject';

interface Props {
  onAddSubject: () => void;
}

export function PlannerSidebar() {
  const subjects: Subject[] = [
    {
      code: {
        ID: 'MATH101',
        Table: 'subjects',
      },
      name: 'Matemáticas I',
      careers: [
        {
          ID: 'ING',
          Table: 'careers',
        },
        {
          ID: 'CS',
          Table: 'careers',
        },
      ],
      credits: 5,
      BPCredits: 3,
    },
    {
      code: {
        ID: 'PHYS101',
        Table: 'subjects',
      },
      name: 'Física I',
      careers: [
        {
          ID: 'ING',
          Table: 'careers',
        },
      ],
      credits: 4,
      BPCredits: 2,
    },
    {
      code: {
        ID: 'CHEM101',
        Table: 'subjects',
      },
      name: 'Química I',
      careers: [
        {
          ID: 'ING',
          Table: 'careers',
        },
      ],
      credits: 4,
      BPCredits: 2,
    },
  ];

  return (
    <div>
      <Sidebar>
        <SidebarHeader>
          <Input placeholder="Buscar oferta ..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup title="Materias" className="gap-2">
            {subjects.map((subject) => (
              <SubjectOfferCard key={subject.code.ID} subject={subject} />
            ))}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />

        <SidebarRail />
      </Sidebar>
    </div>
  );
}
