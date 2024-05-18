import Icono from "@/assets/images/Icono_MetroTech.png";
import AuthenticationContext from "@/contexts/AuthenticationContext";
import { Outlet } from "react-router-dom";
export default function GraphLayout() {
  return (
    <div
      className="bg-gradient-to-b from-primary-900 to-[#1D1B32]
      text-UI-white w-screen h-screen p-8"
    >
      <AuthenticationContext>
        <Outlet />
      </AuthenticationContext>
      <div className="fixed bottom-4 left-4">
        <img src={Icono} alt="Icono MetroTech" className="w-32 aspect-square" />
      </div>
    </div>
  );
}
