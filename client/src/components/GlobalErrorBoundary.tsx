import type { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

interface Props {
  children: ReactNode;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="grid h-screen place-items-center p-8 text-center">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Algo salio mal</h1>
        <p className="mb-4 text-muted-foreground">{getErrorMessage(error)}</p>
        <button
          onClick={() => {
            resetErrorBoundary();
            window.location.reload();
          }}
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
          type="button"
        >
          Recargar pagina
        </button>
      </div>
    </div>
  );
}

export function GlobalErrorBoundary({ children }: Props) {
  const handleError = (error: unknown, info: ErrorInfo) => {
    console.error('[GlobalErrorBoundary]', error, info.componentStack);
    // TODO: send to an error reporting service.
  };

  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}