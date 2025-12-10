import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { axiosPublic } from "../../../hooks/axiosPublic";
import TravelCard from "./TravelCard";
import TravelSearch from "./TravelSearch";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronBack, IoChevronForward, IoSearch } from "react-icons/io5";

// ────────────────────── TYPES ──────────────────────
interface Travel {
  _id: string;
  title: string;
  description: string;
  img: { url: string; publicId: string };
  createdAt: string;
  timeAgo?: string;
  views?: number;
  comments?: number;
}

interface ApiResponse {
  success: boolean;
  data: Travel[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ────────────────────── MAIN COMPONENT ──────────────────────
const Travel = () => {
  const [articles, setArticles] = useState<Travel[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ── FETCH ARTICLES ─────────────────────────────────────────
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await axiosPublic.get<ApiResponse>("/api/articles/travel", {
          params: { limit: 50, page: 1 },
        });

        if (res.data.success) {
          const data = res.data.data.map((art) => ({
            ...art,
            timeAgo: formatTimeAgo(art.createdAt),
          }));
          setArticles(data);
        } else {
          toast.error(res.data.message || "Failed to load articles");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching technology articles:", error);
        toast.error(
          error?.response?.data?.message ||
            "Something went wrong while loading data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // ── FILTER ARTICLES BY SEARCH ─────────────────────────────
  const searchedArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;

    const lowerQuery = searchQuery.toLowerCase();
    return articles.filter(
      (art) =>
        art.title.toLowerCase().includes(lowerQuery) ||
        art.description.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, articles]);

  // ── PAGINATION LOGIC ─────────────────────────────────────
  const totalItems = searchedArticles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = searchedArticles.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ── HELPERS ───────────────────────────────────────────────
  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    for (const { label, seconds } of intervals) {
      const count = Math.floor(diffInSeconds / seconds);
      if (count >= 1) {
        return `${count} ${label}${count > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };

  // ── RENDER STATES ─────────────────────────────────────────
  if (loading) {
    return <p>loading...</p>;
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50 dark:bg-[#0D0E14]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold text-center dark:text-white my-16 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
        >
          Travel Articles
        </motion.h2>

        {/* Search Bar */}
        <TravelSearch onSearch={setSearchQuery} />

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Showing{" "}
            <strong>
              {startIndex + 1}–{Math.min(endIndex, totalItems)}
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

        {/* Articles Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {currentItems.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              currentItems.map((article, index) => (
                <motion.div
                  key={article._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TravelCard article={article} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </div>
    </div>
  );
};

// ── PAGINATION COMPONENT ───────────────────────────────────
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pageNumbers = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, i) => {
      if (totalPages <= 5) return i + 1;
      if (currentPage <= 3) return i + 1;
      if (currentPage >= totalPages - 2) return totalPages - 4 + i;
      return currentPage - 2 + i;
    }
  );

  return (
    <nav
      className="flex justify-center items-center gap-2 mt-12"
      aria-label="Pagination"
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Previous page"
      >
        <IoChevronBack className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg font-medium transition-all ${
            page === currentPage
              ? "bg-emerald-600 text-white shadow-lg scale-110"
              : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Next page"
      >
        <IoChevronForward className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
    </nav>
  );
};

// ── EMPTY STATE ────────────────────────────────────────────
const EmptyState = ({ query }: { query: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
    className="col-span-full text-center py-20"
  >
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="inline-block"
    >
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-full flex items-center justify-center">
        <IoSearch className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
      </div>
    </motion.div>
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

export default Travel;
