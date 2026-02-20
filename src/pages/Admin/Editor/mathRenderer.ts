import type katexType from "katex";

let katexLoaded = false;
let katexLoading: Promise<void> | null = null;

type KaTeXWindow = Window & {
  katex?: typeof katexType;
  renderMathInElement?: (
    element: HTMLElement,
    options?: {
      delimiters?: { left: string; right: string; display: boolean }[];
      ignoredTags?: string[];
      ignoredClasses?: string[];
      throwOnError?: boolean;
    },
  ) => void;
};

function getWindow(): KaTeXWindow {
  return window as KaTeXWindow;
}

function cleanMathExpr(expr: string): string {
  return expr
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace(/\u200C/g, "")
    .replace(/\u200D/g, "")
    .trim();
}

// Multiple CDN sources for mobile resilience
const KATEX_CDNS = [
  "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist",
  "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9",
];

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });
}

function loadCSS(href: string): void {
  if (document.querySelector(`link[href*="katex"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

async function tryLoadKaTeXFromCDN(base: string): Promise<void> {
  loadCSS(`${base}/katex.min.css`);
  await loadScript(`${base}/katex.min.js`);
  await loadScript(`${base}/contrib/auto-render.min.js`);
}

export function loadKaTeX(): Promise<void> {
  if (katexLoaded) return Promise.resolve();
  if (katexLoading) return katexLoading;

  katexLoading = (async () => {
    // Already on window (e.g. from a previous load attempt)
    if (getWindow().katex) {
      katexLoaded = true;
      return;
    }

    // Try each CDN in order
    for (const cdn of KATEX_CDNS) {
      try {
        await tryLoadKaTeXFromCDN(cdn);
        if (getWindow().katex) {
          katexLoaded = true;
          return;
        }
      } catch {
        // Try next CDN
      }
    }

    // Final fallback: wait and retry once more (mobile slow connection)
    await new Promise((r) => setTimeout(r, 2000));
    if (getWindow().katex) {
      katexLoaded = true;
      return;
    }
    throw new Error("KaTeX failed to load from all CDNs");
  })();

  return katexLoading;
}

export function renderMathToString(expr: string, display = false): string {
  const cls = display ? "ce-math-display" : "ce-math-inline";
  const win = getWindow();
  const k = win.katex;

  // If KaTeX already loaded → render immediately, editor shows equation right away
  if (k) {
    try {
      const rendered = k.renderToString(expr, {
        displayMode: display,
        throwOnError: false,
      });
      // Wrap in span with data-math so it can be re-rendered if needed
      return `<span class="${cls}" data-math="${encodeURIComponent(expr)}" data-katex-done="1">${rendered}</span>`;
    } catch {
      // Fall through to placeholder
    }
  }

  // KaTeX not yet loaded → show placeholder that renderMathInContainer will pick up later
  const safe = expr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<span class="${cls}" data-math="${encodeURIComponent(expr)}" data-katex-pending="1">${safe}</span>`;
}

export function renderMathInContainer(container: HTMLElement | null): void {
  if (!container) return;

  const doRender = () => {
    const win = getWindow();
    const k = win.katex;
    const rmie = win.renderMathInElement;
    if (!k) return;

    // Render .ce-math-inline / .ce-math-display elements
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

    // Render pending elements
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

    // Auto-render $...$ / $$...$$ delimiters
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
        /* ignore */
      }
    }
  };

  loadKaTeX()
    .then(() => {
      doRender();
      // Staggered retries for mobile paint delays
      setTimeout(doRender, 150);
      setTimeout(doRender, 600);
      setTimeout(doRender, 1500);
    })
    .catch(() => {
      // Reset so next attempt can retry loading
      katexLoading = null;
      setTimeout(() => {
        loadKaTeX()
          .then(doRender)
          .catch(() => {});
      }, 3000);
    });
}
