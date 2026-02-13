import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { axiosPublic } from "../../../hooks/axiosPublic";

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
    defaultValues: { name: "" }, // ✅ Fixed: was "category"
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

  // Add Category (POST /api/categories with { name })
  const addMutation = useMutation({
    mutationFn: (data: CategoryForm) => {
      console.log("Sending data:", data); // Debug log
      return axiosPublic.post("/api/categories", data);
    },
    onSuccess: () => {
      toast.success("Category added successfully!");
      qc.invalidateQueries({ queryKey: ["categories"] });
      reset();
    },
    onError: (err: any) => {
      console.error("Add category error:", err); // Debug log
      toast.error(err?.response?.data?.message || "Failed to add category");
    },
  });

  // Delete Category (DELETE /api/categories/:id)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosPublic.delete(`/api/categories/${id}`),
    onSuccess: () => {
      toast.success("Category deleted!");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    },
  });

  const onSubmit: SubmitHandler<CategoryForm> = (data) => {
    console.log("Form submitted with:", data); // Debug log
    addMutation.mutate({ name: data.name.trim() });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" category?`)) {
      deleteMutation.mutate(id);
    }
  };

  // sanitize input but allow unicode letters & numbers, spaces, hyphen
  const sanitizeInput = (value: string) => {
    return value.replace(/[^\p{L}\p{N}\s-]/gu, "");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        Manage Categories
      </h2>

      {/* Add Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
          <div className="flex-1">
            <input
              className="border-[#e5eaf2] dark:bg-transparent dark:border-slate-600 dark:placeholder:text-slate-600 dark:text-slate-300 border rounded-md outline-none px-4 w-full mt-1 py-3 focus:border-[#3B9DF8] transition-colors duration-300"
              {...register("name", {
                // ✅ Fixed: was "category"
                required: "Category is required",
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
              placeholder="e.g., Web Development, Healthy Recipes"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={addMutation.isPending} // ✅ Fixed: changed from isLoading
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg flex items-center gap-2 transition"
          >
            {addMutation.isPending ? ( // ✅ Fixed: changed from isLoading
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add
              </>
            )}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          All Categories ({Array.isArray(categories) ? categories.length : 0})
        </h3>

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          </div>
        )}

        {isError && (
          <div className="text-center py-8 text-red-500">
            Failed to load categories. Please refresh.
          </div>
        )}

        {!isLoading && Array.isArray(categories) && categories.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No categories yet.</p>
            <p>Add your first one above!</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.isArray(categories) &&
            categories.map((cat) => (
              <div
                key={cat._id}
                className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 text-center shadow hover:shadow-md transition transform hover:-translate-y-1"
              >
                <p className="font-medium text-gray-800 dark:text-white truncate">
                  {cat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {cat.slug}
                </p>

                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full disabled:opacity-50"
                  title="Delete category"
                  disabled={deleteMutation.isPending} // ✅ Fixed: changed from isLoading
                >
                  {deleteMutation.isPending ? ( // ✅ Fixed: changed from isLoading
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
