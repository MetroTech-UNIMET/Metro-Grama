import Footer from "@/features/hero/Footer";
import Navbar from "@/features/hero/Navbar";
import { Outlet } from "@tanstack/react-router";

export default function BasicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
