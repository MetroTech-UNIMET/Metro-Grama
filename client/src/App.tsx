import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spinner } from "@ui/spinner";

import GraphLayout from "@/layouts/GraphLayout";
import AdminLayout from "@/layouts/AdminLayout";
// import BasicLayout from "@/layouts/BasicLayout";

// import { Principal } from "@/features/Principal/Principal";
// import Login from "@/features/login-register/Login";

const CreateCareer = lazy(() => import("@/pages/admin/careers/CreateCareer"));
const UpdateCareer = lazy(() => import("@/pages/admin/careers/UpdateCareer"));
const Grafo = lazy(() => import("@/pages/Home"));

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
        {
          path: "/materias",
          element: (
            <Suspense fallback={<DefaultSpinner />}>
              <Grafo />
            </Suspense>
          ),
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
              element: (
                <Suspense fallback={<DefaultSpinner />}>
                  <CreateCareer />
                </Suspense>
              ),
            },
            {
              path: "editar/:id",
              element: (
                <Suspense fallback={<DefaultSpinner />}>
                  <UpdateCareer />
                </Suspense>
              ),
            },
          ],
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

function DefaultSpinner() {
  return (
    <div className="flex justify-center items-center h-full">
      <Spinner size="giant" />
    </div>
  );
}

export default App;
