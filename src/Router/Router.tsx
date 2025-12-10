import { Route, Routes } from "react-router";
import Root from "../layout/Root";
import Home from "../components/Home/Home";
import AdminLogin from "../pages/Admin/Auth/AdminLogin";
import Dashboard from "../pages/Admin/Dashboard";
import AdminLayout from "../layout/AdminLayout";
import NotFound from "../pages/NotFound/NotFound";
import PrivateRoute from "./PrivateRoute";
import Technology from "../pages/Articles/Technology/Technology";
import Lifestyle from "../pages/Articles/Lifestyle/Lifestyle";
import Photography from "../pages/Photography/Photography";
import Islamic from "../pages/Religion/Islamic/Islamic";
import Hinduism from "../pages/Religion/Hinduism/Hinduism";
import Buddhism from "../pages/Religion/Buddhism/Buddhism";
import Judaism from "../pages/Religion/Judaism/Judaism";
import TechnologyCardDetails from "../pages/Articles/Technology/TechnologyCardDetails";
import LifestyleCardDetails from "../pages/Articles/Lifestyle/LifestyleCardDetails";
import Travel from "../pages/Articles/Travel/Travel";
import TravelCardDetails from "../pages/Articles/Travel/TravelCardDetails";
import Motivation from "../pages/Articles/Motivation/Motivation";
import MotivationCardDetails from "../pages/Articles/Motivation/MotivationCardDetails";
import Kobita from "../pages/Kobita/Kobita";
import KobitaCardDetails from "../pages/Kobita/KobitaCardDetails";
import IslamicCardDetails from "../pages/Religion/Islamic/IslamicCardDetails";
import HinduismCardDetails from "../pages/Religion/Hinduism/HinduismCardDetails";
import BuddhismCardDetails from "../pages/Religion/Buddhism/BuddhismCardDetails";
import JudaismCardDetails from "../pages/Religion/Judaism/JudaismCardDetails";
import ManageCategory from "../pages/Admin/Management/ManageCategory";
import ManageArticleTechnology from "../pages/Admin/Management/ManageArticles/ManageArticleTechnology";
import ManageArticleLifestyle from "../pages/Admin/Management/ManageArticles/ManageArticleLifestyle";
import ManageArticleMotivation from "../pages/Admin/Management/ManageArticles/ManageArticleMotivation";
import ManageArticleTravel from "../pages/Admin/Management/ManageArticles/ManageArticleTravel";
import ManageKobita from "../pages/Admin/Management/ManageKobita";
import ManageIslamic from "../pages/Admin/Management/ManageRegion/ManageIslamic";
import ManageHinduism from "../pages/Admin/Management/ManageRegion/ManageHinduism";
import ManageBuddhism from "../pages/Admin/Management/ManageRegion/ManageBuddhism";
import ManageJudaism from "../pages/Admin/Management/ManageRegion/ManageJudaism";
import ManagePhotos from "../pages/Admin/Management/ManagePhotos";
import AddCategory from "../pages/Admin/AddNewItem/AddCategory";
import AddArticle from "../pages/Admin/AddNewItem/AddArticles";
import AddPhotography from "../pages/Admin/AddNewItem/AddPhotography";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />

        <Route path="/articles/technology" element={<Technology />} />
        <Route
          path="/articles/technology/:id"
          element={<TechnologyCardDetails />}
        />

        <Route path="/articles/lifestyle" element={<Lifestyle />} />
        <Route
          path="/articles/lifestyle/:id"
          element={<LifestyleCardDetails />}
        />

        <Route path="/articles/travel" element={<Travel />} />
        <Route path="/articles/travel/:id" element={<TravelCardDetails />} />

        <Route path="/articles/motivation" element={<Motivation />} />
        <Route
          path="/articles/motivation/:id"
          element={<MotivationCardDetails />}
        />

        <Route path="/kobita" element={<Kobita />} />
        <Route path="/articles/kobita/:id" element={<KobitaCardDetails />} />

        <Route path="/photography" element={<Photography />} />

        <Route path="/religion/islamic" element={<Islamic />} />
        <Route path="/religion/islamic/:id" element={<IslamicCardDetails />} />

        <Route path="/religion/hinduism" element={<Hinduism />} />
        <Route
          path="/religion/hinduism/:id"
          element={<HinduismCardDetails />}
        />

        <Route path="/religion/buddhism" element={<Buddhism />} />
        <Route
          path="/religion/buddhism/:id"
          element={<BuddhismCardDetails />}
        />

        <Route path="/religion/judaism" element={<Judaism />} />
        <Route path="/religion/judaism/:id" element={<JudaismCardDetails />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin-login" element={<AdminLogin />} />

      <Route
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 
                            Manage Article Routes 
                                                                */}
        <Route path="/manage-category" element={<ManageCategory />} />
        <Route
          path="/manage-article-technology"
          element={<ManageArticleTechnology />}
        />
        <Route
          path="/manage-article-lifestyle"
          element={<ManageArticleLifestyle />}
        />
        <Route
          path="/manage-article-motivation"
          element={<ManageArticleMotivation />}
        />
        <Route
          path="/manage-article-travel"
          element={<ManageArticleTravel />}
        />
        <Route
          path="/manage-article-travel"
          element={<ManageArticleTravel />}
        />
        <Route path="/manage-article-kobita" element={<ManageKobita />} />
        <Route path="/manage-article-islamic" element={<ManageIslamic />} />
        <Route path="/manage-article-hinduism" element={<ManageHinduism />} />
        <Route path="/manage-article-buddhism" element={<ManageBuddhism />} />
        <Route path="/manage-article-judaism" element={<ManageJudaism />} />
        <Route path="/manage-article-photography" element={<ManagePhotos />} />

        {/* 
                             Add New Article Routes 
                                                                */}
        <Route path="/add-category" element={<AddCategory />} />
        <Route path="/add-article" element={<AddArticle />} />
        <Route path="/add-photography" element={<AddPhotography />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Router;
