/** Keep library files beside the exported app, including GitHub repository sites. */

export function getLibraryUrl(appBase: string, origin: string): string {
  let base = appBase.replace(/\/+$/, "");

  if (base.endsWith("/calc/calc")) {
    base = base.slice(0, -5);
  }

  return `${origin.replace(/\/+$/, "")}${base}/calc/library.html`;
}
