import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
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
      >
        {children}
      </Sheet>
      ;
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
      {subject && (
        <SheetHeader>
          <SheetTitle>{subject?.name}</SheetTitle>
          <SheetDescription>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
          </SheetDescription>
        </SheetHeader>
      )}
    </SheetContent>
  );
}
