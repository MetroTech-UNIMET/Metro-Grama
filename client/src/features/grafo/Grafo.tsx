import Graph from "@/components/graph/Graph";

import { SubjectSheet, SubjectSheetContent } from "@components/SubjectSheet";

function Grafo() {
  return (
    <>
      <SubjectSheet>
        <Graph />

        <SubjectSheetContent />
      </SubjectSheet>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </>
  );
}

export default Grafo;
