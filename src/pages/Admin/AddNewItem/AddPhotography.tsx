// src/pages/Admin/AddNewItem/AddPhotography.tsx

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { IoCloudUploadOutline, IoCheckmarkCircle } from "react-icons/io5";
import { axiosPublic, multipartConfig } from "../../../hooks/axiosPublic";
import toast from "react-hot-toast";

export default function AddPhotography() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosPublic.post(
        "/api/photography",
        formData,
        multipartConfig
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Photo uploaded successfully!");
      qc.invalidateQueries({ queryKey: ["photos"] });
      qc.invalidateQueries({ queryKey: ["photos-admin"] });
      setTimeout(() => {
        resetForm();
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Upload failed");
      console.error("Upload failed:", error);
    },
  });

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please select a photo first");
      return;
    }

    const formData = new FormData();
    formData.append("img", file);

    mutation.mutate(formData);
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-black py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Upload Photo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Share your beautiful moments
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700"
        >
          <div className="space-y-8">
            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-4 border-dashed rounded-2xl h-96 flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${
                isDragging
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105"
                  : preview
                  ? "border-green-400 dark:border-green-600"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
              }`}
            >
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative w-full h-full"
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg"
                    >
                      <IoCheckmarkCircle size={28} />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center px-6"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <IoCloudUploadOutline className="mx-auto text-8xl text-gray-400 dark:text-gray-500 mb-6" />
                    </motion.div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Drop your photo here
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      or click to browse (Max 5MB)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
                className="hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                onClick={handleSubmit}
                disabled={mutation.isPending || !file}
                whileHover={{ scale: file && !mutation.isPending ? 1.02 : 1 }}
                whileTap={{ scale: file && !mutation.isPending ? 0.98 : 1 }}
                className={`flex-1 py-4 px-8 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                  mutation.isPending || !file
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:shadow-2xl hover:scale-105"
                }`}
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  "Upload Photo"
                )}
              </motion.button>

              {file && (
                <motion.button
                  onClick={resetForm}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold shadow-lg transition-all duration-300"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-purple-200 dark:border-gray-600"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
            📸 Upload Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• Use high-quality images for best results</li>
            <li>• Maximum file size: 5MB</li>
            <li>• Supported formats: JPG, PNG, WebP</li>
            <li>• Photos are automatically added to the gallery</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
