import { Menu } from "lucide-react";
// import Icono from "@/assets/images/Icono_MetroTech.png";
import { Link } from "@tanstack/react-router";
import { cn } from "@utils/className";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Drawer, DrawerContent, DrawerTrigger } from "@ui/drawer";
import { ButtonLink } from "@ui/link";

const navigation = [
  { name: "Grafo", href: "/materias" },
  { name: "Materias", href: "/xd" },
  { name: "Perfil", href: "/profile" },
];

export default function Navbar() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isExtraSmall = useMediaQuery("(max-width: 400px)");

  const links = navigation.map((item) => (
    <Link
      key={item.name}
      to={item.href}
      activeOptions={{ exact: true }}
      className={cn(
        "text-center rounded-xl px-3 py-1 hover:bg-primary-100 data-[status=active]:bg-primary",
        !isDesktop && "text-3xl "
      )}
    >
      {item.name}
    </Link>
  ));

  const authLinks = (
    <>
  <ButtonLink variant="outline" to="/login">
        Inicia Sesión
      </ButtonLink>
      
  <ButtonLink to="/register/student" className="ml-4">
        Regístrate
      </ButtonLink>
    </>
  );

  return (
    <header className="fixed flex justify-center w-full z-50 ">
      <div
        className="flex items-center justify-between w-[95%] backdrop-blur-xs
          mt-8 py-2 px-6 rounded-3xl transition-all bg-background shadow-md
          min-h-14"
      >
        {!isDesktop && (
          <Drawer direction="right" orientation="vertical">
            <DrawerTrigger>
              <Menu />
            </DrawerTrigger>
            <DrawerContent>
              <div className="h-full p-2 pt-12">
                <nav className="flex flex-col gap-2">{links}</nav>
              </div>
            </DrawerContent>
          </Drawer>
        )}

        <nav
          className={cn(
            "flex flex-row justify-between items-center",
            isDesktop && "w-full"
          )}
        >
          {isDesktop && <div className="flex gap-4">{links}</div>}

          {!isExtraSmall && <div>{authLinks}</div>}
        </nav>
      </div>
    </header>
  );
}
