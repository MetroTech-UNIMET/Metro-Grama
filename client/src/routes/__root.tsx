import { createRootRouteWithContext } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from 'sonner';

import { TooltipProvider } from '@ui/tooltip';

import type { QueryClient } from '@tanstack/react-query';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
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
