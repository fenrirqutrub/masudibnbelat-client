import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import type { BaseArticle } from "../../../types/Article.types";
import axiosPublic from "../../../hooks/axiosPublic";
import { useCategories } from "../../../hooks/useCategories";
import Loader from "../../../components/ui/Loader";
import { SearchBar } from "../../../components/common/Searchbar";
import { Pagination } from "../../../components/common/Pagination";

// ───────────────── TYPES ─────────────────

interface ArticleResponse {
  success: boolean;
  data: BaseArticle[];
  totalPages?: number;
  currentPage?: number;
  total?: number;
}

interface FetchArticlesParams {
  page: number;
  search: string;
  categoryId: string;
}

const ITEMS_PER_PAGE = 12;

// ───────────────── API ─────────────────

const fetchFilteredArticles = async ({
  page,
  search,
  categoryId,
}: FetchArticlesParams): Promise<ArticleResponse> => {
  const params: Record<string, string | number> = {
    page,
    limit: ITEMS_PER_PAGE,
  };

  if (search.trim()) params.search = search.trim();
  if (categoryId) params.category = categoryId;

  const response = await axiosPublic.get<ArticleResponse>("/api/articles", {
    params,
  });

  // Guard: ensure the response shape is valid
  if (!response.data || !Array.isArray(response.data.data)) {
    throw new Error("Invalid response from server");
  }

  return response.data;
};

const deleteArticle = async (id: string) => {
  const response = await axiosPublic.delete(`/api/articles/${id}`);
  return response.data;
};

// ───────────────── COMPONENT ─────────────────

export const ManageArticles = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const queryClient = useQueryClient();

  // Categories
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Articles Query
  const {
    data: articlesData,
    isLoading: articlesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["filtered-articles", currentPage, searchQuery, selectedCategory],
    queryFn: () =>
      fetchFilteredArticles({
        page: currentPage,
        search: searchQuery,
        categoryId: selectedCategory,
      }),
    // Keep previous data while new results load (avoids blank flash)
    placeholderData: (prev) => prev,
    // Don't re-fetch aggressively on window focus for a management table
    staleTime: 30_000,
  });

  // Delete Mutation
  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      toast.success("Article deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["filtered-articles"],
      });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to delete article";
      toast.error(message);
    },
  });

  // ───────────────── HANDLERS ─────────────────

  // useCallback ensures SearchBar's onSearch dep stays stable → no extra re-renders
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const confirmDelete = (id: string) => {
    Swal.fire({
      title: "Delete Article?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(id);
      }
    });
  };

  // ───────────────── DERIVED ─────────────────

  const articles = articlesData?.data ?? [];
  const totalPages = articlesData?.totalPages ?? 1;
  const totalArticles = articlesData?.total ?? articles.length;
  const hasActiveFilters = Boolean(searchQuery || selectedCategory);

  // ───────────────── GUARDS ─────────────────

  if (categoriesLoading) return <Loader />;

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        {error instanceof Error ? error.message : "Failed to load articles"}
      </div>
    );
  }

  // ───────────────── UI ─────────────────

  return (
    <div className="min-h-screen bg-[#E9EBED] text-[#0C0D12] dark:bg-[#0C0D12] dark:text-[#FFFFFF] p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Manage Articles</h1>
          <p className="mt-2 opacity-70">Total: {totalArticles} articles</p>
        </div>

        {/* SEARCH — value prop keeps SearchBar in sync with parent state */}
        <SearchBar
          onSearch={handleSearch}
          value={searchQuery}
          placeholder="Search by title..."
        />

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mt-6 items-center">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-4 py-2 rounded-lg border bg-white dark:bg-[#1A1B22] dark:border-[#2A2B35]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-300 dark:bg-[#1A1B22] rounded-lg hover:opacity-80 transition"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="mt-10 overflow-x-auto rounded-xl border border-gray-300 dark:border-[#2A2B35] shadow">
          {articlesLoading ? (
            <Loader />
          ) : articles.length === 0 ? (
            <div className="p-10 text-center opacity-70">
              {hasActiveFilters
                ? "No articles match your search or filter."
                : "No Articles Found"}
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200 dark:bg-[#1A1B22] uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Title</th>
                  <th className="px-6 py-4 text-left">Photo</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-300 dark:divide-[#2A2B35]">
                {articles.map((article, index) => (
                  <tr
                    key={article._id}
                    className="hover:bg-gray-100 dark:hover:bg-[#1A1B22] transition"
                  >
                    <td className="px-6 py-4">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>

                    <td className="px-6 py-4 font-medium">{article.title}</td>

                    <td className="px-6 py-4">
                      <img
                        src={article.imgUrl}
                        alt={article.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => confirmDelete(article._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageArticles;
