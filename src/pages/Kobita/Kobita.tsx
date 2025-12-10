// components/Kobita/Kobita.tsx
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronBack, IoChevronForward, IoSearch } from "react-icons/io5";
import KobitaSearch from "./KobitaSearch";
import KobitaCard from "./KobitaCard";
import { articleAPI } from "../../hooks/api";

// ── Types ──
interface KobitaArticle {
  _id: string;
  title: string;
  description: string;
  img: { url: string; publicId: string };
  category: { name: string; slug: string };
  createdAt: string;
  timeAgo?: string;
}

// ── Helper ──
const formatTimeAgo = (date: string): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    { label: "বছর", sec: 31536000 },
    { label: "মাস", sec: 2592000 },
    { label: "দিন", sec: 86400 },
    { label: "ঘণ্টা", sec: 3600 },
    { label: "মিনিট", sec: 60 },
  ];
  for (const { label, sec } of intervals) {
    const count = Math.floor(seconds / sec);
    if (count > 0) return `${count} ${label} আগে`;
  }
  return "এইমাত্র";
};

// ── Main Component ──
export default function Kobita() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const {
    data: articles = [],
    isPending,
    isError,
    error,
  } = useQuery<KobitaArticle[]>({
    queryKey: ["kobita-articles"],
    queryFn: async () => {
      const res = await articleAPI.getAll({
        categorySlug: "kobita",
        limit: 200,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "কবিতা লোড করতে সমস্যা হয়েছে");
      }

      return res.data.data.map((art: any) => ({
        ...art,
        timeAgo: formatTimeAgo(art.createdAt),
      }));
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

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
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error((error as Error)?.message || "কবিতা লোড করা যায়নি");
    }
  }, [isError, error]);

  if (isPending) return <p>loading...</p>;
  if (isError) return <EmptyState query={searchQuery} />;

  return (
    <div className="py-12 px-4 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto">
        {/* হেডার */}
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
        >
          কবিতা সমগ্র
        </motion.h1>

        <KobitaSearch onSearch={setSearchQuery} />

        <div className="text-center mb-10 text-lg text-gray-700 dark:text-gray-300">
          মোট <strong className="text-purple-600">{totalItems}</strong> টি কবিতা
          পাওয়া গেছে
          {searchQuery && (
            <span className="text-pink-600">
              {" "}
              | "{searchQuery}" এর জন্য সার্চ
            </span>
          )}
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {currentItems.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              currentItems.map((article, i) => (
                <motion.div
                  key={article._id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <KobitaCard article={article} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {/* পেজিনেশন */}
        {totalPages > 1 && (
          <nav className="flex justify-center items-center gap-3 mt-16">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
            >
              <IoChevronBack className="w-6 h-6" />
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) pageNum = i + 1;
              else if (currentPage <= 4) pageNum = i + 1;
              else if (currentPage >= totalPages - 3)
                pageNum = totalPages - 6 + i;
              else pageNum = currentPage - 3 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-12 h-12 rounded-full font-bold transition-all shadow-md ${
                    pageNum === currentPage
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110 shadow-2xl"
                      : "bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
            >
              <IoChevronForward className="w-6 h-6" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

// ── Empty State ──
const EmptyState = ({ query }: { query: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full text-center py-24"
  >
    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center shadow-2xl">
      <IoSearch className="w-16 h-16 text-purple-600 dark:text-purple-400" />
    </div>
    <h3 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
      {query ? "কোনো কবিতা পাওয়া যায়নি" : "কোনো কবিতা নেই"}
    </h3>
    <p className="text-xl text-gray-600 dark:text-gray-400">
      {query
        ? `"${query}" এর সাথে মিলে এমন কোনো কবিতা নেই`
        : "শীঘ্রই নতুন কবিতা যোগ করা হবে"}
    </p>
  </motion.div>
);
