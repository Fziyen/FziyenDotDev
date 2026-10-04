// The loader lives outside React so it is visible while the app bundle downloads.
export function dismissStartupLoader() {
  const loader = document.getElementById("startup-loader");
  if (!loader || loader.classList.contains("is-ready")) return;

  loader.classList.add("is-ready");
  loader.setAttribute("aria-hidden", "true");
  document.getElementById("root")?.removeAttribute("inert");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => loader.remove(), reducedMotion ? 0 : 300);
}
