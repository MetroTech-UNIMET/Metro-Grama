import { Outlet } from "react-router-dom";

import  { OnlyAdmin } from "@/contexts/AuthenticationContext";
import { Toaster } from "@ui/toaster";

export default function AdminLayout() {
  return (
    <>
      <OnlyAdmin>
        <Outlet />
      </OnlyAdmin>
      <Toaster />
    </>
  );
}
