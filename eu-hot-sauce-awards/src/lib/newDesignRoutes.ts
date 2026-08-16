// Routes that still ship the OLD GlobalNav/Navigation/Footer, because their
// own page content hasn't been redesigned to the EHSA-2027 style yet. Every
// other route — including ones that don't exist, which is what makes 404s
// render with the new chrome too — gets the new design by default. Add a
// route here only when it genuinely still needs the old chrome; remove it
// the moment its content is redesigned, rather than adding new entries to
// a "new design" allow-list that's easy to forget.
const OLD_DESIGN_PREFIXES = [
  "/judge/ready",
  "/judge/scan",
  "/judge/start",
  "/judge/score/",
];

export function usesNewDesign(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/dashboard")) return false;
  return !OLD_DESIGN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
