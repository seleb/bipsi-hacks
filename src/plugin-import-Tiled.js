/**
🧱
@file import Tiled
@summary Import maps created with Tiled
@license MIT
@author Jean-Sébastien Monzani (base code by CrocMiam)
@version 1.0


@description
 Import maps created with Tiled https://www.mapeditor.org/


HOW TO USE:
1. Import the bipsi color plugin.
2. In Tiled:
2.1a Import/create your PNG tileset
2.1b Optionally add animations to tiles. If so, export the tileset as JSON so that we can transfer the animation information to bipsi. Durations will be ignored.
2.2a Design your map on a single layer. Make sure your map size matches bipsi's default 16x16. If you multiple rooms, create one layer for each.
2.2b Export your map as JSON
2. Import plugin in bipsi
3. Go to edit mode, you'll find new buttons on the bottom right. First import your PNG tileset, then optionally your tiles animation (JSON), and the JSON map.
*/

//! CODE_EDITOR
//! CODE_EDITOR

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
    //keepColors: false,
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

        // Rooms
        room = 0;
        map = jsondata["layers"]; // layers in Tiled = rooms in bipsi
        for (oneroom of map) {
            // check if there's already a room to overwrite
            if (data.rooms[room] === undefined) { 
                data.rooms[room] = makeBlankRoom(room, data.palettes[0].id); // create new room
            }
            data.rooms[room].id = room; // ensure that room id = index (room ids can be messy initially)
            x = 0;
            y = 0;
            roomdata = data.rooms[room];
            for (tile of oneroom["data"]) {
                roomdata.tilemap[y][x] = tile;
                x++;
                if (x>=oneroom["width"]) {
                    x = 0;
                    y++;
                }
            }
            room++;
        }         
        EDITOR.requestRedraw();
    });
}
async function importAnimTileset() {
    const [file] = await maker.pickFiles("application/json");
    const mapdata = await maker.textFromFile(file);    
    if (!file)
        return;
    EDITOR.stateManager.makeChange(async (data) => {
        const jsondata = JSON.parse(mapdata);
        for (tile of jsondata.tiles) {
            data.tiles[tile.id].frames = tile.animation.map((x) => x.tileid); // ignore the duration attribute and keep the tileid
        }

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
const PLUGIN_NAME = "import-tiled";
//no use for this !CONFIG import-map-options (json) {"keepColors": false}
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
          <li>Make sure you've loaded bipsi color plugin</li>
          <li>Image size must be a multiple of ${TILE_PX}.</li>
        </ul>
        <button name="import-tileset" title="import image as tileset" style="flex:none;width:64px;height:48px;">
          <span style="font-size:10px">tileset</span>
          ${imageUp}
        </button>
      </div>

      <h3>import Tiled JSON tileset animation data</h3>
      <div style="display:flex;flex-direction: row;">
        <ul style="flex:1">
          <li>Optional: import tiles animations</li>
        </ul>
        <button name="import-anim-tileset" title="import tileset animation" style="flex:none;width:64px;height:48px;">
          <span style="font-size:10px">animation</span>
          ${imageUp}
        </button>
      </div>

      <h3>import Tiled JSON map</h3>
      <div style="display:flex;flex-direction: row;">
        <ul style="flex:1">
          <li>Import Tiled map in JSON</li>
          <li>One layer per room</li>
        </ul>
        <button name="import-map" title="import JSON map" style="flex:none;width:64px;height:48px;">
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
    const importAnimButton = ONE('[name="import-anim-tileset"]', importImageWindow.window);
    const importMapButton = ONE('[name="import-map"]', importImageWindow.window);
    EDITOR.roomPaintTool.tab(importImageWindow.button, "tile");
    importImageButton.addEventListener("click", async () => {
        await importTileset();
        // Close window
        importImageWindow.toggle.checked = false;
    });
    importAnimButton.addEventListener("click", async () => {
        await importAnimTileset();
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
