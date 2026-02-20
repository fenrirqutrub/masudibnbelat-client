import { useForm, type SubmitHandler } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { IoChevronDown } from "react-icons/io5";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosPublic } from "../../../hooks/axiosPublic";

interface ArticleFormData {
  category: string;
  img: FileList | null;
  title: string;
  description: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const PostArticles = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dropdownOpen, setDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<ArticleFormData>({
      defaultValues: { category: "", img: null, title: "", description: "" },
    });

  const catId = watch("category");
  const files = watch("img");

  const { data: cats = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () =>
      (await axiosPublic.get("/api/categories")).data.data ?? [],
  });

  const mutation = useMutation({
    mutationFn: (fd: FormData) =>
      axiosPublic.post("/api/articles", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      toast.success("Article created");
      qc.invalidateQueries({ queryKey: ["articles"] });
      reset();
      setPreview(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed"),
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onImage = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Select an image");

    setValue("img", fileList);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit: SubmitHandler<ArticleFormData> = (data) => {
    if (!data.img?.[0]) return toast.error("Image required");
    if (!data.category) return toast.error("Category required");

    const fd = new FormData();
    fd.append("title", data.title.trim());
    fd.append("description", data.description.trim());
    fd.append("img", data.img[0]);
    fd.append("categoryId", data.category);

    mutation.mutate(fd);
  };

  // ─── Clean ready state ───
  const canSubmit = Boolean(catId && files?.[0] && !mutation.isPending);

  return (
    <div className="min-h-screen ">
      <div className="">
        <h2 className="text-3xl font-bold text-center mb-8">Add New Article</h2>

        <form onSubmit={handleSubmit(onSubmit)} className=" space-y-6">
          {/* Category */}
          <div className="relative" ref={ref}>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Category <span className="text-red-500">*</span>
            </label>
            <input type="hidden" {...register("category")} />

            <button
              type="button"
              onClick={() => setDropdown((v) => !v)}
              disabled={mutation.isPending || isLoading}
              className="w-full px-4 py-3 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-between items-center disabled:opacity-60"
            >
              <span
                className={
                  catId ? "text-gray-900 dark:text-white" : "text-gray-500"
                }
              >
                {catId
                  ? (cats.find((c) => c._id === catId)?.name ?? "…")
                  : "Select category"}
              </span>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <IoChevronDown
                  className={`transition ${dropdownOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {dropdownOpen && cats.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-64 overflow-auto">
                {cats.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => {
                      setValue("category", c._id);
                      setDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${catId === c._id ? "bg-blue-50 dark:bg-gray-600" : ""}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + Description (shortened for brevity) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Title *
            </label>
            <input
              {...register("title", { required: true, minLength: 5 })}
              placeholder="Title"
              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description *
            </label>
            <textarea
              {...register("description", { required: true, minLength: 20 })}
              rows={5}
              placeholder="Description..."
              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
            />
          </div>

          {/* Image – no required in register */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Image *
            </label>
            {!preview ? (
              <label className="flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl cursor-pointer hover:border-emerald-500">
                <FiUpload className="text-4xl text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onImage(e.target.files)}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-56 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setValue("img", null);
                  }}
                  className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                canSubmit
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              } flex items-center justify-center gap-2`}
            >
              {mutation.isPending ? (
                <>
                  {" "}
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating…{" "}
                </>
              ) : (
                "Add Article"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                reset();
                setPreview(null);
              }}
              disabled={mutation.isPending}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-lg transition disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostArticles;
