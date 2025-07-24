import { Outlet } from "react-router-dom";
import AuthenticationContext from "@/contexts/AuthenticationContext";

export default function GraphLayout() {
  return (
    <>
      <main
        className="bg-gradient-to-b from-primary-900 to-[#1D1B32]
      text-UI-white h-svh p-8"
      >
        <AuthenticationContext>
          <Outlet />
        </AuthenticationContext>
      </main>
    </>
  );
}
