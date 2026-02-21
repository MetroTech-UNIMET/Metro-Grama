import '@antv/graphin-icons/dist/index.css';

export default function GraphLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="from-primary-500 text-UI-white h-svh bg-linear-to-b to-[#1D1B32] py-8 ">{children}</main>
    </>
  );
}
