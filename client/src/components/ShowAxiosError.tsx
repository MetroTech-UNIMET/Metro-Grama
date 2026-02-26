import { AxiosError } from "axios";

interface Props {
  error: AxiosError;
}

export function ShowAxiosError({ error }: Props) {
  const code = error.response?.status;
  const message = (error.response?.data as any)?.message ?? error.message;

  return (
    <div className="grid place-items-center h-full">
      <article className="shadow-lg p-8 grid max-w-xl">
        <h1 className="text-9xl text-center">{code}</h1>
        <p className="text-3xl mt-8 text-slate-200 text-center">{message}</p>
        <span className="text-7xl text-center mt-4">😓</span>
      </article>
    </div>
  );
}
