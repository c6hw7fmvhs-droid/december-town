# DECEMBER TOWN — PC Main Town

Static HTML/CSS/JavaScript implementation using the supplied 1536 × 1024 town artwork.

## Run

From this folder, start a local static server:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000> in a desktop browser.

## Edit map behavior

- Background artwork: `public/assets/december-town.png` (kept at its original aspect ratio)
- Building and tree click polygons: `src/styles.css` (`.post-office`, `.winter-cafe`, `.gift-shop`, `.my-house`, `.town-square`)
- Character route: `route` in `src/main.js`; points are percentages relative to the image
- Temporary character: `#pixelPerson` in `index.html` and `.pixel-*` styles in `src/styles.css`

The service screens are placeholders. Navigation and place clicks open a “coming soon” dialog.
