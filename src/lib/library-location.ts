/** Build the library URL relative to the deployed application base. */

export function getLibraryUrl(appBase: string, origin: string): string {
  const base = appBase.endsWith("/") ? appBase : `${appBase}/`;
  return new URL(`${base}calc/library.html`, `${origin.replace(/\/+$/, "")}/`).href;
}
