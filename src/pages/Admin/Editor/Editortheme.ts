export function getThemeTokens() {
  const stored = (() => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  })();
  const html = document.documentElement;
  const attrTheme = html.getAttribute("data-theme");
  const domTheme =
    attrTheme === "dark" || attrTheme === "light"
      ? attrTheme
      : html.classList.contains("dark")
        ? "dark"
        : null;
  const theme =
    stored === "dark" || stored === "light" ? stored : (domTheme ?? "dark");
  const dark = theme === "dark";
  return {
    dark,
    codeBg: dark ? "#1a1d2e" : "#f8f8f8",
    codeHdrBg: dark ? "#222538" : "#efefef",
    codeBorder: dark ? "rgba(255,255,255,0.07)" : "#e2e2e2",
    codeHdrBorder: dark ? "rgba(255,255,255,0.06)" : "#e0e0e0",
    codeText: dark ? "#cdd6f4" : "#333",
    codeLang: dark ? "#7c7f9e" : "#888",
    codeCopy: dark ? "#7c7f9e" : "#999",
    codeCopyBorder: dark ? "rgba(255,255,255,0.1)" : "#d4d4d4",
    lineNumBg: dark ? "#1e2136" : "#f0f0f0",
    lineNumColor: dark ? "#565878" : "#bbb",
    lineNumBorder: dark ? "rgba(255,255,255,0.06)" : "#e2e2e2",
  };
}

export function updateEditorTheme(forceTheme?: "dark" | "light") {
  if (forceTheme) {
    try {
      localStorage.setItem("theme", forceTheme);
    } catch (err) {
      console.error(err);
    }
    document.documentElement.setAttribute("data-theme", forceTheme);
  }
  const tk = getThemeTokens();
  document.querySelectorAll<HTMLElement>(".ce-code-block").forEach((block) => {
    block.style.background = tk.codeBg;
    block.style.borderColor = tk.codeBorder;
    const hdr = block.querySelector<HTMLElement>("div:first-child");
    if (hdr) {
      hdr.style.background = tk.codeHdrBg;
      hdr.style.borderColor = tk.codeHdrBorder;
    }
    const lbl = hdr?.querySelector<HTMLElement>("span");
    if (lbl) lbl.style.color = tk.codeLang;
    const btn = hdr?.querySelector<HTMLElement>("button");
    if (btn) {
      btn.style.color = tk.codeCopy;
      btn.style.borderColor = tk.codeCopyBorder;
    }
    const pre = block.querySelector<HTMLElement>("pre");
    if (pre) pre.style.color = tk.codeText;
    const body = block.querySelector<HTMLElement>("div:nth-child(2)");
    const gutter = body?.firstElementChild as HTMLElement | null;
    if (gutter) {
      gutter.style.background = tk.lineNumBg;
      gutter.style.borderRightColor = tk.lineNumBorder;
      gutter.style.color = tk.lineNumColor;
      gutter.querySelectorAll<HTMLElement>("div").forEach((d) => {
        d.style.color = tk.lineNumColor;
      });
    }
  });
}
