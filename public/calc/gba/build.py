#!/usr/bin/env python3
"""Build a local GBA library from ZIP files already placed in ./zips.

This script does not download files. Put ZIPs you are authorized to use in
zips/, run: python build.py
Extracted .gba files go into roms/, and games.json is regenerated.
Original ZIPs are kept in zips/ so they are not accidentally lost.
"""
from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent
ZIP_DIR = ROOT / "zips"
ROM_DIR = ROOT / "roms"
MANIFEST = ROOT / "games.json"


def safe_rom_name(member_name: str) -> str | None:
    """Return a safe basename for a GBA archive member."""
    path = PurePosixPath(member_name.replace("\\", "/"))
    if path.is_absolute() or not path.name.lower().endswith(".gba"):
        return None
    name = re.sub(r"[^A-Za-z0-9._() -]", "_", path.name).strip(" .")
    return name if name.lower().endswith(".gba") and name else None


def unique_path(directory: Path, filename: str) -> Path:
    candidate = directory / filename
    if not candidate.exists():
        return candidate
    stem, suffix = candidate.stem, candidate.suffix
    number = 2
    while True:
        candidate = directory / f"{stem} ({number}){suffix}"
        if not candidate.exists():
            return candidate
        number += 1


def main() -> None:
    ZIP_DIR.mkdir(parents=True, exist_ok=True)
    ROM_DIR.mkdir(parents=True, exist_ok=True)

    extracted = 0
    errors: list[str] = []

    for zip_path in sorted(ZIP_DIR.glob("*")):
        if not zip_path.is_file() or zip_path.suffix.lower() != ".zip":
            continue
        try:
            with zipfile.ZipFile(zip_path, "r") as archive:
                for member in archive.infolist():
                    filename = safe_rom_name(member.filename)
                    if not filename or member.is_dir():
                        continue
                    # Ignore symbolic-link entries.
                    unix_mode = (member.external_attr >> 16) & 0xFFFF
                    if (unix_mode & 0o170000) == 0o120000:
                        continue
                    destination = unique_path(ROM_DIR, filename)
                    with archive.open(member, "r") as source, destination.open("wb") as target:
                        while chunk := source.read(1024 * 1024):
                            target.write(chunk)
                    extracted += 1
        except (zipfile.BadZipFile, OSError, RuntimeError) as exc:
            errors.append(f"{zip_path.name}: {exc}")

    games = []
    for rom_path in sorted(ROM_DIR.glob("*.gba"), key=lambda p: p.name.casefold()):
        games.append({
            "title": rom_path.stem,
            "path": f"roms/{rom_path.name}"
        })

    MANIFEST.write_text(json.dumps(games, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Extracted {extracted} ROM file(s).")
    print(f"Manifest updated: {MANIFEST.name} ({len(games)} game(s) total).")
    if errors:
        print("\nSome ZIP files could not be processed:")
        for error in errors:
            print(f" - {error}")


if __name__ == "__main__":
    main()
