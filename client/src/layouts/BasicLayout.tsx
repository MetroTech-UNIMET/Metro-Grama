import Footer from "@/features/hero/Footer";
import Navbar from "@/features/hero/Navbar";
import { Outlet } from "react-router-dom";

export default function BasicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
