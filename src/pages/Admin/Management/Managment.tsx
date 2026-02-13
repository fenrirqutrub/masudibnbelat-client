import { useState } from "react";
import { motion } from "framer-motion";
import ContentTypeSelect from "../Contenttypeselect";
import ManageArticles from "./ManageArticles";
import ManagePhotos from "./ManagePhotos";
import ManageCategory from "./ManageCategory";
import ManageQuotes from "./ManageQuotes";
import ManageHero from "./ManageHero";

// ───────────────── TYPES ─────────────────

type ContentType = "articles" | "categories" | "photos" | "quotes" | "heroes";

// ───────────────── COMPONENT ─────────────────

export const Management = () => {
  const [activeTab, setActiveTab] = useState<ContentType>("articles");

  const handleTabChange = (tab: ContentType) => {
    setActiveTab(tab);
  };

  // ───────────────── RENDER CONTENT ─────────────────

  const renderContent = () => {
    switch (activeTab) {
      case "articles":
        return <ManageArticles />;
      case "photos":
        return <ManagePhotos />;
      case "categories":
        return <ManageCategory />;
      case "quotes":
        return <ManageQuotes />;
      case "heroes":
        return <ManageHero />;
      default:
        return <ManageArticles />;
    }
  };

  // ───────────────── UI ─────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0C0D12] dark:to-[#1A1B22] text-[#0C0D12] dark:text-[#FFFFFF] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Content Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Manage all your content in one place
          </p>
        </motion.div>

        {/* CONTENT TYPE SELECTOR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 max-w-xs mx-auto"
        >
          <ContentTypeSelect
            selectedType={activeTab}
            onSelectType={handleTabChange}
          />
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Management;
