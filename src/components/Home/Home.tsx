import { Suspense, useEffect } from "react";
import Hero from "../Hero/Hero";
import UpDown from "../ui/UpDown";
import ArticleHome from "../Article/ArticleHome";
import Quotes from "../Quotes/Quotes";
import Loader from "../ui/Loader";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="">
      <Suspense fallback={<Loader />}>
        <Hero />
        <ArticleHome />
        <Quotes />
      </Suspense>
      <div className="fixed bottom-5 right-5 z-50">
        <UpDown />
      </div>
    </div>
  );
};

export default Home;
