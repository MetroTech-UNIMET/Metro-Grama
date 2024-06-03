import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import GraphLayout from "@/layouts/GraphLayout";
// import BasicLayout from "@/layouts/BasicLayout";

import Grafo from "@/features/grafo/Grafo";
// import { Principal } from "@/features/Principal/Principal";
// import Login from "@/features/login-register/Login";

function App() {
  const router = createBrowserRouter([
    // {
    //   element: <BasicLayout />,
    //   children: [
    //     { path: "/", element: <Principal /> },
    //     { path: "/login", element: <Login /> },
    //   ],
    // },
    {
      element: <GraphLayout />,
      children: [
        { path: "/materias", element: <Grafo /> },

        // FIXME Redirect to materia - Eliminar para poner landing a futuro
        { path: "/", element: <Navigate to="/materias" /> },
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
