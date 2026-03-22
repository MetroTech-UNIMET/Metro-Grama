import { useMemo } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useHotkey } from '@tanstack/react-hotkeys';
import { Home, Calendar, LayoutList, User } from 'lucide-react';

import { NotificationButton } from './NotificationButton/NotificationButton';

import { useAuth } from '@/contexts/AuthenticationContext';
import { useBoolean } from '@/hooks/shadcn.io/use-boolean';

import MenuDockLink, { type DockLinkItem } from '@ui/shadcn-io/menu-dock/menu-dock-link';

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
      tooltipMessage: 'Ver las materias (Alt+1)',
    },
    {
      label: 'Horario',
      to: '/horario',
      search: (prev) => ({
        careers: prev?.careers ?? [],
        trimester: 'none',
        is_principal: true,
        search: '',
        filterByDays: [],
      }),
      icon: Calendar,
      tooltipMessage: 'Planificar horario (Alt+2)',
    },
    {
      label: 'Oferta anual',
      to: '/oferta',
      search: (prev) => ({
        careers: prev?.careers ?? [],
        year: 'none',
      }),
      icon: LayoutListInverted,
      tooltipMessage: 'Ver oferta anual de materias (Alt+3)',
    },
  ];
}

export function NavLayout() {
  const { status } = useAuth();
  const navigate = useNavigate();

  const items = useMemo(() => {
    const baseItems = buildBaseItems();
    if (status === 'authenticated') {
      baseItems.push({ label: 'Perfil', to: '/profile', icon: User, tooltipMessage: 'Ver mi perfil (Alt+4)' });
    }
    return baseItems;
  }, [status]);

  const { value: isVisible, toggle: toggleVisibility, setTrue: open } = useBoolean();

  function navigateToItem(index: number) {
    const item = items[index];
    if (item) navigate({ to: item.to, search: item.search });
  }

  useHotkey('Alt+1', (e) => {
    e.preventDefault();
    navigateToItem(0);
  });

  useHotkey('Alt+2', (e) => {
    e.preventDefault();
    navigateToItem(1);
  });

  useHotkey('Alt+3', (e) => {
    e.preventDefault();
    navigateToItem(2);
  });

  useHotkey('Alt+4', (e) => {
    e.preventDefault();
    navigateToItem(3);
  });

  return (
    <>
      <Outlet />

      <MenuDockLink
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
        items={items}
        isVisible={isVisible}
        toggleVisibility={toggleVisibility}
        open={open}
      />

      {status === 'authenticated' && <NotificationButton isDockVisible={isVisible} />}
    </>
  );
}
export default NavLayout;
