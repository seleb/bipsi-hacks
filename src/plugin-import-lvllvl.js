/**
🔠
@file import lvllvl
@summary Import text-mode art designed with lvllvl
@license MIT
@author Jean-Sébastien Monzani (base code by CrocMiam)
@version 1.0


@description
Import JSON files exported from lvllvl https://lvllvl.com/


HOW TO USE:
1. In lvllvl:
1.1 Make sure your palette has max 7 colors, indexed from 0
1.2 Either design your rooms as a single long vertical image, or as frames in the animation timeline (bottom of the screen). For instance, a room is by default 16x16, and you could create a 16x32 image for two rooms or a 16x16 image with two animation frames
1.3 Export your tileset to PNG (Tiles > Save Tile Set)
1.4 Export your JSON as an image (Export > Export JSON and use the Native format. Tile Set Data isn't used so you can uncheck this)
2. Import plugin in bipsi
3. Go to edit mode, you'll find new buttons on the bottom right. First import your tilset, then the JSON image

*/

//! CODE_EDITOR
//! CODE_EDITOR
function U32ColorToRGBA(n) {
    const u32a = new Uint32Array([n]);
    const u8a = new Uint8ClampedArray(u32a.buffer);
    return Array.from(u8a);
}
function autoCloseToggledWindow(windowElement, toggle) {
    window.addEventListener("click", (event) => {
        const target = event.target;
        const ignore = windowElement.hidden ||
            !event.isTrusted ||
            windowElement.contains(target) ||
            toggle.inputs.includes(target);
        if (ignore)
            return;
        toggle.checked = false;
    });
}

const defaultOptions = {
    //roomStart: 0,
};
async function importMap(options) { //JSM
    const fullOptions = { ...defaultOptions, ...options };
    const [file] = await maker.pickFiles("application/json");
    const mapdata = await maker.textFromFile(file);    
    if (!file)
        return;
    // Create bipsi rooms & tiles
    EDITOR.stateManager.makeChange(async (data) => {
        const jsondata = JSON.parse(mapdata);
        //import colors
        let i = 1; //color 0 is reserved (transparent)
        for (color of jsondata["colorPalette"]["data"]) {
            const [b, g, r] = U32ColorToRGBA(color);
            const colhex = "#" + ("000000" + (r * 256 * 256 + g * 256 + b).toString(16)).slice(-6);        
            data.palettes[0].colors[i] = colhex; 
            i++;
            if (i>7) break; // no more than 7 colors - lvllvl sometimes add colors!!
        }
        // Rooms
        //map = jsondata["tileMap"]["layers"][0]["frames"][0]["data"];
        room = 0; //fullOptions.roomStart;
        map = jsondata["tileMap"]["layers"][0]["frames"]; // animation frames in lvllvl = rooms in bipsi
        for (oneroom of map) {
            // check if there's already a room to overwrite
            if (data.rooms[room] === undefined) { 
                data.rooms[room] = makeBlankRoom(room, data.palettes[0].id); // create new room
            }
            data.rooms[room].id = room; // ensure that room id = index (room ids can be messy initially)
            x = 0;
            y = 0;
            for (line of oneroom["data"]) {
                x = 0;
                roomdata = data.rooms[room];
                for (tile of line) {
                    roomdata.tilemap[y][x] = tile["t"]+1;
                    roomdata.foremap[y][x] = tile["fc"]+1;
                    roomdata.backmap[y][x] = tile["bc"]+1;
                    x++;
                }
                y++;
                if (y >= ROOM_SIZE) { //a long vertical image is split into rooms
                    y = 0;
                    room++;
                }	
            }
        }         
        EDITOR.requestRedraw();
    });
}

//! CODE_EDITOR
async function importTileset() {
    // TODO: ensure image is only white on transparent
    // TODO: remove missing tiles from rooms
    const [file] = await maker.pickFiles("image/png");
    if (!file)
        return;
    const url = URL.createObjectURL(file);
    let img = await loadImage(url);
    img = await ensureTilesetFormat(img);
    // How many tiles do we need to create?
    const tileCount = Math.floor(img.height / TILE_PX) * 16;
    EDITOR.stateManager.makeChange(async (data) => {
        // New tileset
        const tileset = await EDITOR.forkTileset();
        // Reset tiles
        data.tiles = [];
        for (let i = 0; i < tileCount; i++) {
            data.tiles.push({ id: i + 1, frames: [i] });
        }
        resizeTileset(tileset, data.tiles);
        EDITOR.tileBrowser.selectedTileIndex = 0;
        // Draw image on tileset
        const ctx = tileset.canvas.getContext("2d");
        ctx.clearRect(0, 0, tileset.canvas.width, tileset.canvas.height);
        ctx.drawImage(img, 0, 0);
        EDITOR.requestRedraw();
    });
}
async function ensureTilesetFormat(img) {
    // Check the dimensions match a whole number of tiles.
    if (img.height % TILE_PX !== 0 || img.width % TILE_PX !== 0) {
        throw new Error(`The dimensions of the tileset must be a multiple of ${TILE_PX}.`);
    }
    // Ensure the tileset is 16 tiles wide.
    if (img.width !== 16 * TILE_PX) {
        img = await reformatTo16Wide(img);
    }
    // TODO: convert to white on transparent.
    return img;
}
async function reformatTo16Wide(img) {
    // We need to reformat this image.
    // 1 - create canvas for the output image.
    // 2 - iterate over tiles in the input
    // 3 - find the corresponding coordinates in the output & copy the tile over.
    const inputColumns = img.width / TILE_PX;
    const inputRows = img.height / TILE_PX;
    const outputColumns = 16;
    const outputRows = Math.ceil((inputColumns * inputRows) / outputColumns);
    const output = createRendering2D(outputColumns * TILE_PX, outputRows * TILE_PX);
    for (let inputY = 0; inputY < inputRows; inputY++) {
        for (let inputX = 0; inputX < inputColumns; inputX++) {
            const index = inputX + inputY * inputColumns;
            const outputX = index % outputColumns;
            const outputY = (index - outputX) / outputColumns;
            output.drawImage(img, inputX * TILE_PX, inputY * TILE_PX, TILE_PX, TILE_PX, outputX * TILE_PX, outputY * TILE_PX, TILE_PX, TILE_PX);
        }
    }
    return await loadImage(output.canvas.toDataURL());
}

var imageUp = "<svg width=\"22\" height=\"15\" fill=\"currentColor\" viewBox=\"0 0 22 15\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M9 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z\"/><path d=\"M5 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9.777A4.5 4.5 0 0 1 14 11.5a4.5 4.5 0 0 1 2.256-3.898l-2.033-1.05a.5.5 0 0 0-.577.094l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L4 11V2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5.043A4.5 4.5 0 0 1 18.5 7a4.5 4.5 0 0 1 .5.03V2a2 2 0 0 0-2-2z\"/><path d=\"M18.495 15a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm.354-5.854 1.5 1.5a.5.5 0 0 1-.708.708l-.646-.647V13.5a.5.5 0 0 1-1 0v-2.793l-.646.647a.5.5 0 0 1-.708-.708l1.5-1.5a.5.5 0 0 1 .708 0z\"/></svg>";

var caret = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-caret-up-fill\" viewBox=\"0 0 16 16\"><path d=\"m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z\"/></svg>";

//! CODE_EDITOR
const PLUGIN_NAME = "import-lvllvl";
//no use for this !CONFIG import-map-options (json) {"roomStart": 0}
function setupEditorPlugin() {
    // Prevent repeating this setup
    EDITOR.loadedEditorPlugins ?? (EDITOR.loadedEditorPlugins = new Set());
    EDITOR.loadedEditorPlugins.add(PLUGIN_NAME);
    // Create a togglable window
    const importImageWindow = createToggleWindow({
        windowId: "import-image-window",
        toggleId: "import-image-toggle",
        inputTitle: "import image",
        inputName: "show-import-image",
        windowContent: `
      <h3>import image as tileset</h3>
      <div style="display:flex;flex-direction: row;">
        <ul style="flex:1">
          <li>image must be white with transparent background</li>
          <li>image size must be a multiple of ${TILE_PX}.</li>
        </ul>
        <button name="import-tileset" title="import image as tileset" style="flex:none;width:64px;height:48px;">
          <span style="font-size:10px">tileset</span>
          ${imageUp}
        </button>
      </div>

      <h3>import lvllvl JSON as map</h3>
      <div style="display:flex;flex-direction: row;">
        <ul style="flex:1">
          <li>Import lvllvl native JSON (tiles not required)</li>
          <li>use frames for the rooms or a long vertical pic</li>
        </ul>
        <button name="import-map" title="import image as map" style="flex:none;width:64px;height:48px;">
          <span style="font-size:10px">map</span>
          ${imageUp}
        </button>
      </div>`,
        toggleContent: `
        ${imageUp}
        ${caret}
      `,
    });
    importImageWindow.window.style.height = "auto";
    ONE("#controls").append(importImageWindow.window);
    ONE("#draw-room-tab-controls .viewport-toolbar").append(importImageWindow.button);
    const importImageButton = ONE('[name="import-tileset"]', importImageWindow.window);
    const importMapButton = ONE('[name="import-map"]', importImageWindow.window);
    EDITOR.roomPaintTool.tab(importImageWindow.button, "tile");
    importImageButton.addEventListener("click", async () => {
        await importTileset();
        // Close window
        importImageWindow.toggle.checked = false;
    });
    importMapButton.addEventListener("click", async () => {
        let options = {};
        try {
            const rawOptions = FIELD(CONFIG, "import-map-options", "json");
            if (rawOptions != null && typeof rawOptions === "object") {
                options = rawOptions;
            }
            else {
                console.log("Incorrect import-map-options");
            }
        }
        catch (e) {
            console.log("Incorrect import-map-options");
        }
        await importMap(options);
        // Close window
        importImageWindow.toggle.checked = false;
    });
}
if (!EDITOR.loadedEditorPlugins?.has(PLUGIN_NAME)) {
    setupEditorPlugin();
}
function createToggleWindow({ windowId, toggleId, inputName, inputTitle, toggleContent, windowContent, }) {
    const windowEl = document.createElement("div");
    windowEl.id = windowId;
    windowEl.className = "popup-window";
    windowEl.hidden = true;
    windowEl.innerHTML = windowContent;
    const toggleButtonEl = document.createElement("label");
    toggleButtonEl.id = toggleId;
    toggleButtonEl.className = "toggle picker-toggle";
    toggleButtonEl.hidden = true;
    toggleButtonEl.innerHTML = `
    <input type="checkbox" name="${inputName}" title="${inputTitle}">
    ${toggleContent}
  `;
    // bipsi's ui.toggle requires the element to be in the DOM
    // so we directly use the CheckboxWrapper
    const toggle = new CheckboxWrapper(ALL(`[name="${inputName}"]`, toggleButtonEl));
    toggle?.addEventListener("change", () => {
        windowEl.hidden = !toggle.checked;
    });
    autoCloseToggledWindow(windowEl, toggle);
    return {
        window: windowEl,
        button: toggleButtonEl,
        toggle,
    };
}
