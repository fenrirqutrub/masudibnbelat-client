// src/pages/Admin/Management/ManagePhotography/ManagePhotography.tsx

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { IoTrashOutline, IoEyeOutline } from "react-icons/io5";

import toast from "react-hot-toast";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { axiosPublic } from "../../../hooks/axiosPublic";

interface Photo {
  _id: string;
  img: {
    url: string;
    publicId: string;
  };
  views: number;
  createdAt: string;
}

const fetchPhotos = async (): Promise<Photo[]> => {
  const response = await axiosPublic.get("/api/photography?limit=1000");
  return response.data.data;
};

const deletePhoto = async (id: string) => {
  await axiosPublic.delete(`/api/photography/${id}`);
};

export default function ManagePhotos() {
  const qc = useQueryClient();

  const {
    data: photos = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["photos-admin"],
    queryFn: fetchPhotos,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMut = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      toast.success("Photo deleted successfully");
      qc.invalidateQueries({ queryKey: ["photos-admin"] });
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete photo");
    },
  });

  const confirmDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#374151",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMut.mutate(id);

        Swal.fire({
          title: "Deleted!",
          text: "The photo has been removed successfully.",
          icon: "success",
          timer: 1400,
          showConfirmButton: false,
        });
      }
    });
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading photos...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-2xl text-red-500 mb-4">❌ Failed to load photos</p>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["photos-admin"] })}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8  "
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Manage Photos
          </h1>
          <div className="flex justify-between  items-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Total Photos:{" "}
              <span className="font-semibold text-purple-600">
                {photos.length}
              </span>
            </p>
            <Link to="/add-photography">
              <button className="bg-green-600 px-5 py-3 rounded-xl">
                Add Photography
              </button>
            </Link>
          </div>
        </motion.div>

        {photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="text-8xl mb-6">📸</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Photos Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              Start building your gallery by uploading photos!
            </p>
          </motion.div>
        ) : (
          <>
            {/* Desktop Table View */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Photo
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">
                        Views
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">
                        Uploaded
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {photos.map((photo, index) => (
                        <motion.tr
                          key={photo._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          {/* Photo Thumbnail */}
                          <td className="px-6 py-4">
                            <img
                              src={photo.img.url}
                              alt={`Photo ${photo._id}`}
                              className="w-24 h-24 object-cover rounded-lg shadow-md"
                            />
                          </td>

                          {/* Views */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <IoEyeOutline
                                size={20}
                                className="text-blue-600 dark:text-blue-400"
                              />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {photo.views}
                              </span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(photo.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              onClick={() => confirmDelete(photo._id)}
                              disabled={deleteMut.isPending}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <IoTrashOutline size={18} />
                              Delete
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              <AnimatePresence>
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={photo.img.url}
                        alt={`Photo ${photo._id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <IoEyeOutline size={20} />
                          <span className="font-semibold text-lg">
                            {photo.views}
                          </span>
                          <span className="text-sm opacity-80">views</span>
                        </div>
                        <motion.button
                          onClick={() => confirmDelete(photo._id)}
                          disabled={deleteMut.isPending}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50"
                        >
                          <IoTrashOutline size={20} />
                        </motion.button>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                        Uploaded:{" "}
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
