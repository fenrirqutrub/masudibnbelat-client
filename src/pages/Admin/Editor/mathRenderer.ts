import type katexType from "katex";

let katexLoaded = false;
let katexLoading: Promise<void> | null = null;

type KaTeXWindow = Window & {
  katex?: typeof katexType;
  renderMathInElement?: (
    element: HTMLElement,
    options?: {
      delimiters?: {
        left: string;
        right: string;
        display: boolean;
      }[];
      ignoredTags?: string[];
      ignoredClasses?: string[];
      throwOnError?: boolean;
    },
  ) => void;
};

function getWindow(): KaTeXWindow {
  return window as KaTeXWindow;
}

// mathRenderer.ts - add this helper at the top
function cleanMathExpr(expr: string): string {
  return expr
    .replace(/\u00A0/g, " ") // non-breaking space → regular space
    .replace(/\u200B/g, "") // zero-width space → remove
    .replace(/\u200C/g, "") // zero-width non-joiner → remove
    .replace(/\u200D/g, "") // zero-width joiner → remove
    .trim();
}

export function loadKaTeX(): Promise<void> {
  if (katexLoaded) return Promise.resolve();
  if (katexLoading) return katexLoading;

  katexLoading = new Promise((resolve, reject) => {
    // Load CSS if not already loaded
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
      document.head.appendChild(link);
    }

    // Check if already loaded globally
    if (getWindow().katex) {
      katexLoaded = true;
      resolve();
      return;
    }

    const js = document.createElement("script");
    js.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    js.async = true;
    js.onload = () => {
      const ar = document.createElement("script");
      ar.src =
        "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js";
      ar.async = true;
      ar.onload = () => {
        katexLoaded = true;
        resolve();
      };
      ar.onerror = () => reject(new Error("Failed to load KaTeX auto-render"));
      document.head.appendChild(ar);
    };
    js.onerror = () => reject(new Error("Failed to load KaTeX"));
    document.head.appendChild(js);
  });

  return katexLoading;
}

export function renderMathToString(expr: string, display = false): string {
  const cls = display ? "ce-math-display" : "ce-math-inline";
  const safe = expr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<span class="${cls}" data-math="${encodeURIComponent(expr)}">${safe}</span>`;
}

export function renderMathInContainer(container: HTMLElement | null): void {
  if (!container) return;

  const doRender = () => {
    const win = getWindow();
    const k = win.katex;
    const rmie = win.renderMathInElement;

    if (!k) return;

    // ── 1. Render saved .ce-math-inline / .ce-math-display elements ──
    container
      .querySelectorAll<HTMLElement>(".ce-math-inline, .ce-math-display")
      .forEach((el) => {
        if (el.dataset.katexDone === "1") return;

        const expr = cleanMathExpr(
          el.dataset.math
            ? decodeURIComponent(el.dataset.math)
            : (el.textContent ?? ""),
        );

        const display = el.classList.contains("ce-math-display");

        try {
          el.innerHTML = k.renderToString(expr, {
            displayMode: display,
            throwOnError: false,
          });
          el.dataset.katexDone = "1";
          el.removeAttribute("data-katex-pending");
        } catch {
          /* keep original */
        }
      });

    // ── 2. Also re-render any pending elements from renderMathToString ──
    container
      .querySelectorAll<HTMLElement>("[data-katex-pending]")
      .forEach((el) => {
        const expr = cleanMathExpr(
          el.dataset.math
            ? decodeURIComponent(el.dataset.math)
            : (el.textContent ?? ""),
        );

        const display = el.classList.contains("ce-math-display");
        try {
          el.innerHTML = k.renderToString(expr, {
            displayMode: display,
            throwOnError: false,
          });
          el.dataset.katexDone = "1";
          el.removeAttribute("data-katex-pending");
        } catch {
          /* keep original */
        }
      });

    // ── 3. Auto-render $...$ / $$...$$ delimiters ──
    if (rmie) {
      try {
        rmie(container, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false },
          ],
          ignoredTags: [
            "script",
            "noscript",
            "style",
            "textarea",
            "pre",
            "code",
          ],
          ignoredClasses: [
            "ce-code-block",
            "ce-code-pre",
            "ce-code-line",
            "no-math",
          ],
          throwOnError: false,
        });
      } catch {
        /* ignore auto-render errors */
      }
    }
  };

  loadKaTeX()
    .then(() => {
      // Run immediately
      doRender();
      // Run again after a short delay for mobile (DOM may not be fully painted)
      setTimeout(doRender, 100);
      setTimeout(doRender, 500);
    })
    .catch(() => {
      // Retry after network delay on mobile
      setTimeout(() => {
        loadKaTeX()
          .then(doRender)
          .catch(() => {});
      }, 2000);
    });
}
