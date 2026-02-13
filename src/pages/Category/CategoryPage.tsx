import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/Errorstate";
import { useArticles } from "../../hooks/useArticles";
import { useCategories } from "../../hooks/useCategories";
import { Pagination } from "../../components/common/Pagination";
import { ITEMS_PER_PAGE } from "../../utility/constants";
import { SearchBar } from "../../components/common/Searchbar";
import { EmptyState } from "../../components/common/Emptystate";
import { ArticleCard } from "../../components/Article/ArticleCard";

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { categories, isLoading: loadingCategories } = useCategories();

  const currentCategory = useMemo(
    () => categories.find((cat) => cat.slug === categorySlug),
    [categories, categorySlug],
  );

  const { articles, isLoading, isError, error } = useArticles({
    categorySlug: categorySlug || "",
  });

  const searchedArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const lowerQuery = searchQuery.toLowerCase();
    return articles.filter(
      (art) =>
        art.title.toLowerCase().includes(lowerQuery) ||
        art.description.toLowerCase().includes(lowerQuery),
    );
  }, [searchQuery, articles]);

  const totalItems = searchedArticles.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = searchedArticles.slice(startIndex, endIndex);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages],
  );

  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [searchQuery, categorySlug]);

  if (isLoading || loadingCategories) {
    return <Loader fullScreen />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          (error as Error)?.message ||
          "Failed to load articles. Please try again."
        }
        title="Failed to Load Articles"
        fullScreen
      />
    );
  }

  if (!currentCategory) {
    return (
      <ErrorState
        message="The category you're looking for doesn't exist."
        title="Category Not Found"
        fullScreen
      />
    );
  }

  return (
    <div className="py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center dark:text-white my-8 sm:my-12 lg:my-16 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
        >
          {currentCategory.name} Articles
        </motion.h2>

        <SearchBar
          onSearch={setSearchQuery}
          placeholder={`Search ${currentCategory.name} articles...`}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <p className="order-2 sm:order-1">
            Showing{" "}
            <strong className="text-gray-900 dark:text-white">
              {totalItems > 0 ? startIndex + 1 : 0}–
              {Math.min(endIndex, totalItems)}
            </strong>{" "}
            of{" "}
            <strong className="text-gray-900 dark:text-white">
              {totalItems}
            </strong>{" "}
            articles
            {searchQuery && ` for "${searchQuery}"`}
          </p>
          {totalPages > 1 && (
            <p className="order-1 sm:order-2">
              Page{" "}
              <strong className="text-gray-900 dark:text-white">
                {currentPage}
              </strong>{" "}
              of{" "}
              <strong className="text-gray-900 dark:text-white">
                {totalPages}
              </strong>
            </p>
          )}
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {currentItems.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              currentItems.map((article) => (
                <motion.div
                  key={article.uniqueId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArticleCard
                    article={article}
                    categoryPath={categorySlug || ""}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

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

export default CategoryPage;
