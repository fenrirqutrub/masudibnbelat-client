import { motion } from "framer-motion";

interface MiniLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "purple" | "emerald" | "orange";
  text?: string;
}

const MiniLoader = ({ size = "md", color = "blue", text }: MiniLoaderProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorClasses = {
    blue: "border-blue-500 border-t-transparent",
    purple: "border-purple-500 border-t-transparent",
    emerald: "border-emerald-500 border-t-transparent",
    orange: "border-orange-500 border-t-transparent",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className={`${sizeClasses[size]} border-4 rounded-full ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {text && (
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default MiniLoader;
