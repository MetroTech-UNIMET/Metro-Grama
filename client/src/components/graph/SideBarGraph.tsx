import {
  DrawerTrigger,
  DrawerContent,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@ui/drawer";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

import Icono from "@/assets/images/Icono_MetroTech.png";
import GoogleLogin from "@ui/derived/GoogleLogin";

{
  /* TODO - Considerar controlar el open para que se abra como default */
}
export default function SideBarGraph() {
  const noUser = (
    <>
      <GoogleLogin />
    </>
  );

  return (
    <Drawer direction="left" orientation="vertical">
      <DrawerTrigger>
        <Menu
          className="rounded-full p-2 shadow-md transition-all
          bg-primary-500 hover:bg-primary-600
          active:bg-primary-700 active:scale-90"
          size={38}
        />
      </DrawerTrigger>
      <DrawerContent className="flex flex-col">
        <DrawerHeader>
          <Link to="/">
            <img src={Icono} alt="Logo" className="w-28 h-28 mx-auto" />
          </Link>
          <DrawerTitle className="text-3xl text-center">
            Metro-Grama
          </DrawerTitle>
        </DrawerHeader>
        <div className=" px-4 py-2">Proximamente más funciones...</div>

        <DrawerFooter>{noUser}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
