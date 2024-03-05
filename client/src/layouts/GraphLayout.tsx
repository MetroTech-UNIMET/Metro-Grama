import React from "react";

export default function GraphLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-primary-purple-900 to-[#1D1B32]
      text-UI-white w-screen h-screen p-8">
      {children}
      <div className="fixed bottom-4 left-4">
        <h1 >LOGO METROTECH</h1>
      </div>
    </div>
  );
}
