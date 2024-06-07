import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("No hay root");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <App />

    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
