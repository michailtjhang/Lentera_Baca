/**
 * Utility to filter adult / 18+ content from public landing and browse pages.
 */

export const ADULT_KEYWORDS = [
  "18+",
  "adult",
  "mature",
  "r18",
  "r-18",
  "smut",
  "ecchi",
  "hentai"
];

/**
 * Checks if a string contains any adult / mature keyword.
 */
export function isAdultText(text: string | null | undefined): boolean {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  return ADULT_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Checks if a novel or item is tagged or categorized with any adult keywords.
 */
export function isAdultItem(item: {
  tags?: Array<{ name: string }>;
  genres?: Array<{ name: string }>;
}): boolean {
  if (!item) return false;
  if (item.tags && item.tags.some((t) => isAdultText(t.name))) return true;
  if (item.genres && item.genres.some((g) => isAdultText(g.name))) return true;
  return false;
}
