# DECEMBER TOWN — PC Main Town

Static HTML/CSS/JavaScript implementation using the supplied 1536 × 1024 town artwork.

## Run

From this folder, start a local static server:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000> in a desktop browser.

## Character Studio

Open the profile button in the top bar to customize the town character. Changes appear in the preview immediately; **저장** applies them to the moving town character and profile avatar. **랜덤 생성** picks from the available items, and **초기화** returns to the default outfit.

- Item catalog: `src/data/character-items.js`
- Sprite part paths: `src/data/character-art.js`
- Replaceable transparent SVG parts: `public/assets/character/parts/{face,hair,top,bottom,shoes,accessory}/`
- Saved character: browser `localStorage` key `decemberTown.character:local`

The current static version stores one character per browser profile. Connect the same character object to the signed-in user's account when authentication and a backend are added.

## Edit map behavior

- Background artwork: `public/assets/december-town.png` (kept at its original aspect ratio)
- Building and tree click polygons: `src/styles.css` (`.post-office`, `.winter-cafe`, `.gift-shop`, `.my-house`, `.town-square`)
- Character route: `route` in `src/main.js`; points are percentages relative to the image
- Character route: normalized waypoints and animation states in `src/main.js`
- Character layers and animations: `.character-sprite` and `.sprite-part` styles in `src/styles.css`

The service screens are placeholders. Navigation and place clicks open a “coming soon” dialog.
