import { Outlet } from "react-router";
import Navbar from "../components/Navbar/Navbar";
import Contact from "../components/Contact/Contact";

const Root = () => {
  return (
    <div className="bg-bgPrimary text-textPrimary">
      <div className="container mx-auto">
        <Navbar />
        <Outlet />
        <Contact />
      </div>
    </div>
  );
};

export default Root;
