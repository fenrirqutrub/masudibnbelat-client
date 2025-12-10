import { useForm, type SubmitHandler } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { IoChevronDown } from "react-icons/io5";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosPublic } from "../../../hooks/axiosPublic";

interface ArticleFormData {
  category: string;
  img: FileList;
  title: string;
  description: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const AddArticle = () => {
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ArticleFormData>({
    defaultValues: { category: "" },
  });

  const selectedCategory = watch("category");

  const { data: categories = [], isLoading: catLoading } = useQuery<Category[]>(
    {
      queryKey: ["categories"],
      queryFn: async () => {
        const res = await axiosPublic.get("/api/categories");
        return res.data.data;
      },
    }
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (files: FileList | null) => {
    if (files?.[0]) {
      const file = files[0];
      setValue("img", files, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setImgPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImgPreview(null);
    setValue("img", null as any, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ArticleFormData> = async (data) => {
    if (!watch("img")?.[0]) return toast.error("Image is required");

    if (!data.category) return toast.error("Please select a category");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("img", data.img[0]);
    formData.append("categoryId", data.category);

    try {
      await axiosPublic.post("/api/articles", formData);
      toast.success("Article added successfully!");
      reset();
      setImgPreview(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add article");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Article
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Fill in the details to create a new article
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6"
        >
          {/* Category Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isSubmitting || catLoading}
              className="w-full px-4 py-3 text-left bg-white dark:bg-gray-700 border rounded-lg flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <span className={!selectedCategory ? "text-gray-500" : ""}>
                {selectedCategory
                  ? categories.find((c) => c._id === selectedCategory)?.name ||
                    selectedCategory
                  : "Select Category"}
              </span>
              {catLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <IoChevronDown />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => {
                      setValue("category", cat._id, { shouldValidate: true });
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">Category is required</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title", {
                required: "Title is required",
                minLength: { value: 5, message: "Min 5 chars" },
              })}
              placeholder="Enter article title"
              className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description", {
                required: "Description required",
                minLength: { value: 20, message: "Min 20 chars" },
              })}
              rows={6}
              placeholder="Write your article description..."
              className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Image <span className="text-red-500">*</span>
            </label>
            {!imgPreview ? (
              <label
                htmlFor="img"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FiUpload className="text-5xl text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">
                  Click to upload (Max 5MB)
                </p>
                <input
                  id="img"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    handleImageChange(files);
                    setValue("img", files); // <-- update RHF value
                  }}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imgPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX size={20} />
                </button>
              </div>
            )}
            {errors.img && (
              <p className="mt-1 text-sm text-red-500">{errors.img.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !selectedCategory}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Article"}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setImgPreview(null);
              }}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-lg"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddArticle;
