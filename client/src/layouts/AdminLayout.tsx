import { Outlet } from "@tanstack/react-router";

import AuthenticationContext, {
  OnlyAdmin,
} from "@/contexts/AuthenticationContext";

export default function AdminLayout() {
  return (
    <>
      <AuthenticationContext>
        <OnlyAdmin>
          <Outlet />
        </OnlyAdmin>
      </AuthenticationContext>
    </>
  );
}
