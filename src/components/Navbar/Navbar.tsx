import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router";
import { useTheme } from "../../context/ThemeProvider";
import ThemeToggle from "./ThemeToggle";

type SubMenuItem = {
  readonly name: string;
  readonly path: string;
};

type MenuItem = {
  readonly name: string;
  readonly path: string;
  readonly subItems?: readonly SubMenuItem[];
};

const MENU_CONFIG: readonly MenuItem[] = [
  { name: "home", path: "/" },
  {
    name: "articles",
    path: "#",
    subItems: [
      { name: "technology", path: "/articles/technology" },
      { name: "lifestyle", path: "/articles/lifestyle" },
      { name: "travel", path: "/articles/travel" },
      { name: "motivation", path: "/articles/motivation" },
    ],
  },
  { name: "kobita", path: "/kobita" },
  { name: "photography", path: "/photography" },
  {
    name: "religion",
    path: "#",
    subItems: [
      { name: "islam", path: "/religion/islamic" },
      { name: "hinduism", path: "/religion/hinduism" },
      { name: "buddhism", path: "/religion/buddhism" },
      { name: "judaism", path: "/religion/judaism" },
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/*                DERIVE MenuItemName FROM MENU_CONFIG                */
/* ------------------------------------------------------------------ */
type MenuItemName =
  | (typeof MENU_CONFIG)[number]["name"]
  | (typeof MENU_CONFIG)[number]["subItems"] extends readonly (infer S)[]
  ? S extends { name: infer N }
    ? N
    : never
  : never;

/* ------------------------------------------------------------------ */
/*                     OTHER TYPES & CONSTANTS                        */
/* ------------------------------------------------------------------ */
interface NavbarState {
  mobileMenuOpen: boolean;
  scrolled: boolean;
  openDropdown: MenuItemName | null;
}

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3, delay: 0.2 } },
} as const;

const MENU_ITEMS_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
} as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 30, rotateX: -90 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] },
  },
} as const;

const THEME_COLORS = {
  dark: {
    bg: {
      primary: "#0D0F14",
      secondary: "#171B1F",
      mobile: "#0C0D12",
    },
    text: {
      primary: "#F8F9FA",
      secondary: "#94A3B8",
    },
    border: "rgba(248, 249, 250, 0.1)",
    hover: "rgba(248, 249, 250, 0.05)",
  },
  light: {
    bg: {
      primary: "#FFFFFF",
      secondary: "#F1F5F9",
      mobile: "#F8FAFC",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    border: "oklch(70.7% 0.022 261.325)",
    hover: "rgba(15, 23, 42, 0.05)",
  },
} as const;

/* ------------------------------------------------------------------ */
/*                         NAVBAR COMPONENT                           */
/* ------------------------------------------------------------------ */
const Navbar: React.FC = () => {
  const [state, setState] = useState<NavbarState>({
    mobileMenuOpen: false,
    scrolled: false,
    openDropdown: null,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const colors = THEME_COLORS[theme];

  /* -------------------------------------------------------------- */
  /*                ACTIVE ITEM – fully dynamic                     */
  /* -------------------------------------------------------------- */
  const { activeItem } = useMemo(() => {
    const currentPath = location.pathname;

    for (const parent of MENU_CONFIG) {
      if (!parent.subItems) continue;

      for (const sub of parent.subItems) {
        const exact = currentPath === sub.path;
        const nested = currentPath.startsWith(sub.path + "/");

        if (exact || nested) {
          return {
            activeItem: sub.name as MenuItemName,
            activeParent: parent.name as MenuItemName,
          };
        }
      }
    }

    const topMatch = MENU_CONFIG.find((i) => i.path === currentPath);
    if (topMatch) {
      return {
        activeItem: topMatch.name as MenuItemName,
        activeParent: null,
      };
    }

    console.log("\nWarning: NO MATCH FOUND – defaulting to home");
    return { activeItem: "home" as MenuItemName, activeParent: null };
  }, [location.pathname]);

  /* -------------------------------------------------------------- */
  /*                SCROLL, CLICK-OUTSIDE, BODY LOCK                */
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
    const handler = (e: MouseEvent) => {
      if (
        state.openDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setState((p) => ({ ...p, openDropdown: null }));
      }
    };
    if (state.openDropdown) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [state.openDropdown]);

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
    [navigate]
  );

  const toggleDropdown = useCallback((name: MenuItemName) => {
    setState((p) => ({
      ...p,
      openDropdown: p.openDropdown === name ? null : name,
    }));
  }, []);

  const closeDropdown = useCallback(() => {
    setState((p) => ({ ...p, openDropdown: null }));
  }, []);

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
            <Link to="/">
              <button
                className="relative text-2xl md:text-3xl pacifico leading-none cursor-pointer"
                aria-label="Masud ibn Belat"
                onClick={handleLogo}
              >
                {/* Desktop */}
                <span
                  className="hidden md:inline-block"
                  style={{ color: colors.text.primary }}
                >
                  Masud ibn Belat
                </span>

                {/* Mobile – bold effect */}
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
            </Link>

            {/* DESKTOP MENU */}
            <ul className="hidden md:flex items-center space-x-1 relative">
              {MENU_CONFIG.map((item) => {
                const hasDropdown = !!item.subItems;
                const isDropdownOpen = state.openDropdown === item.name;
                const isActive =
                  activeItem === item.name ||
                  (item.subItems?.some((sub) => sub.name === activeItem) ??
                    false);

                return (
                  <li key={item.name} className="relative">
                    {hasDropdown ? (
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() =>
                            toggleDropdown(item.name as MenuItemName)
                          }
                          onMouseEnter={() =>
                            toggleDropdown(item.name as MenuItemName)
                          }
                          className="px-5 py-2.5 rounded-lg font-medium capitalize transition-all cursor-pointer relative z-10 flex items-center gap-1"
                          style={{
                            color: isActive
                              ? colors.text.primary
                              : colors.text.secondary,
                          }}
                        >
                          {item.name}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Active Tab Background */}
                        {isActive && (
                          <motion.div
                            layoutId="desktopActiveTab"
                            className="absolute inset-0 rounded-lg border"
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

                        {/* Dropdown */}
                        {/* Dropdown */}
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              className="absolute top-full left-0 mt-2 min-w-[200px] rounded-xl border overflow-hidden shadow-lg"
                              style={{
                                backgroundColor: colors.bg.primary,
                                borderColor: colors.border,
                              }}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              onMouseLeave={closeDropdown}
                            >
                              {item.subItems!.map((sub) => {
                                const subActive = activeItem === sub.name;

                                return (
                                  <div key={sub.name} className="relative">
                                    {/* ---- NEW: Active indicator for sub-item ---- */}
                                    {subActive && (
                                      <motion.div
                                        layoutId={`desktopSubActive-${item.name}`}
                                        className="absolute inset-0 rounded-none border"
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

                                    <button
                                      onClick={() => handleNavigation(sub.path)}
                                      className="w-full px-5 py-3 text-left capitalize transition-all relative z-10"
                                      style={{
                                        color: subActive
                                          ? colors.text.primary
                                          : colors.text.secondary,
                                      }}
                                      onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          colors.hover)
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          subActive
                                            ? colors.bg.secondary // <-- keep active bg on hover-out
                                            : "transparent")
                                      }
                                    >
                                      {sub.name}
                                    </button>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className="px-5 py-2.5 rounded-lg font-medium capitalize transition-all cursor-pointer relative z-10 "
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
                            className="absolute inset-0 rounded-lg border "
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
                      </>
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
      {/* ========== PROFESSIONAL MOBILE MENU – LOGISTICS GRADE ========== */}
      <AnimatePresence mode="wait">
        {state.mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[55] md:hidden bg-black/50 backdrop-blur-sm"
              variants={OVERLAY_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={toggleMobileMenu}
            />

            {/* Drawer Container */}
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

                {/* Scrollable Menu */}
                <nav className="flex-1 overflow-y-auto px-6 py-4">
                  <motion.ul
                    className="space-y-1"
                    variants={MENU_ITEMS_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {MENU_CONFIG.map((item, index) => {
                      const hasSub = !!item.subItems;
                      const isExpanded = state.openDropdown === item.name;
                      const isActive =
                        activeItem === item.name ||
                        (item.subItems?.some((s) => s.name === activeItem) ??
                          false);

                      return (
                        <motion.li
                          key={item.name}
                          variants={ITEM_VARIANTS}
                          custom={index}
                          className="relative"
                        >
                          {hasSub ? (
                            <>
                              {/* Parent Button */}
                              <button
                                onClick={() =>
                                  toggleDropdown(item.name as MenuItemName)
                                }
                                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all"
                                style={{
                                  backgroundColor: isActive
                                    ? colors.hover
                                    : "transparent",
                                  color: isActive
                                    ? colors.text.primary
                                    : colors.text.secondary,
                                }}
                              >
                                <span className="text-lg font-semibold capitalize">
                                  {item.name}
                                </span>
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <ChevronDown className="w-5 h-5" />
                                </motion.div>
                              </button>

                              {/* Submenu */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.ul
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                      duration: 0.25,
                                      ease: "easeInOut",
                                    }}
                                    className="ml-6 mt-1 space-y-1 overflow-hidden"
                                  >
                                    {item.subItems!.map((sub) => {
                                      const subActive = activeItem === sub.name;
                                      return (
                                        <motion.li
                                          key={sub.name}
                                          whileHover={{ x: 4 }}
                                          whileTap={{ scale: 0.98 }}
                                        >
                                          <button
                                            onClick={() =>
                                              handleNavigation(sub.path)
                                            }
                                            className="w-full text-left px-4 py-2.5 rounded-lg text-base font-medium capitalize transition-all"
                                            style={{
                                              color: subActive
                                                ? colors.text.primary
                                                : colors.text.secondary,
                                              backgroundColor: subActive
                                                ? colors.bg.secondary
                                                : "transparent",
                                            }}
                                          >
                                            {sub.name}
                                          </button>
                                        </motion.li>
                                      );
                                    })}
                                  </motion.ul>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            /* Simple Item */
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
                                  className="absolute inset-0 rounded-xl"
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
                          )}
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                </nav>

                {/* Footer Actions */}
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
