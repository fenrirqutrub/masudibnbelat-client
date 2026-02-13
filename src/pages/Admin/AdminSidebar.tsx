import { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  FilePlus,
  Image,
  Quote,
  Menu,
  X,
  Triangle,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import ThemeToggle from "../../components/Navbar/ThemeToggle";

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "management", path: "/management", icon: LayoutDashboard },

    { name: "Category", path: "/add-category", icon: FilePlus },
    { name: "Add Article", path: "/add-article", icon: FilePlus },
    { name: "Add Photo", path: "/add-photography", icon: Image },
    { name: "Add Quote", path: "/add-quotes", icon: Quote },
    { name: "Add Hero", path: "/add-hero", icon: Quote },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primaryLight dark:bg-primaryDark text-textLight dark:text-textDark p-2.5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{
          x: isOpen || window.innerWidth >= 1024 ? 0 : -280,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 w-[280px] overflow-hidden"
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Triangle className="w-6 h-6 fill-emerald-600 text-emerald-600" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Admin
                </span>
              </Link>
              <div>
                <ThemeToggle size={35} animationSpeed={0.5} />
              </div>
            </div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Manage your content
            </motion.p>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={item.path} onClick={() => setIsOpen(false)}>
                    <motion.div
                      whileHover={{
                        x: active ? 0 : 6,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:shadow-sm"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 w-1 h-10 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-r-full shadow-lg shadow-emerald-500/50"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <motion.div
                        animate={{
                          scale: active ? 1.1 : 1,
                          rotate: active ? [0, -10, 10, 0] : 0,
                        }}
                        transition={{
                          scale: { duration: 0.2 },
                          rotate: { duration: 0.5 },
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <span
                        className={`text-sm transition-all ${
                          active ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {item.name}
                      </span>
                      {active && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600"
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer */}
          <motion.div
            className="pt-4 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/30 ring-2 ring-white dark:ring-gray-900"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                FU
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Admin User
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  admin@example.com
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
