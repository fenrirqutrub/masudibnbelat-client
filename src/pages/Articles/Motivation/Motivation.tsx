import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { axiosPublic } from "../../../hooks/axiosPublic";
import MotivationCard from "./MotivationCard";
import MotivationSearch from "./MotivationSearch";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronBack, IoChevronForward, IoSearch } from "react-icons/io5";

// ── Types ──
interface Motivation {
  _id: string;
  title: string;
  description: string;
  img: { url: string; publicId: string };
  createdAt: string;
  timeAgo?: string;
}

interface ApiResponse {
  success: boolean;
  data: Motivation[];
  message?: string;
}

// ── Helper ──
const formatTimeAgo = (date: string): string => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const { label, seconds } of intervals) {
    const count = Math.floor(diff / seconds);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
};

// ── Main Component ──
export default function Motivation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const {
    data: articles = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["motivation-articles"],
    queryFn: async () => {
      const res = await axiosPublic.get<ApiResponse>(
        "/api/article-motivation",
        {
          params: { limit: 50, page: 1 },
        }
      );
      if (!res.data.success) throw new Error(res.data.message || "Failed");
      return res.data.data.map((art) => ({
        ...art,
        timeAgo: formatTimeAgo(art.createdAt),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  // Reset page + scroll when search changes
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 100, left: 100, behavior: "smooth" });
  }, [searchQuery]);

  // Scroll when page changes
  useEffect(() => {
    window.scrollTo({ top: 100, left: 100, behavior: "smooth" });
  }, [currentPage]);

  // Filter & paginate
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // scroll is handled by useEffect above
    }
  };

  const pageNumbers = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, i) => {
      if (totalPages <= 5) return i + 1;
      if (currentPage <= 3) return i + 1;
      if (currentPage >= totalPages - 2) return totalPages - 4 + i;
      return currentPage - 2 + i;
    }
  );

  if (isPending) return <p>loading</p>;
  if (isError) {
    toast.error("Failed to load motivation articles");
    return <EmptyState query="" />;
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50 dark:bg-[#0D0E14]">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-bold text-center dark:text-white my-16 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
        >
          Motivation Articles
        </motion.h2>

        <MotivationSearch onSearch={setSearchQuery} />

        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Showing{" "}
            <strong>
              {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </strong>{" "}
            of <strong>{totalItems}</strong> articles
            {searchQuery && ` for "${searchQuery}"`}
          </p>
          {totalPages > 1 && (
            <p className="mt-2 sm:mt-0">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </p>
          )}
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {currentItems.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              currentItems.map((article, i) => (
                <motion.div
                  key={article._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <MotivationCard article={article} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {totalPages > 1 && (
          <nav className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <IoChevronBack className="w-5 h-5" />
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  page === currentPage
                    ? "bg-emerald-600 text-white shadow-lg scale-110"
                    : "bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <IoChevronForward className="w-5 h-5" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

const EmptyState = ({ query }: { query: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full text-center py-20"
  >
    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-full flex items-center justify-center">
      <IoSearch className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
    </div>
    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
      No results found
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      {query
        ? `We couldn't find any articles matching "${query}"`
        : "No articles available at the moment."}
    </p>
  </motion.div>
);
