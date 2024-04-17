import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Grafo from "./features/grafo/Grafo";
import GraphLayout from "./layouts/GraphLayout";

function App() {
  const router = createBrowserRouter([
    { path: "/hero", element: <h1>Herro</h1> },

    {
      element: <GraphLayout />,

      children: [{ path: "/", element: <Grafo /> }],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
