/* import { Fragment } from "react"; */
import { Menu, X } from "lucide-react";
import Icono from "@/assets/images/Icono_MetroTech.png";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@utils/className";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Drawer, DrawerContent, DrawerTrigger } from "@ui/drawer";
import { ButtonLink, NavButtonLink } from "@ui/link";

const navigation = [
  { name: "Grafo", href: "/materias" },
  { name: "Materias", href: "/xd" },
  { name: "Perfil", href: "/profile" },
];

export default function Navbar() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const links = navigation.map((item) => (
    <NavLink
      key={item.name}
      to={item.href}
      className={({ isActive }) =>
        cn(
          "text-center rounded-xl px-3 py-1",
          isActive ? "bg-primary" : "hover:bg-primary-100",
          !isDesktop && "text-3xl "
        )
      }
    >
      {item.name}
    </NavLink>
  ));

  return (
    <header className="fixed flex justify-center w-full z-[999] ">
      <div
        className="flex items-center justify-between w-[95%] backdrop-blur-sm
          mt-8 py-2 px-8 rounded-3xl transition-all bg-background shadow-md"
      >
        {isDesktop ? (
          <nav className="flex flex-row justify-between items-center w-full">
            <div className="flex gap-4">{links}</div>

            <div>
              <ButtonLink to="/register" className="px-4 py-2">
                Registrate
              </ButtonLink>

              <ButtonLink variant="outline" to="/login" className="ml-4">
                Inicia Sesión
              </ButtonLink>
            </div>
          </nav>
        ) : (
          <Drawer direction="right" orientation="vertical">
            <DrawerTrigger>
              <Menu />
            </DrawerTrigger>
            <DrawerContent>
              <div className="h-full p-2">
                <nav className="flex flex-col gap-2">{links}</nav>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </header>
  );
}
