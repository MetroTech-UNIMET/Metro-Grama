import { Suspense } from "react";
import { Outlet } from "react-router-dom";
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