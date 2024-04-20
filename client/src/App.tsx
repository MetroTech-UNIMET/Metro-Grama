import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Grafo from "./features/grafo/Grafo";
import GraphLayout from "./layouts/GraphLayout";

import Navbar from "./features/hero/Navbar";
import { Principal } from "./features/Principal/Principal";
import Login from "./features/login-register/Login";

function App() {
  const router = createBrowserRouter([
    {
      element: <Navbar />,
      children: [
        { path: "/", element: <Principal /> },
        { path: "/login", element: <Login /> },

        {
          element: <GraphLayout />,

          children: [{ path: "/materias", element: <Grafo /> }],
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
