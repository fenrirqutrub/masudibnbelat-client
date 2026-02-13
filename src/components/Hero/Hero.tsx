// Hero.tsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import { useHeroes } from "../../hooks/useHeroes";
import Loader from "../ui/Loader";
import ErrorState from "../ui/Errorstate";

const Hero: React.FC = () => {
  const { data, isLoading, isError, error } = useHeroes();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          (error as Error)?.message ||
          "Failed to load heroes. Please try again."
        }
        title="Failed to Load Heroes"
        fullScreen
      />
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">No heroes found</p>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20">
        <Swiper
          pagination={{
            dynamicBullets: true,
            clickable: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={data.data.length > 1}
          modules={[Pagination, Autoplay]}
          className="mySwiper rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl w-full"
        >
          {data.data.map((hero) => (
            <SwiperSlide key={hero._id}>
              <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] ">
                <img
                  src={hero.imageUrl}
                  alt={hero.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay with title */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 md:p-8">
                  <h2 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold drop-shadow-lg">
                    {hero.title}
                  </h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Hero;
