/*
 * Splits a book summary's rendered HTML at each <h2> so the page can lay it out
 * for phones without changing any wording:
 *
 * - The short fact sections (Author, Era / Date, Audience, Genre) become the
 *   "At a glance" card. Each shows its first paragraph; the rest sits behind "More".
 * - Every other section gets a stable id for the "On this page" links.
 *
 * The HTML comes from Astro's own Markdown renderer, so its shape is predictable:
 * an <h2> followed by sibling block elements.
 */

const GLANCE_LABELS: Record<string, string> = {
  Author: "Author",
  "Era / Date": "Written",
  Audience: "Audience",
  Genre: "Genre",
};

export const GLANCE_ID = "at-a-glance";

export type GlanceFact = { label: string; lead: string; more: string };
export type BookSection = { id: string; title: string; html: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#x26;/g, "&")
    .trim();
}

// Splits "<p>a</p>\n<p>b</p>" into its first paragraph and everything after it.
function splitLead(html: string): { lead: string; more: string } {
  const trimmed = html.trim();
  const end = trimmed.indexOf("</p>");
  if (!trimmed.startsWith("<p") || end === -1)
    return { lead: trimmed, more: "" };
  return {
    lead: trimmed.slice(0, end + 4),
    more: trimmed.slice(end + 4).trim(),
  };
}

export function splitBook(html: string) {
  const parts = html.split(/<h2[^>]*>([\s\S]*?)<\/h2>/);
  const intro = parts[0].trim();
  const facts: GlanceFact[] = [];
  const sections: BookSection[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    const title = plainText(parts[i]);
    const body = parts[i + 1] ?? "";
    const label = GLANCE_LABELS[title];

    if (label) facts.push({ label, ...splitLead(body) });
    else sections.push({ id: slugify(title), title, html: body.trim() });
  }

  return { intro, facts, sections };
}
