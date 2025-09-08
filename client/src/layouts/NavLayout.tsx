import { Outlet } from '@tanstack/react-router';
import { Home, Calendar } from 'lucide-react';

import MenuDockLink, { type DockLinkItem } from '@ui/shadcn-io/menu-dock/menu-dock-link';

const items: DockLinkItem[] = [
  {
    label: 'Materias',
    to: '/materias',
    icon: Home,
  },
  {
    label: 'Horario',
    to: '/horario',
    search: (prev) => ({
      careers: prev?.careers ?? [],
      trimester: 'none',
      is_principal: true,
    }),
    icon: Calendar,
  },
];

export function NavLayout({ children }: { children?: React.ReactNode }) {
  return (
    <>
      {children ? children : <Outlet />}

      <MenuDockLink className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2" items={items} />
    </>
  );
}
export default NavLayout;
