import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { MdDeleteOutline } from "react-icons/md";
import { Link } from "react-router";
import { axiosPublic } from "../../../hooks/axiosPublic";

// ────────────────────────────────────────────────
// Types / Interfaces
// ────────────────────────────────────────────────

interface BackendCategory {
  _id: string;
  name: string;
  slug?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Category {
  _id: string;
  categoryName: string;
  articleCount: number;
  createdAt: string;
}

interface ArticlesResponse {
  data: any[]; // we don't need the articles themselves
  pagination?: {
    total: number;
    [key: string]: any;
  };
  [key: string]: any;
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────

const ManageCategory = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ─── Main data fetching with TanStack Query ───
  const {
    data: categories = [],
    isLoading: loadingCategories,
    isError,

    refetch,
  } = useQuery<Category[]>({
    queryKey: ["manage-categories"],

    queryFn: async () => {
      // 1. Get all categories
      const catRes = await axiosPublic.get<{ data: BackendCategory[] }>(
        "/api/categories",
      );
      const backendCats = catRes.data.data || [];

      // 2. Get article count for each category (using small page size trick)
      const countPromises = backendCats.map(async (cat) => {
        try {
          const articleRes = await axiosPublic.get<ArticlesResponse>(
            "/api/articles",
            {
              params: {
                categoryId: cat._id,
                limit: 1,
                page: 1,
              },
            },
          );
          return articleRes.data?.pagination?.total ?? 0;
        } catch {
          return 0;
        }
      });

      const counts = await Promise.all(countPromises);

      // 3. Normalize data for UI
      return backendCats.map((cat, index) => ({
        _id: cat._id,
        categoryName: cat.name,
        articleCount: counts[index] ?? 0,
        createdAt: cat.createdAt,
      }));
    },

    staleTime: 1000 * 60 * 2, // 2 minutes — feel free to adjust
    gcTime: 1000 * 60 * 10, // 10 minutes cache
  });

  // ─── Delete handler ───
  const handleDelete = async (categoryId: string, categoryName: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert "${categoryName}"!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axiosPublic.delete(`/api/categories/${categoryId}`);

      // Optimistic update + invalidate
      queryClient.setQueryData<Category[]>(["manage-categories"], (old = []) =>
        old.filter((cat) => cat._id !== categoryId),
      );

      Swal.fire("Deleted!", `${categoryName} has been deleted.`, "success");

      // Optional: force refetch to be 100% in sync
      refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Failed to delete category. Please try again.";
      toast.error(message);
      Swal.fire("Error!", message, "error");
    }
  };

  // ─── Filtering & Pagination ───
  const filteredData = categories.filter((item) =>
    item.categoryName.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ─── Render ───
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto">
        {/* Header + Search + Add Button */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">
              Manage Categories
            </h2>
            <input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full dark:bg-slate-900 dark:border-slate-700 dark:text-[#abc2d3] dark:placeholder:text-slate-500 py-2.5 px-4 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            />
          </div>

          <div className="flex-shrink-0">
            <Link to="/add-category">
              <button className="w-full sm:w-auto px-6 py-3 text-lg font-semibold text-white bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                + Add Category
              </button>
            </Link>
          </div>
        </div>

        {/* Loading / Error / Content */}
        {loadingCategories ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-600 dark:text-red-400">
            Failed to load categories
            <button
              onClick={() => refetch()}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border dark:border-slate-700 border-gray-200">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold dark:text-[#abc2d3] text-gray-700">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold dark:text-[#abc2d3] text-gray-700">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold dark:text-[#abc2d3] text-gray-700">
                      Articles
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold dark:text-[#abc2d3] text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold dark:text-[#abc2d3] text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {paginatedData.map((item, index) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm dark:text-[#abc2d3] text-gray-900">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium dark:text-[#abc2d3] text-gray-900">
                        {item.categoryName}
                      </td>
                      <td className="px-6 py-4 text-sm dark:text-[#abc2d3] text-gray-600">
                        {item.articleCount}
                      </td>
                      <td className="px-6 py-4 text-sm dark:text-[#abc2d3] text-gray-600">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleDelete(item._id, item.categoryName)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <MdDeleteOutline className="text-lg" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {paginatedData.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No categories found
                  {search && " matching your search"}
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {paginatedData.map((item) => (
                <div
                  key={item._id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg dark:text-[#abc2d3] text-gray-900">
                        {item.categoryName}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Articles:
                      </span>
                      <span className="font-medium dark:text-[#abc2d3]">
                        {item.articleCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Date:
                      </span>
                      <span className="font-medium dark:text-[#abc2d3]">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item._id, item.categoryName)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <MdDeleteOutline className="text-lg" />
                    Delete
                  </button>
                </div>
              ))}

              {paginatedData.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No categories found
                  {search && " matching your search"}
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="text-sm dark:text-[#abc2d3] text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                  {filteredData.length}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#abc2d3] bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2)
                          pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg ${
                            pageNum === currentPage
                              ? "bg-emerald-600 text-white"
                              : "text-gray-700 dark:text-[#abc2d3] bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#abc2d3] bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageCategory;
