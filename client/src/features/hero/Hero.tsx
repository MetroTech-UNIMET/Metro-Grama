import { cn } from "@/lib/utils/className";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="bg-gray-900">
      <div className="relative isolate overflow-hidden pt-14">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <CloudBlur
          containerClassName="-top-40 sm:-top-80"
          blurClassName="left-[calc(50%+3rem)] sm:left-[calc(50%-30rem)]"
        />
        <CloudBlur
          containerClassName="top-[calc(100%-13rem)] sm:top-[calc(100%-30rem)]"
          blurClassName=" left-[calc(50%-11rem)] sm:left-[calc(50%+36rem)]"
        />
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center"></div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Ajusta tus materias con Metrograma
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
              lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
              fugiat aliqua.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Registrate
              </Link>
              <Link
                to="/sobre"
                className="text-sm font-semibold leading-6 text-white"
              >
                Aprende mas <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloudBlur({
  containerClassName = "",
  blurClassName = "",
}: {
  containerClassName?: string;
  blurClassName?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl",
        containerClassName
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "relative aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:w-[72.1875rem]",
          blurClassName
        )}
        style={{
          clipPath:
            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
        }}
      />
    </div>
  );
}
