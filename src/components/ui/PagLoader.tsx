import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeProvider";

const PageLoader = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        theme === "dark" ? "bg-[#0C0D12]" : "bg-[#E9EBED]"
      }`}
    >
      <div className="relative flex flex-col items-center gap-8">
        {/* Main Spinner */}
        <div className="relative w-24 h-24">
          {/* Outer Ring */}
          <motion.div
            className={`absolute inset-0 rounded-full border-4 ${
              theme === "dark" ? "border-blue-500/20" : "border-blue-600/20"
            }`}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Middle Ring */}
          <motion.div
            className={`absolute inset-2 rounded-full border-4 border-transparent ${
              theme === "dark"
                ? "border-t-purple-500 border-r-purple-500"
                : "border-t-purple-600 border-r-purple-600"
            }`}
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Inner Ring */}
          <motion.div
            className={`absolute inset-4 rounded-full border-4 border-transparent ${
              theme === "dark"
                ? "border-t-blue-400 border-l-blue-400"
                : "border-t-blue-500 border-l-blue-500"
            }`}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Center Dot */}
          <motion.div
            className={`absolute inset-0 m-auto w-3 h-3 rounded-full ${
              theme === "dark"
                ? "bg-gradient-to-r from-blue-400 to-purple-500"
                : "bg-gradient-to-r from-blue-600 to-purple-600"
            }`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <motion.h2
            className={`text-2xl font-bold bg-gradient-to-r ${
              theme === "dark"
                ? "from-blue-400 to-purple-500"
                : "from-blue-600 to-purple-600"
            } bg-clip-text text-transparent`}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading
          </motion.h2>

          {/* Animated Dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                }`}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Glow Effect */}
        <motion.div
          className={`absolute inset-0 blur-3xl opacity-20 ${
            theme === "dark"
              ? "bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
              : "bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"
          }`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
};

export default PageLoader;
