import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import { useTheme } from "../../context/ThemeProvider";
import ThemeToggle from "./ThemeToggle";

type MenuItem = {
  readonly name: string;
  readonly path: string;
  readonly subItems?: never;
};

/* ------------------------------------------------------------------ */
/*                         NAVBAR COMPONENT                           */
/* ------------------------------------------------------------------ */
const Navbar: React.FC = () => {
  const [state, setState] = useState({
    mobileMenuOpen: false,
    scrolled: false,
    openDropdown: null as string | null,
  });

  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Static menu — no sub-items
  const MENU_CONFIG = useMemo<MenuItem[]>(
    () => [
      { name: "home", path: "/" },
      { name: "articles", path: "/articles" },
      { name: "photography", path: "/photography" },
    ],
    [],
  );

  const colors = {
    dark: {
      bg: { primary: "#0D0F14", secondary: "#171B1F", mobile: "#0C0D12" },
      text: { primary: "#F8F9FA", secondary: "#94A3B8" },
      border: "rgba(248, 249, 250, 0.1)",
      hover: "rgba(248, 249, 250, 0.05)",
    },
    light: {
      bg: { primary: "#FFFFFF", secondary: "#F1F5F9", mobile: "#F8FAFC" },
      text: { primary: "#0F172A", secondary: "#64748B" },
      border: "oklch(70.7% 0.022 261.325)",
      hover: "rgba(15, 23, 42, 0.05)",
    },
  }[theme];

  // Simplified active item detection (no submenus)
  const activeItem = useMemo(() => {
    const currentPath = location.pathname;

    const exactMatch = MENU_CONFIG.find((item) => item.path === currentPath);
    if (exactMatch) return exactMatch.name;

    // Optional: highlight "articles" when inside /articles/*
    if (currentPath.startsWith("/articles")) {
      return "articles";
    }

    return "home";
  }, [MENU_CONFIG, location.pathname]);

  /* -------------------------------------------------------------- */
  /*                SCROLL, BODY LOCK                               */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setState((p) => (p.scrolled !== scrolled ? { ...p, scrolled } : p));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = state.mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [state.mobileMenuOpen]);

  useEffect(() => {
    setState((p) => ({ ...p, openDropdown: null }));
  }, [location.pathname]);

  /* -------------------------------------------------------------- */
  /*                         HANDLERS                               */
  /* -------------------------------------------------------------- */
  const toggleMobileMenu = useCallback(() => {
    setState((p) => ({ ...p, mobileMenuOpen: !p.mobileMenuOpen }));
  }, []);

  const handleNavigation = useCallback(
    (path: string) => {
      setState((p) => ({ ...p, mobileMenuOpen: false, openDropdown: null }));
      navigate(path);
    },
    [navigate],
  );

  const handleLogo = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const maxScroll = scrollHeight - clientHeight;

    const nearTop = scrollTop <= 50;
    const nearBottom = maxScroll - scrollTop <= 50;

    if (nearTop) {
      window.scrollTo({ top: scrollHeight, behavior: "smooth" });
    } else if (nearBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: scrollTop < maxScroll / 2 ? scrollHeight : 0,
        behavior: "smooth",
      });
    }
  }, []);

  /* -------------------------------------------------------------- */
  /*                         RENDER                                 */
  /* -------------------------------------------------------------- */
  return (
    <>
      {/* ========== FIXED NAVBAR ========== */}
      <nav
        className={`fixed z-50 transition-all duration-300 ${
          state.scrolled
            ? "top-0 left-0 right-0 py-3 border"
            : "top-0 left-0 right-0 py-4"
        }`}
        style={{
          backgroundColor: state.scrolled ? colors.bg.primary : "transparent",
          backdropFilter: state.scrolled ? "blur(12px)" : "none",
          borderColor: state.scrolled ? colors.border : "transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <button
              className="relative text-2xl md:text-3xl pacifico leading-none cursor-pointer"
              aria-label="Masud ibn Belat"
              onClick={() => {
                handleLogo();
                navigate("/");
              }}
            >
              <span
                className="hidden md:inline-block"
                style={{ color: colors.text.primary }}
              >
                Masud ibn Belat
              </span>

              <span
                className="md:hidden block relative"
                style={{ lineHeight: 1 }}
              >
                {[
                  { x: 0.6, y: 0.6, z: 5 },
                  { x: -0.6, y: -0.6, z: 6 },
                  { x: 0, y: 0.9, z: 7 },
                ].map((o, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      transform: `translate(${o.x}px, ${o.y}px)`,
                      color: colors.text.primary,
                      zIndex: o.z,
                    }}
                  >
                    Masud ibn Belat
                  </span>
                ))}
                <span
                  className="relative"
                  style={{ color: colors.text.primary, zIndex: 10 }}
                >
                  Masud ibn Belat
                </span>
              </span>
            </button>

            {/* DESKTOP MENU */}
            <ul className="hidden md:flex items-center space-x-1 relative">
              {MENU_CONFIG.map((item) => {
                const isActive = activeItem === item.name;

                return (
                  <li key={item.name} className="relative">
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="px-5 py-2.5 rounded-lg font-medium capitalize transition-all cursor-pointer relative z-10"
                      style={{
                        color: isActive
                          ? colors.text.primary
                          : colors.text.secondary,
                      }}
                    >
                      {item.name}
                    </button>

                    {isActive && (
                      <motion.div
                        layoutId="desktopActiveTab"
                        className="absolute inset-0 rounded-lg border pointer-events-none"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          borderColor: colors.border,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                          mass: 0.8,
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <ThemeToggle size={35} animationSpeed={0.5} />
              </div>

              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2.5 rounded-lg transition-all z-[60] relative"
                style={{
                  backgroundColor: colors.bg.secondary,
                  color: colors.text.primary,
                }}
                aria-label="Toggle menu"
              >
                {state.mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== MOBILE MENU ========== */}
      <AnimatePresence mode="wait">
        {state.mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[55] md:hidden bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />

            {/* Drawer */}
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-md z-[56] md:hidden shadow-2xl overflow-hidden"
              style={{ backgroundColor: colors.bg.mobile }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div
                  className="flex items-center justify-between p-6 border-b"
                  style={{ borderColor: colors.border }}
                >
                  <h2
                    className="text-2xl font-bold pacifico"
                    style={{ color: colors.text.primary }}
                  >
                    Menu
                  </h2>
                  <motion.button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: colors.hover,
                      color: colors.text.primary,
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Menu items */}
                <nav className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-1">
                    {MENU_CONFIG.map((item) => {
                      const isActive = activeItem === item.name;

                      return (
                        <li key={item.name}>
                          <button
                            onClick={() => handleNavigation(item.path)}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all relative overflow-hidden"
                            style={{
                              color: isActive
                                ? colors.text.primary
                                : colors.text.secondary,
                            }}
                          >
                            <span className="text-lg font-semibold capitalize">
                              {item.name}
                            </span>
                            {isActive && (
                              <motion.div
                                className="absolute inset-0 rounded-xl pointer-events-none"
                                layoutId="mobileActiveBg"
                                style={{
                                  backgroundColor: colors.bg.secondary,
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 30,
                                }}
                              />
                            )}
                            {isActive && (
                              <span
                                className="text-sm ml-2"
                                style={{ color: colors.text.secondary }}
                              >
                                Current
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Footer */}
                <div
                  className="p-6 border-t"
                  style={{ borderColor: colors.border }}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <ThemeToggle size={42} animationSpeed={0.6} />
                    <p
                      className="text-xs"
                      style={{ color: colors.text.secondary }}
                    >
                      © 2025 Masud ibn Belat. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
