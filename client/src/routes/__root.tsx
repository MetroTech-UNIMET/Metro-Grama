import { createRootRouteWithContext, HeadContent } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import { getRootMeta } from '.';

import { TooltipProvider } from '@ui/tooltip';
import { Toaster } from '@ui/sonner';

import type { QueryClient } from '@tanstack/react-query';
import type { AuthContextProps } from '@/contexts/AuthenticationContext';

interface RootRouteContext {
  auth: AuthContextProps;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  head: () => {
    return {
      meta: getRootMeta(),
    };
  },
  component: () => (
    <>
      <HeadContent />
      <TooltipProvider>
        <Outlet />

        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'TanStack Query',
              render: <ReactQueryDevtoolsPanel />,
              defaultOpen: true,
            },
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
              defaultOpen: false,
            },
          ]}
        />

        <Toaster richColors closeButton />
      </TooltipProvider>
    </>
  ),
});
