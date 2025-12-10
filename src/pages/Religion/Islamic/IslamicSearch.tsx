import { useState, useEffect } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "use-debounce";

interface TechnologySearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const IslamicSearch = ({
  onSearch,
  placeholder = "Search technology articles...",
}: TechnologySearchProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    onSearch(debouncedQuery.trim());
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery("");
    setIsFocused(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-12 max-w-3xl mx-auto px-4"
    >
      <div className="relative">
        {/* Container */}
        <motion.div
          animate={{
            boxShadow: isFocused
              ? "0 0 25px rgba(16,185,129,0.4)"
              : "0 0 8px rgba(0,0,0,0.1)",
          }}
          transition={{ duration: 0.3 }}
          className={`relative flex items-center rounded-2xl overflow-hidden backdrop-blur-xl border 
          ${
            isFocused
              ? "border-emerald-400 dark:border-emerald-500"
              : "border-slate-300 dark:border-slate-700"
          }
          bg-white/70 dark:bg-[#0D0E14]/80`}
        >
          {/* Orbiting Search Icon */}
          <motion.div
            animate={{
              rotate: isFocused ? 360 : 0,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute left-4 text-emerald-600 dark:text-emerald-400"
          >
            <IoSearch className="w-6 h-6" />
          </motion.div>

          {/* INPUT */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full pl-14 pr-16 py-4 text-lg bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 outline-none"
          />

          {/* CLEAR BUTTON */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleClear}
                className="absolute right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                <IoClose className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* FLOATING LABEL */}
        <AnimatePresence>
          {(isFocused || query) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute -top-3 left-5 px-2 rounded-md text-xs font-medium
              bg-white dark:bg-[#0D0E14] text-emerald-600 dark:text-emerald-400 shadow-md"
            >
              Search Articles
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SEARCHING TEXT */}
      <AnimatePresence>
        {debouncedQuery && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            Searching for{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              “{debouncedQuery}”
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default IslamicSearch;
