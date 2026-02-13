import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoTrashOutline,
  IoEyeOutline,
  IoGridOutline,
  IoListOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoChatbubbleOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { axiosPublic } from "../../../hooks/axiosPublic";
import { SearchBar } from "../../../components/common/Searchbar";
import { EmptyState } from "../../../components/common/Emptystate";
import { Pagination } from "../../../components/common/Pagination";

// ───────────────── TYPES ─────────────────

interface Quote {
  _id: string;
  text?: string;
  quote?: string;
  author: string;
  views: number;
  createdAt: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "most-viewed" | "least-viewed";

const ITEMS_PER_PAGE = 12;

// ───────────────── API FUNCTIONS ─────────────────

const fetchQuotes = async (): Promise<Quote[]> => {
  const response = await axiosPublic.get("/api/quotes?limit=1000");
  return response.data.data || response.data || [];
};

const deleteQuote = async (id: string) => {
  await axiosPublic.delete(`/api/quotes/${id}`);
};

const deleteBatchQuotes = async (ids: string[]) => {
  try {
    await axiosPublic.post("/api/quotes/batch/delete", { ids });
  } catch {
    // Fallback to individual deletes
    await Promise.all(ids.map((id) => axiosPublic.delete(`/api/quotes/${id}`)));
  }
};

// ───────────────── COMPONENT ─────────────────

export default function ManageQuotes() {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ───────────────── QUERIES & MUTATIONS ─────────────────

  const {
    data: quotes = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["quotes-admin"],
    queryFn: fetchQuotes,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMut = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      toast.success("Quote deleted successfully", {
        icon: "✨",
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #2D2E37",
        },
      });
      qc.invalidateQueries({ queryKey: ["quotes-admin"] });
      qc.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.response?.data?.message || "Failed to delete quote", {
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #EF4444",
        },
      });
    },
  });

  const batchDeleteMut = useMutation({
    mutationFn: deleteBatchQuotes,
    onSuccess: () => {
      toast.success(`${selectedQuotes.size} quotes deleted successfully`, {
        icon: "🎉",
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #2D2E37",
        },
      });
      setSelectedQuotes(new Set());
      setIsSelectionMode(false);
      qc.invalidateQueries({ queryKey: ["quotes-admin"] });
      qc.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.response?.data?.message || "Failed to delete quotes", {
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #EF4444",
        },
      });
    },
  });

  // ───────────────── PROCESSING ─────────────────

  const processedQuotes = useMemo(() => {
    let filtered = [...quotes];

    if (searchQuery) {
      filtered = filtered.filter(
        (quote) =>
          (quote.text || quote.quote || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          quote.author.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "most-viewed":
          return b.views - a.views;
        case "least-viewed":
          return a.views - b.views;
        default:
          return 0;
      }
    });

    return filtered;
  }, [quotes, searchQuery, sortBy]);

  // ───────────────── PAGINATION ─────────────────

  const totalPages = Math.ceil(processedQuotes.length / ITEMS_PER_PAGE);
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return processedQuotes.slice(start, end);
  }, [processedQuotes, currentPage]);

  // ───────────────── HANDLERS ─────────────────

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const confirmDelete = (id: string) => {
    Swal.fire({
      title: "Delete Quote?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#52525B",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#0C0D12",
      color: "#FFFFFF",
      iconColor: "#F59E0B",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMut.mutate(id);
      }
    });
  };

  const confirmBatchDelete = () => {
    Swal.fire({
      title: `Delete ${selectedQuotes.size} Quotes?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#52525B",
      confirmButtonText: `Delete ${selectedQuotes.size} Quotes`,
      cancelButtonText: "Cancel",
      background: "#0C0D12",
      color: "#FFFFFF",
      iconColor: "#F59E0B",
    }).then((result) => {
      if (result.isConfirmed) {
        batchDeleteMut.mutate(Array.from(selectedQuotes));
      }
    });
  };

  const toggleQuoteSelection = (id: string) => {
    const newSelection = new Set(selectedQuotes);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedQuotes(newSelection);
  };

  const selectAll = () => {
    setSelectedQuotes(new Set(paginatedQuotes.map((q) => q._id)));
  };

  const clearSelection = () => {
    setSelectedQuotes(new Set());
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ───────────────── LOADING & ERROR STATES ─────────────────

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#E9EBED] dark:bg-[#0C0D12] flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-zinc-300 dark:border-zinc-800 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-[#0C0D12] dark:border-[#FFFFFF] border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <div className="text-center">
            <p className="text-[#0C0D12] dark:text-[#FFFFFF] font-bold text-xl mb-1">
              Loading Quotes
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Fetching wisdom...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#E9EBED] dark:bg-[#0C0D12] flex justify-center items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Failed to Load Quotes
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            There was an error loading your quotes. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-[#0C0D12] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#0C0D12] font-semibold rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  // ───────────────── MAIN UI ─────────────────

  return (
    <div className="min-h-screen bg-[#E9EBED] dark:bg-[#0C0D12] transition-colors duration-300">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Title */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0C0D12] dark:text-[#FFFFFF] mb-3 tracking-tight"
            >
              Quotes Collection
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg"
            >
              Manage your inspirational quotes
            </motion.p>
          </div>

          {/* Controls Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1A1B23] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search quotes by text or author..."
                value={searchQuery}
              />

              <div className="flex flex-row justify-between items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-3 bg-zinc-100 dark:bg-[#0C0D12] border border-zinc-200 dark:border-zinc-800 rounded-xl text-[#0C0D12] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all cursor-pointer font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-viewed">Most Viewed</option>
                  <option value="least-viewed">Least Viewed</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-[#0C0D12] p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg transition-all font-medium ${
                      viewMode === "list"
                        ? "bg-[#0C0D12] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#0C0D12] shadow-md"
                        : "text-zinc-500 hover:text-[#0C0D12] dark:hover:text-[#FFFFFF]"
                    }`}
                  >
                    <IoListOutline size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg transition-all font-medium ${
                      viewMode === "grid"
                        ? "bg-[#0C0D12] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#0C0D12] shadow-md"
                        : "text-zinc-500 hover:text-[#0C0D12] dark:hover:text-[#FFFFFF]"
                    }`}
                  >
                    <IoGridOutline size={20} />
                  </button>
                </div>
              </div>

              {/* Selection Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  if (isSelectionMode) clearSelection();
                }}
                className={`px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap shadow-sm ${
                  isSelectionMode
                    ? "bg-purple-600 text-white hover:bg-purple-500"
                    : "bg-zinc-100 dark:bg-[#0C0D12] text-[#0C0D12] dark:text-[#FFFFFF] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-900"
                }`}
              >
                {isSelectionMode ? "Exit Select" : "Select Mode"}
              </motion.button>
            </div>

            {/* Selection Actions */}
            <AnimatePresence>
              {isSelectionMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={selectAll}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                  >
                    Select All ({paginatedQuotes.length})
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearSelection}
                    disabled={selectedQuotes.size === 0}
                    className="px-5 py-2.5 bg-zinc-600 hover:bg-zinc-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Clear Selection
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmBatchDelete}
                    disabled={
                      selectedQuotes.size === 0 || batchDeleteMut.isPending
                    }
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  >
                    <IoTrashOutline size={16} />
                    Delete Selected ({selectedQuotes.size})
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Quotes Display */}
        {processedQuotes.length === 0 ? (
          <EmptyState
            query={searchQuery}
            icon={
              <IoChatbubbleOutline className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 dark:text-emerald-400" />
            }
            title={searchQuery ? "No Quotes Found" : "No Quotes Yet"}
            message={
              searchQuery
                ? `We couldn't find any quotes matching "${searchQuery}"`
                : "Start building your collection by adding quotes"
            }
          />
        ) : viewMode === "grid" ? (
          // Grid View
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence>
                {paginatedQuotes.map((quote, index) => (
                  <motion.div
                    key={quote._id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{
                      delay: index * 0.03,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    whileHover={{ y: -8 }}
                    className={`group relative bg-white dark:bg-[#1A1B23] border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 ${
                      selectedQuotes.has(quote._id)
                        ? "border-emerald-500 ring-4 ring-emerald-500/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600"
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 left-3 z-10 cursor-pointer"
                        onClick={() => toggleQuoteSelection(quote._id)}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all backdrop-blur-sm ${
                            selectedQuotes.has(quote._id)
                              ? "bg-emerald-600 border-emerald-600 scale-110"
                              : "bg-white/90 dark:bg-zinc-900/90 border-zinc-400 dark:border-zinc-600 group-hover:border-emerald-500"
                          }`}
                        >
                          {selectedQuotes.has(quote._id) && (
                            <IoCheckmarkCircle
                              className="text-white"
                              size={20}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {/* Quote Text */}
                      <p className="text-lg italic mb-4 line-clamp-4 text-[#0C0D12] dark:text-[#FFFFFF]">
                        "{quote.text || quote.quote}"
                      </p>

                      {/* Author */}
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 font-medium">
                        — {quote.author || "Unknown"}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <IoEyeOutline size={18} />
                          <span className="text-sm font-bold">
                            {quote.views}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                          <IoCalendarOutline size={16} />
                          <span className="text-xs font-medium">
                            {formatDate(quote.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <motion.button
                        onClick={() => confirmDelete(quote._id)}
                        disabled={deleteMut.isPending}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <IoTrashOutline size={18} />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          // List View
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-[#1A1B23] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-md"
            >
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-100 dark:bg-[#0C0D12] border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      {isSelectionMode && (
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={
                              selectedQuotes.size === paginatedQuotes.length &&
                              paginatedQuotes.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                selectAll();
                              } else {
                                clearSelection();
                              }
                            }}
                            className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Quote
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Author
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Views
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Created
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <AnimatePresence>
                      {paginatedQuotes.map((quote, index) => (
                        <motion.tr
                          key={quote._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.02 }}
                          className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                            selectedQuotes.has(quote._id)
                              ? "bg-emerald-50 dark:bg-emerald-500/5"
                              : ""
                          }`}
                        >
                          {isSelectionMode && (
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedQuotes.has(quote._id)}
                                onChange={() => toggleQuoteSelection(quote._id)}
                                className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <p className="text-[#0C0D12] dark:text-[#FFFFFF] font-medium text-sm max-w-md truncate italic">
                              "{quote.text || quote.quote}"
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[#0C0D12] dark:text-[#FFFFFF] font-semibold text-sm">
                              {quote.author || "Unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <IoEyeOutline
                                size={18}
                                className="text-emerald-600 dark:text-emerald-400"
                              />
                              <span className="text-[#0C0D12] dark:text-[#FFFFFF] font-bold">
                                {quote.views}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                              {formatDate(quote.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              onClick={() => confirmDelete(quote._id)}
                              disabled={deleteMut.isPending}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                              <IoTrashOutline size={16} />
                              Delete
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="lg:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                <AnimatePresence>
                  {paginatedQuotes.map((quote, index) => (
                    <motion.div
                      key={quote._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                        selectedQuotes.has(quote._id)
                          ? "bg-emerald-50 dark:bg-emerald-500/5"
                          : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        {isSelectionMode && (
                          <div className="flex items-start pt-1">
                            <input
                              type="checkbox"
                              checked={selectedQuotes.has(quote._id)}
                              onChange={() => toggleQuoteSelection(quote._id)}
                              className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[#0C0D12] dark:text-[#FFFFFF] text-sm mb-2 italic line-clamp-3">
                            "{quote.text || quote.quote}"
                          </p>
                          <p className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-3">
                            — {quote.author || "Unknown"}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                            <div className="flex items-center gap-1.5">
                              <IoEyeOutline
                                size={14}
                                className="text-emerald-600 dark:text-emerald-400"
                              />
                              <span className="font-semibold">
                                {quote.views}
                              </span>
                            </div>
                            <span>•</span>
                            <span className="font-medium">
                              {formatDate(quote.createdAt)}
                            </span>
                          </div>
                          <motion.button
                            onClick={() => confirmDelete(quote._id)}
                            disabled={deleteMut.isPending}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
                          >
                            <IoTrashOutline size={14} />
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
