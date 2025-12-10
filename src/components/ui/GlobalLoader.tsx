import { motion } from "framer-motion";

interface GlobalLoaderProps {
  theme?: "dark" | "light";
}

const GlobalLoader = ({ theme = "dark" }: GlobalLoaderProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        theme === "dark" ? "bg-[#0C0D12]" : "bg-[#E9EBED]"
      }`}
    >
      <div className="relative flex flex-col items-center gap-12">
        {/* Logo/Brand Animation */}
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Hexagon Shape */}
          <motion.div
            className="relative w-32 h-32"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Outer Hexagon */}
            <svg
              viewBox="0 0 100 100"
              className={`w-full h-full ${
                theme === "dark" ? "text-blue-500" : "text-blue-600"
              }`}
            >
              <motion.polygon
                points="50 5, 95 27.5, 95 72.5, 50 95, 5 72.5, 5 27.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>

            {/* Inner Hexagon */}
            <svg
              viewBox="0 0 100 100"
              className={`absolute inset-0 w-full h-full ${
                theme === "dark" ? "text-purple-500" : "text-purple-600"
              }`}
            >
              <motion.polygon
                points="50 15, 85 32.5, 85 67.5, 50 85, 15 67.5, 15 32.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
            </svg>

            {/* Center Circle */}
            <motion.div
              className={`absolute inset-0 m-auto w-12 h-12 rounded-full border-4 ${
                theme === "dark"
                  ? "border-blue-400 bg-blue-500/10"
                  : "border-blue-500 bg-blue-600/10"
              }`}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [-360, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Orbiting Particles */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-400 to-purple-500"
                  : "bg-gradient-to-r from-blue-600 to-purple-600"
              }`}
              style={{
                top: "50%",
                left: "50%",
                marginTop: "-4px",
                marginLeft: "-4px",
              }}
              animate={{
                x: [
                  Math.cos((angle * Math.PI) / 180) * 70,
                  Math.cos(((angle + 360) * Math.PI) / 180) * 70,
                ],
                y: [
                  Math.sin((angle * Math.PI) / 180) * 70,
                  Math.sin(((angle + 360) * Math.PI) / 180) * 70,
                ],
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Loading Text with Typing Effect */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.h1
              className={`text-4xl font-bold bg-gradient-to-r ${
                theme === "dark"
                  ? "from-blue-400 via-purple-500 to-blue-400"
                  : "from-blue-600 via-purple-600 to-blue-600"
              } bg-clip-text text-transparent bg-[length:200%_auto]`}
              animate={{
                backgroundPosition: ["0% center", "200% center"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              Loading
            </motion.h1>
          </motion.div>

          {/* Progress Bar */}
          <div
            className={`w-64 h-2 rounded-full overflow-hidden ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-300"
            }`}
          >
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${
                theme === "dark"
                  ? "from-blue-500 via-purple-500 to-blue-500"
                  : "from-blue-600 via-purple-600 to-blue-600"
              } bg-[length:200%_auto]`}
              initial={{ width: "0%" }}
              animate={{
                width: ["0%", "100%"],
                backgroundPosition: ["0% center", "200% center"],
              }}
              transition={{
                width: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                backgroundPosition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />
          </div>

          {/* Animated Dots */}
          <div className="flex gap-2 mt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                }`}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Loading Message */}
          <motion.p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            } mt-2`}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Please wait while we prepare everything...
          </motion.p>
        </div>

        {/* Background Glow */}
        <motion.div
          className={`absolute inset-0 blur-[100px] opacity-30 ${
            theme === "dark"
              ? "bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30"
              : "bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30"
          }`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              theme === "dark" ? "bg-blue-400/30" : "bg-blue-600/30"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GlobalLoader;
