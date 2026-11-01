/*
 * Keeps the browser/phone UI color (status and gesture bars) in step with the
 * theme the reader picked, not just the OS setting.
 *
 * The two <meta name="theme-color" media="(prefers-color-scheme: ...)"> tags in
 * BaseLayout hold the colors. When a theme is forced, a copy of the matching one
 * without a media query is put first, so it wins. The inline script in
 * BaseLayout's <head> does the same on load; keep the two in sync.
 */
export function applyThemeColor(theme: string) {
  document.querySelector('meta[name="theme-color"][data-forced]')?.remove();
  if (theme !== "light" && theme !== "dark") return;

  const source = document.querySelector<HTMLMetaElement>(
    `meta[name="theme-color"][media*="${theme}"]`
  );
  if (!source) return;

  const forced = document.createElement("meta");
  forced.name = "theme-color";
  forced.content = source.content;
  forced.dataset.forced = "";
  document.head.prepend(forced);
}
