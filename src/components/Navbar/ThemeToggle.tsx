import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeProvider";

interface ThemeToggleProps {
  size?: number;
  animationSpeed?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 50,
  animationSpeed = 0.4,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex items-center justify-center outline-none border-none rounded-full cursor-pointer p-2"
      style={{
        width: size,
        height: size,
        backgroundColor: theme === "dark" ? "transparent" : "transparent",
        transition: `background-color ${animationSpeed}s ease`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
            transition={{ duration: animationSpeed }}
          >
            <Moon size={size * 0.6} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, scale: 0.6, rotate: 90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: -90 }}
            transition={{ duration: animationSpeed }}
          >
            <Sun size={size * 0.65} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
