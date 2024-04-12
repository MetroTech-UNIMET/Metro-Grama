import Icono from "@/assets/images/Icono_MetroTech.png";
import Navbar from "@/features/grafo/Navbar";

import { Outlet } from "react-router-dom";

export default function GraphLayout() {
  return (
    <>
      <div className="sticky top-0">
        <Navbar />
      </div>

      <div
        className="bg-gradient-to-b from-primary-purple-900 to-[#1D1B32]
      text-UI-white w-screen h-screen p-8"
      >
        <Outlet />
        <div className="fixed bottom-4 left-4">
          <img
            src={Icono}
            alt="Icono MetroTech"
            className="w-32 aspect-square"
          />
        </div>
      </div>
    </>
  );
}
