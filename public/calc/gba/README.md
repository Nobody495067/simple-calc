# GBA library

This folder contains a local ZIP-to-ROM build script and a small EmulatorJS site.

## Build the library

1. Clone or download the repository.
2. Put ZIP archives containing GBA files you are authorized to use into this folder's `zips/` directory.
3. Open a terminal in this folder and run:

   `python build.py`

4. The script extracts `.gba` members into `roms/` and regenerates `games.json`. Original ZIPs are kept in `zips/`.
5. Commit and deploy the generated `games.json` and the ROM files only when you have the rights to distribute them.

Open `index.html` through a web server or the deployed GitHub Pages URL. Do not open it with a `file://` URL because browsers commonly block the manifest fetch.

The EmulatorJS runtime is loaded from its official stable CDN and therefore requires an internet connection.
