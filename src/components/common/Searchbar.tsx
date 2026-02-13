import { useState, useEffect, useRef } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "use-debounce";
import { DEBOUNCE_DELAY } from "../../utility/constants";
import type { SearchProps } from "../../types/Article.types";

export const SearchBar = ({
  onSearch,
  placeholder = "Search articles...",
  value = "",
}: SearchProps) => {
  const [query, setQuery] = useState(value);
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_DELAY);
  const [isFocused, setIsFocused] = useState(false);

  const isExternalUpdate = useRef(false);

  useEffect(() => {
    if (value !== query) {
      isExternalUpdate.current = true;
      setQuery(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    onSearch(debouncedQuery.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isExternalUpdate.current = false;
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    setIsFocused(false);
  };

  return (
    // ✅ Removed: mt-12, max-w-3xl mx-auto, px-4 — those broke flex alignment
    <div className="w-full">
      <div className="relative">
        <motion.div
          animate={{
            boxShadow: isFocused
              ? "0 0 20px rgba(16,185,129,0.35)"
              : "0 1px 4px rgba(0,0,0,0.12)",
          }}
          transition={{ duration: 0.25 }}
          className={`relative flex items-center rounded-xl overflow-hidden border transition-colors duration-200
            ${
              isFocused
                ? "border-emerald-400 dark:border-emerald-500"
                : "border-slate-200 dark:border-slate-700"
            }
            bg-white dark:bg-[#0D0E14]`}
        >
          {/* Search Icon */}
          <div className="absolute left-4 text-emerald-500 dark:text-emerald-400 pointer-events-none">
            <IoSearch className="w-5 h-5" />
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full h-12 pl-12 pr-12 text-sm bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />

          {/* Clear Button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className="absolute right-3 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <IoClose className="w-3.5 h-3.5 text-gray-500 dark:text-gray-300" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Label */}
        <AnimatePresence>
          {(isFocused || query) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute -top-2.5 left-4 px-1.5 text-xs font-medium rounded
                bg-white dark:bg-[#0D0E14] text-emerald-600 dark:text-emerald-400"
            >
              Search Articles
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Status */}
      <AnimatePresence>
        {debouncedQuery && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 text-xs text-gray-500 dark:text-gray-400 pl-1"
          >
            Searching for{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              &quot;{debouncedQuery}&quot;
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
