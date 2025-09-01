import { Suspense } from "react";
import { Outlet } from "@tanstack/react-router";
import { Spinner } from "@ui/spinner";

function DefaultSpinner() {
  return (
    <div className="flex justify-center items-center h-full">
      <Spinner size="giant" />
    </div>
  );
}

export default function SuspenseLayout() {
  return (
    <Suspense fallback={<DefaultSpinner />}>
      <Outlet />
    </Suspense>
  );
} 