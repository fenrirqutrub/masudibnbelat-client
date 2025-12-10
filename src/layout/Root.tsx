import { Outlet } from "react-router";
import { Suspense } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useTheme } from "../context/ThemeProvider";
import Contact from "../components/Contact/Contact";
import PageLoader from "../components/ui/PagLoader";

const Root = () => {
  const { theme } = useTheme();

  return (
    <div
      className={` ${
        theme === "dark"
          ? "bg-[#0C0D12] text-[#F8f9fa]"
          : "bg-[#E9EBED] text-[#0C0D12]"
      }`}
    >
      <div className="container mx-auto">
        <Navbar />
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
        <Contact />
      </div>
    </div>
  );
};

export default Root;
