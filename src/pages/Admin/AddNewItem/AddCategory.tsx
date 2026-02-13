import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { axiosPublic } from "../../../hooks/axiosPublic";
import Swal from "sweetalert2";

interface CategoryForm {
  name: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function AddCategory() {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryForm>({
    defaultValues: { name: "" },
  });

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/categories");
      return res.data.data;
    },
  });

  // Add Category
  const addMutation = useMutation({
    mutationFn: (data: CategoryForm) => {
      return axiosPublic.post("/api/categories", data);
    },
    onSuccess: () => {
      toast.success("Category added successfully!");
      qc.invalidateQueries({ queryKey: ["categories"] });
      reset();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add category");
    },
  });

  // Delete Category with SweetAlert
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosPublic.delete(`/api/categories/${id}`),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Category has been removed.",
        showConfirmButton: false,
        timer: 1500,
      });
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to delete category",
      });
    },
  });

  const onSubmit: SubmitHandler<CategoryForm> = (data) => {
    addMutation.mutate({ name: data.name.trim() });
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete "${name}" category?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const sanitizeInput = (value: string) => {
    return value.replace(/[^\p{L}\p{N}\s-]/gu, "");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Manage Categories
      </h2>

      {/* Add Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1">
            <input
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
              {...register("name", {
                required: "Category name is required",
                minLength: { value: 2, message: "Minimum 2 characters" },
                maxLength: { value: 50, message: "Maximum 50 characters" },
                pattern: {
                  value: /^[\p{L}\p{N}\s-]+$/u,
                  message: "Only letters, numbers, spaces, and hyphens allowed",
                },
              })}
              onChange={(e) => {
                const sanitized = sanitizeInput(e.target.value);
                setValue("name", sanitized, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={addMutation.isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-md flex items-center justify-center gap-2 transition whitespace-nowrap"
          >
            {addMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Category
              </>
            )}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      Loading...
                    </p>
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-red-500">
                      Failed to load categories. Please refresh.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                Array.isArray(categories) &&
                categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        No categories found. Add one above!
                      </p>
                    </td>
                  </tr>
                )}

              {!isLoading &&
                Array.isArray(categories) &&
                categories.map((cat, index) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>{cat.name}</span>
                        <span className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {cat.slug}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {cat.slug}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition"
                        title="Delete category"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Count */}
      {!isLoading && Array.isArray(categories) && categories.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Total: {categories.length}{" "}
          {categories.length === 1 ? "category" : "categories"}
        </div>
      )}
    </div>
  );
}
