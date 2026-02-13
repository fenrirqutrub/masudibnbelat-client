import { Link } from "react-router";
import { useTheme } from "../../context/ThemeProvider";
import Social from "./Social";

const Contact = () => {
  const { theme } = useTheme();
  return (
    <footer className=" ">
      <div className="flex justify-center flex-col gap-[30px]  ">
        <div>
          <h2
            className={`rubik-bold tracking-[10px] text-3xl md:text-5xl uppercase text-center mt-10 ${
              theme === "dark" ? "text-[#E9EBED] " : "text-[#0C0D12]"
            } `}
          >
            Contact US
          </h2>
        </div>

        <div className="flex items-end justify-center ">
          <Social />
        </div>

        <div className="border-t  border-[oklch(70.7% 0.022 261.325)] py-[20px] flex items-center w-full flex-wrap gap-[20px] justify-center">
          <p className="text-[0.8rem] sm:text-[0.9rem] text-gray-600 py-0 rubik-regular">
            &copy; 2021 All Rights Reserved by{" "}
            <Link to="/admin-login" className="rubik-bold">
              Masud ibn Belat
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
