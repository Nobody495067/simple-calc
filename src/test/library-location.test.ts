import { describe, expect, it } from "vitest";
import { getLibraryUrl } from "../lib/library-location";

describe("Library deployment paths", () => {
  it("loads the library within the GitHub repository rather than the domain root", () => {
    expect(getLibraryUrl("/simple-calc/", "https://Nobody495067.github.io"))
      .toBe("https://nobody495067.github.io/simple-calc/calc/library.html");
  });

  it("keeps the root-hosted preview library working", () => {
    expect(getLibraryUrl("/", "https://example.com"))
      .toBe("https://example.com/calc/library.html");
  });
});
