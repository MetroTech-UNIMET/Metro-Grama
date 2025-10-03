import { Outlet } from '@tanstack/react-router';
import { Home, Calendar, LayoutList, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthenticationContext';

import MenuDockLink, { type DockLinkItem } from '@ui/shadcn-io/menu-dock/menu-dock-link';
import { useMemo } from 'react';

const LayoutListInverted = () => <LayoutList className="rotate-180" />;

function buildBaseItems(): DockLinkItem[] {
  return [
    {
      label: 'Materias',
      to: '/materias',
      icon: Home,
      search: (prev) => ({
        careers: prev?.careers ?? [],
      }),
    },
    {
      label: 'Horario',
      to: '/horario',
      search: (prev) => ({
        careers: prev?.careers ?? [],
        trimester: 'none',
        is_principal: true,
        search: '',
        orderBy: 'name',
        filterByDays: [],
      }),
      icon: Calendar,
    },
    {
      label: 'Oferta anual',
      to: '/oferta',
      search: (prev) => ({
        careers: prev?.careers ?? [],
        year: 'none',
      }),
      icon: LayoutListInverted,
    },
  ];
}

export function NavLayout({ children }: { children?: React.ReactNode }) {
  const { status } = useAuth();

  const items = useMemo(() => {
    const baseItems = buildBaseItems();
    if (status === 'authenticated') {
      baseItems.push({ label: 'Perfil', to: '/profile', icon: User });
    }
    return baseItems;
  }, [status]);

  return (
    <>
      {children ? children : <Outlet />}

      <MenuDockLink className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2" items={items} />
    </>
  );
}
export default NavLayout;
