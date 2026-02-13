import { Route, Routes } from "react-router";
import Root from "../layout/Root";
import Home from "../components/Home/Home";
import AdminLogin from "../pages/Admin/Auth/AdminLogin";
import Dashboard from "../pages/Admin/Dashboard";
import AdminLayout from "../layout/AdminLayout";
import NotFound from "../pages/NotFound/NotFound";
import PrivateRoute from "./PrivateRoute";
import Photography from "../pages/Photography/Photography";

import ManagePhotos from "../pages/Admin/Management/ManagePhotos";
import AddCategory from "../pages/Admin/AddNewItem/AddCategory";
import AddArticle from "../pages/Admin/AddNewItem/AddArticles";
import AddPhotography from "../pages/Admin/AddNewItem/AddPhotography";
import CategoryPage from "../pages/Category/CategoryPage";
import ArticleDetails from "../components/Article/ArticleDetails";
import ManageArticles from "../pages/Admin/Management/ManageArticles";
import Articles from "../components/Article/Articles";
import AddQuotes from "../pages/Admin/AddNewItem/AddQuotes";
import Management from "../pages/Admin/Management/Managment";
import AddHero from "../pages/Admin/AddNewItem/AddHero";

const Router = () => {
  return (
    <Routes>
      {/* ════════════════════ PUBLIC ROUTES ════════════════════ */}
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />

        {/* ✅ All Articles Page - সব articles একসাথে */}
        <Route path="/articles" element={<Articles />} />

        {/* ✅ Dynamic Category Route - specific category এর articles */}
        <Route path="/articles/:categorySlug" element={<CategoryPage />} />

        {/* ✅ Dynamic Article Detail Route - individual article */}
        <Route
          path="/articles/:categorySlug/:articleSlug"
          element={<ArticleDetails />}
        />

        <Route path="/photography" element={<Photography />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ════════════════════ ADMIN LOGIN ════════════════════ */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* ════════════════════ ADMIN PRIVATE ROUTES ════════════════════ */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Management Routes */}
        <Route path="management" element={<Management />} />
        <Route path="manage-articles" element={<ManageArticles />} />
        <Route path="manage-photos" element={<ManagePhotos />} />

        {/* Add New Item Routes */}
        <Route path="add-category" element={<AddCategory />} />
        <Route path="add-article" element={<AddArticle />} />
        <Route path="add-photography" element={<AddPhotography />} />
        <Route path="add-quotes" element={<AddQuotes />} />
        <Route path="add-hero" element={<AddHero />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Router;
