import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@ui/sheet";
import { Badge } from "@ui/badge";
import { Subject } from "@/interfaces/Subject";

interface SubjectSheetContextProps {
  subject: Subject | null;
  selectSubject: (subject: Subject | null) => void;
}

const SubjectSheetContext = createContext<SubjectSheetContextProps | null>(
  null
);

export function useSubjectSheet() {
  const context = useContext(SubjectSheetContext);
  if (!context) {
    throw new Error(
      "useSubjectSheet must be used within a SubjectSheetProvider"
    );
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
      if (
        sheetRef.current &&
        !sheetRef.current.contains(event.target as Node)
      ) {
        selectSubject(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SheetContent ref={sheetRef}>
      {subject && <SubjectSheetBody subject={subject} />}
    </SheetContent>
  );
}

function SubjectSheetBody({ subject }: { subject: Subject }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>
          {subject.name} ({subject.code})
        </SheetTitle>
      </SheetHeader>

      <main className="mt-2 space-y-4">
        <section className="flex flex-wrap gap-4 justify-center">
          {subject.careers.map((career) => (
            <Badge key={career} className="line-clamp-1">
              {career.split(":")[1]}
            </Badge>
          ))}
        </section>

        <SheetDescription>Proximamente...</SheetDescription>
      </main>

      {/* REVIEW - Considerar poner acciones */}
      {/* <SheetFooter>Proximamente...</SheetFooter> */}
    </>
  );
}
