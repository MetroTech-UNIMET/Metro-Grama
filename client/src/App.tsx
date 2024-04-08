import { QueryClient, QueryClientProvider } from "react-query";
import Graph from "@/components/graph/Graph";
import GraphLayout from "./layouts/GraphLayout";

function App() {
  const queryClient = new QueryClient();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <GraphLayout>

          <Graph />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </GraphLayout>
      </QueryClientProvider>
    </>
  );
}

export default App;
