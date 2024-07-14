import Graph from "@/components/graph/Graph";
import { StatusActions } from "@/components/graph/behaviors/StatusActions";

import { SubjectSheet, SubjectSheetContent } from "@components/SubjectSheet";

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