import { QueryClient, QueryClientProvider } from "react-query";
import Graph from "@/components/graph/Graph";
import GraphLayout from "./layouts/GraphLayout";
import { SubjectSheet, SubjectSheetContent } from "@components/SubjectSheet";

function App() {
  const queryClient = new QueryClient();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <GraphLayout>
          <SubjectSheet>
            <Graph />

            <SubjectSheetContent/>
              
          </SubjectSheet>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </GraphLayout>
      </QueryClientProvider>
    </>
  );
}

export default App;
