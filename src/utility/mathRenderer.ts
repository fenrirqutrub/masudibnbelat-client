/**
 * mathRenderer.ts
 * KaTeX দিয়ে full LaTeX math render।
 * Editor + Article view দুটোতেই কাজ করে।
 */

import type katexType from "katex";

let katexLoaded = false;
let katexLoading: Promise<void> | null = null;

/** Window type safely extend করা */
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

export function loadKaTeX(): Promise<void> {
  if (katexLoaded) return Promise.resolve();
  if (katexLoading) return katexLoading;

  katexLoading = new Promise((resolve, reject) => {
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
      document.head.appendChild(link);
    }

    const js = document.createElement("script");
    js.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    js.onload = () => {
      const ar = document.createElement("script");
      ar.src =
        "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js";
      ar.onload = () => {
        katexLoaded = true;
        resolve();
      };
      ar.onerror = reject;
      document.head.appendChild(ar);
    };
    js.onerror = reject;
    document.head.appendChild(js);
  });

  return katexLoading;
}

/** Single expression → HTML string (inline বা display) */
export function renderMathToString(expr: string, display = false): string {
  const k = getWindow().katex;

  if (!k) {
    const safe = expr
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<span class="${
      display ? "ce-math-display" : "ce-math-inline"
    }" data-math="${encodeURIComponent(expr)}">${safe}</span>`;
  }

  try {
    return k.renderToString(expr, {
      displayMode: display,
      throwOnError: false,
      trust: false,
    });
  } catch {
    const safe = expr
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<span class="${
      display ? "ce-math-display" : "ce-math-inline"
    }" data-math="${encodeURIComponent(expr)}">${safe}</span>`;
  }
}

/**
 * Container এর ভেতরে সব math render করে।
 * Handles:
 *   $inline$   $$display$$   \(...\)   \[...\]
 *   .ce-math-inline / .ce-math-display  (Editor এর saved format)
 */
export function renderMathInContainer(container: HTMLElement | null): void {
  if (!container) return;

  loadKaTeX().then(() => {
    const win = getWindow();
    const k = win.katex;
    const rmie = win.renderMathInElement;

    if (!k) return;

    // ── 1. Editor এর saved .ce-math-inline / .ce-math-display ──
    container
      .querySelectorAll<HTMLElement>(".ce-math-inline, .ce-math-display")
      .forEach((el) => {
        if (el.dataset.katexDone === "1") return;

        const expr = el.dataset.math
          ? decodeURIComponent(el.dataset.math)
          : (el.textContent ?? "");

        const display = el.classList.contains("ce-math-display");

        try {
          el.innerHTML = k.renderToString(expr, {
            displayMode: display,
            throwOnError: false,
          });
          el.dataset.katexDone = "1";
        } catch {
          /* keep original */
        }
      });

    // ── 2. $...$ / $$...$$ auto-render (code block বাদ দিয়ে) ──
    if (rmie) {
      rmie(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
        ignoredClasses: [
          "ce-code-block",
          "ce-code-pre",
          "ce-code-line",
          "no-math",
        ],
        throwOnError: false,
      });
    }
  });
}
