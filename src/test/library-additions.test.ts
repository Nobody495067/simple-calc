import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readFirstExisting = (candidates: string[]) => {
  for (const candidate of candidates) {
    const fullPath = resolve(process.cwd(), candidate);
    if (existsSync(fullPath)) return readFileSync(fullPath, "utf8");
  }
  throw new Error(`Could not find any of: ${candidates.join(", ")}`);
};

const games = JSON.parse(
  readFirstExisting(["games-manifest.json", "public/games-manifest.json", "public/calc/games-manifest.json"])
) as string[];
const art = JSON.parse(
  readFirstExisting(["public/calc/game-art-manifest.json", "public/game-art-manifest.json", "calc/game-art-manifest.json", "game-art-manifest.json"])
) as Record<string, string | null>;

describe("Library additions", () => {
  it("keeps the original additions and includes 157 external browser games", () => {
    expect(games).toHaveLength(1133);
    expect(games.slice(971, 976)).toEqual([
      "https://Nobody495067.github.io/simple-calc/calc/gamelist/Plague-Inc/index.html",
      "./additions/pokerogue/index.html",
      "./additions/julius.html",
      "./additions/clover-pit.html",
      "./additions/ambient-lab.html",
    ]);
    expect(games.slice(976)).toHaveLength(157);
    expect(games[970]).toBe("gamelist/60-Seconds/index.html");
  });

  it("replaces only the former Grand V slot with the official PokéRogue embed", () => {
    expect(games[972]).toBe("./additions/pokerogue/index.html");
    expect(games).not.toContain("./additions/grand-v.html");
    expect(games).not.toContain("./additions/mythos/index.html");
  });

  it("provides original artwork for more than 800 library games", () => {
    const originals = Object.keys(art).filter((path) => path.startsWith("gamelist/"));
    expect(originals.length).toBeGreaterThanOrEqual(800);
    expect(art["gamelist/2048/index.html"]).toBe(
      "https://Nobody495067.github.io/simple-calc/calc/gamelist/2048/2048.jpg"
    );
  });

  it("maps the original local additions to artwork usable outside Lovable hosting", () => {
    for (const game of games.slice(972, 975)) {
      const url = new URL(art[game] || "invalid");
      expect(url.protocol).toBe("https:");
      expect(url.pathname.endsWith(".png")).toBe(true);
    }
    expect(art["./additions/ambient-lab.html"]).toBe("./art/ambient-lab.svg");
  });

  it("uses HTTPS URLs for all 157 externally hosted additions", () => {
    expect(games.slice(976).every((game) => game.startsWith("https://"))).toBe(true);
  });
});
