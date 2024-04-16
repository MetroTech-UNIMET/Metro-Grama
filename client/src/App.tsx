import { QueryClient, QueryClientProvider } from "react-query";
import Graph from "@/components/graph/Graph";
import GraphLayout from "./layouts/GraphLayout";
import { SubjectSheet, SubjectSheetContent } from "@components/SubjectSheet";
import { StatusActions } from "@components/graph/behaviors/StatusActions";

function App() {
  const queryClient = new QueryClient();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <GraphLayout>
          <SubjectSheet>
            <StatusActions>
              <Graph />
            </StatusActions>

            <SubjectSheetContent />
          </SubjectSheet>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </GraphLayout>
      </QueryClientProvider>
    </>
  );
}

export default App;
