// components/ui/LoadingSkeleton.tsx
import { motion } from "framer-motion";

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0E14] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fake small cards to fill grid on list pages */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i + 10}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="h-48 bg-gray-300 dark:bg-slate-700 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-4/5 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-11/12 animate-pulse" />
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex gap-3">
                    <div className="h-8 w-14 bg-gray-300 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="h-8 w-14 bg-gray-300 dark:bg-slate-700 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
