import { QueryClient, QueryClientProvider } from "react-query";
import Graph from "@components/Graph";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Graph />
    </QueryClientProvider>
  );
}

export default App;
