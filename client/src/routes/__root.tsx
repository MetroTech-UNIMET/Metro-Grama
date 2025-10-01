import { createRootRouteWithContext } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { TooltipProvider } from '@ui/tooltip';
import { Toaster } from '@ui/sonner';

import type { QueryClient } from '@tanstack/react-query';
import type { AuthContextProps } from '@/contexts/AuthenticationContext';

interface RootRouteContext {
  auth: AuthContextProps;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: () => (
    <>
      <TooltipProvider>
        <Outlet />

        <ReactQueryDevtools initialIsOpen={false} />
        <TanStackRouterDevtools initialIsOpen={false} />

        <Toaster richColors closeButton />
      </TooltipProvider>
    </>
  ),
});
