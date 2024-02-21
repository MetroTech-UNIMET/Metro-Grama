import React from "react";

export default function GraphLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-UI-black text-UI-white w-screen h-screen p-8">
      {children}
      <div className="fixed bottom-4 left-4">
        <h1 >LOGO METROTECH</h1>
      </div>
    </div>
  );
}
