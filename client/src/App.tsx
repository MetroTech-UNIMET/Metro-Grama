import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Grafo from "./features/grafo/Grafo";
import GraphLayout from "./layouts/GraphLayout";
import Hero from "./features/landing/Hero";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Hero /> },

    {
      element: <GraphLayout />,

      children: [{ path: "/graph", element: <Grafo /> }],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
