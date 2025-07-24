import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Toaster } from "sonner";
import { lazy } from "react";

import GraphLayout from "@/layouts/GraphLayout";
import AdminLayout from "@/layouts/AdminLayout";
import SuspenseLayout from "@/layouts/SuspenseLayout";
// import BasicLayout from "@/layouts/BasicLayout";

// import { Principal } from "@/features/Principal/Principal";
// import Login from "@/features/login-register/Login";
const RegisterAdmin = lazy(
  () => import("@/pages/(auth)/register/admin/RegisterAdmin")
);
const RegisterStudent = lazy(
  () => import("@/pages/(auth)/register/student/RegisterStudent")
);

const CreateCareer = lazy(() => import("@/pages/admin/careers/CreateCareer"));
const UpdateCareer = lazy(() => import("@/pages/admin/careers/UpdateCareer"));
const Grafo = lazy(() => import("@/pages/Home"));

function App() {
  const router = createBrowserRouter([
    {
      element: <SuspenseLayout />,
      children: [
        {
          children: [
            { path: "/register/admin", element: <RegisterAdmin /> },
            { path: "/register/student", element: <RegisterStudent /> },
          ],
        },
        {
          element: <GraphLayout />,
          children: [
            {
              path: "/materias",
              element: <Grafo />,
            },
            // FIXME Redirect to materia - Eliminar para poner landing a futuro
            { path: "/", element: <Navigate to="/materias" /> },
          ],
        },
        {
          element: <AdminLayout />,
          path: "/admin",
          children: [
            {
              path: "carreras",
              children: [
                {
                  path: "crear",
                  element: <CreateCareer />,
                },
                {
                  path: "editar/:id",
                  element: <UpdateCareer />,
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
