import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

import ErrorPage from '@components/ErrorPage';
import LoadingPage from '@components/LoadingPage';

import { routeTree } from '@/routeTree.gen';

export function createAppRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient, auth: null as any },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPendingComponent: () => <LoadingPage />,
    defaultErrorComponent: (props) => <ErrorPage title="Hubo un error inesperado" {...props} />,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    // optional:
    // handleRedirects: true,
    wrapQueryClient: false,
  });
  return { router, queryClient };
}
