import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { SubjectSheetBody } from './SubjectSheetBody';

import { Sheet, SheetContent } from '@ui/sheet';

import type { Subject } from '@/interfaces/Subject';

interface SubjectSheetContextProps {
  subject: Subject | null;
  selectSubject: (subject: Subject | null) => void;
}

const SubjectSheetContext = createContext<SubjectSheetContextProps | null>(null);

export function useSubjectSheet() {
  const context = useContext(SubjectSheetContext);
  if (!context) {
    throw new Error('useSubjectSheet must be used within a SubjectSheetProvider');
  }
  return context;
}

export function SubjectSheet({ children }: { children: React.ReactNode }) {
  const [subject, setSubject] = useState<Subject | null>(null);

  function selectSubject(subject: Subject | null) {
    setSubject(subject);
  }

  return (
    <SubjectSheetContext.Provider value={{ subject, selectSubject }}>
      <Sheet
        open={subject !== null}
        // modal={true}
        onOpenChange={subject !== null ? () => selectSubject(null) : undefined}
      >
        {children}
      </Sheet>
    </SubjectSheetContext.Provider>
  );
}

export function SubjectSheetContent() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const { subject, selectSubject } = useSubjectSheet();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        selectSubject(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return <SheetContent ref={sheetRef}>{subject && <SubjectSheetBody subject={subject} />}</SheetContent>;
}
