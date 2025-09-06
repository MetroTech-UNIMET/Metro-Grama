import AuthenticationContext from "@/contexts/AuthenticationContext";
import "@antv/graphin-icons/dist/index.css";

export default function GraphLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main
        className="bg-linear-to-b from-primary-500 to-[#1D1B32]
      text-UI-white h-svh p-8"
      >
        <AuthenticationContext>
          {children}
        </AuthenticationContext>
      </main>
    </>
  );
}
