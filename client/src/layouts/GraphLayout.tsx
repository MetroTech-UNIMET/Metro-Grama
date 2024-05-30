import AuthenticationContext from "@/contexts/AuthenticationContext";
import { Toaster } from "@ui/toaster";
import { Outlet } from "react-router-dom";
export default function GraphLayout() {
  return (
    <>
      <main
        className="bg-gradient-to-b from-primary-900 to-[#1D1B32]
      text-UI-white w-screen h-screen p-8"
      >
        <AuthenticationContext>
          <Outlet />
        </AuthenticationContext>
      </main>
      <Toaster />
    </>
  );
}
