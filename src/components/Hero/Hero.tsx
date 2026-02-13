import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

// img
import s1 from "../../../public/slider/slider-1.jpg";
import s2 from "../../../public/slider/slider-2.jpg";
import s3 from "../../../public/slider/slider-3.jpg";
import s4 from "../../../public/slider/slider-4.jpg";
import s5 from "../../../public/slider/slider-5.jpg";

const Hero: React.FC = () => {
  return (
    <section className=" min-h-screen">
      <div className=" container mx-auto px-6 pt-32 pb-24">
        <Swiper
          pagination={{
            dynamicBullets: true,
          }}
          modules={[Pagination]}
          className="mySwiper"
        >
          <SwiperSlide>
            <img src={s1} alt="slider 1" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={s2} alt="slider 1" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={s3} alt="slider 1" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={s4} alt="slider 1" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={s5} alt="slider 1" />
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
};

export default Hero;
