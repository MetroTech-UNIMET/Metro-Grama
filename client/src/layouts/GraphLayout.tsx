import Icono from "@/assets/images/Icono_MetroTech.png";

export default function GraphLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-b from-primary-purple-900 to-[#1D1B32]
      text-UI-white w-screen h-screen p-8">
      {children}
      <div className="fixed bottom-4 left-4">
        <img src={Icono} alt="Icono MetroTech" className="w-32 aspect-square" />
      </div>
    </div>
  );
}
