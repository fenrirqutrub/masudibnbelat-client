// src/pages/Photography/Photography.tsx
import { useEffect, useState } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { IoEyeOutline, IoCloseOutline } from "react-icons/io5";
import { axiosPublic } from "../../hooks/axiosPublic";

interface Photo {
  _id: string;
  img: {
    url: string;
    publicId: string;
  };
  views: number;
  createdAt: string;
  timeAgo: string;
}

interface PageData {
  data: Photo[];
  pagination: {
    page: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

const fetchPhotos = async ({ pageParam = 1 }): Promise<PageData> => {
  const response = await axiosPublic.get(
    `/api/photography?page=${pageParam}&limit=12`
  );
  return response.data;
};

const incrementView = async (id: string) => {
  await axiosPublic.post(`/api/photography/${id}/view`);
};

export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const viewMutation = useMutation({
    mutationFn: incrementView,
  });

  const photos = data?.pages.flatMap((page) => page.data) ?? [];

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    viewMutation.mutate(photo._id);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading gallery...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-2xl text-red-500 mb-4">
            ❌ Failed to load gallery
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  refetch();

  return (
    <>
      <div className="min-h-screen py-8 px-4 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold  mb-4">
              Photo Gallery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {photos.length} beautiful moments captured
            </p>
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
              {/* Masonry Grid */}
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="break-inside-avoid group cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800">
                      <motion.img
                        src={photo.img.url}
                        alt={`Photo ${photo._id}`}
                        className="w-full h-auto object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Overlay with views */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4 transition-opacity duration-300"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <IoEyeOutline size={20} />
                          <span className="font-semibold">{photo.views}</span>
                          <span className="text-sm opacity-80">views</span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-12"
                >
                  <motion.button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
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
                        Loading...
                      </span>
                    ) : (
                      "Load More"
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* End Message */}
              {!hasNextPage && photos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-12 text-gray-500 dark:text-gray-400"
                >
                  <p className="text-lg">✨ You've reached the end ✨</p>
                  <p className="text-sm mt-2">
                    Showing all {photos.length} photos
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeModal}
              className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl"
            >
              <IoCloseOutline size={28} />
            </motion.button>

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-7xl max-h-[90vh] mx-auto"
            >
              <img
                src={selectedPhoto.img.url}
                alt={`Photo ${selectedPhoto._id}`}
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              />

              {/* Views Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl"
              >
                <IoEyeOutline size={24} />
                <span className="font-bold text-lg">{selectedPhoto.views}</span>
                <span className="opacity-80">views</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
