import { Suspense, useEffect } from "react";
import Hero from "../Hero/Hero";

import PageLoader from "../ui/PagLoader";
import UpDown from "../ui/UpDown";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="">
      <Suspense fallback={<PageLoader />}>
        <Hero />
      </Suspense>
      <div className="fixed bottom-5 right-5">
        <UpDown />
      </div>
    </div>
  );
};

export default Home;
