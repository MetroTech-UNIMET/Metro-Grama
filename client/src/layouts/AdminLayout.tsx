import { Outlet } from "react-router-dom";

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
