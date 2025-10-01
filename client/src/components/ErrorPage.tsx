import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  error: unknown;
  reset?: () => void;
};

function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    const anyErr = error as any;
    if (anyErr?.response?.data?.message) return String(anyErr.response.data.message);
    if (anyErr?.message) return String(anyErr.message);
    return JSON.stringify(anyErr);
  } catch {
    return "Unknown error";
  }
}

export default function ErrorPage({ title, error, reset }: Props) {
  const message = getErrorMessage(error);
  return (
    <div className="p-4">
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold text-destructive">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {typeof reset === "function" && (
          <div className="mt-4">
            <Button colors='primary' onClick={() => reset()}>
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
