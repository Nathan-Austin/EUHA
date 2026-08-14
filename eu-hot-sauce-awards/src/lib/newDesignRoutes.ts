// Routes that ship their own EHSA-2027-style HeatHeader/HeatFooter and should
// not also get the old GlobalNav/Navigation/Footer. Add new redesigned routes
// here as they're built, rather than hardcoding checks in multiple places.
export function usesNewDesign(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/" || pathname.startsWith("/category/") || pathname.startsWith("/maker/");
}
