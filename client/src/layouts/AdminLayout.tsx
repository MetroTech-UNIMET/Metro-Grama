import { Outlet } from "react-router-dom";

import AuthenticationContext, { OnlyAdmin } from "@/contexts/AuthenticationContext";
import { Toaster } from "@ui/toaster";

export default function AdminLayout() {
  return (
    <>
      <AuthenticationContext>
        <OnlyAdmin>

        <Outlet />
        </OnlyAdmin>
      </AuthenticationContext>
      <Toaster />
    </>
  );
}
