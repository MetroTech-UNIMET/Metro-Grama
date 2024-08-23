import Graph from "@/features/grafo/Graph";
import { StatusActions } from "@/features/grafo/behaviors/StatusActions";

import { SubjectSheet, SubjectSheetContent } from "@/features/grafo/SubjectSheet";

export default function Grafo() {
  return (
    <>
      <StatusActions>
        <SubjectSheet>
          <Graph />

          <SubjectSheetContent />
        </SubjectSheet>
      </StatusActions>
    </>
  );
}