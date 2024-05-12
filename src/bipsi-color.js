/**
🎨
@file bipsi color
@summary Switch bipsi to full-color tiles
@license MIT
@author Candle and Jean-Sébastien Monzani 
@version 1.0


@description
Allows you to use your own color tilesets. 


HOW TO USE:
1. Import plugin in bipsi
2. To load your own tileset, import the -import image- plugin or -import Tiled- plugin (this ones handles tiles animations as well)
3. Make sure your tileset is composed of 8x8 tiles. Usually, the tileset width is 16 tiles = 128 pixels
4. Note that custom animations and colors won't work as expected since your tiles aren't monochrome anymore.

*/

//!CONFIG hide-color-tools (tag)

//! CODE_EDITOR
wrap.replace(BipsiEditor.prototype, "redrawTileBrowser", async function() {
    const { data, tileset, bg, fg } = this.getSelections();

    const tilesetC = tileset; //recolorMask(tileset, fg, TEMP_TILESET0);

    // draw tileset frame
    const cols = 16;
    const rows = Math.max(1, Math.ceil(data.tiles.length / cols));
    const width = cols * TILE_PX;
    const height = rows * TILE_PX;

    const frame0 = createRendering2D(width, height);
    const frame1 = createRendering2D(width, height);

    function renderTileset(destination, frame) {
        data.tiles.forEach(({ frames }, i) => {
            const index = frames[frame] ?? frames[0];

            const tx = i % cols;
            const ty = Math.floor(i / cols);

            const { x, y, size } = getTileCoords(tilesetC.canvas, index);
            destination.drawImage(
                tilesetC.canvas,
                x, y, size, size, 
                tx * size, ty * size, size, size,
            );
        });
    }

    fillRendering2D(frame0);
    fillRendering2D(frame1);

    drawRecolorLayerDynamic(frame0, (back, color, tiles) => {
        fillRendering2D(back, bg === "#000000" ? undefined : bg);
        fillRendering2D(color, fg === "#000000" ? undefined : fg);
        renderTileset(tiles, 0);
    });

    drawRecolorLayerDynamic(frame1, (back, color, tiles) => {
        fillRendering2D(back, bg === "#000000" ? undefined : bg);
        fillRendering2D(color, fg === "#000000" ? undefined : fg);
        renderTileset(tiles, 1);
    });

    // regenerate tileset uris
    const canvases = [frame0.canvas, frame1.canvas];
    const prev = [...this.tilesetDataURIs];
    const blobs = await Promise.all(canvases.map(canvasToBlob));
    const uris = blobs.map(URL.createObjectURL);
    await Promise.all(uris.map(loadImage)).then(() => {
        this.tilesetDataURIs = uris;

        this.tileBrowser.setURIs(uris, canvases);
        this.eventTileBrowser.setURIs(uris, canvases);

        prev.map(URL.revokeObjectURL);
    });


    if (this.tileBrowser.select.selectedIndex === -1) {
        this.tileBrowser.select.selectedIndex = 0;
    }

    if (this.pendingTileSelect) {
        this.tileBrowser.selectedTileIndex = this.pendingTileSelect;
        delete this.pendingTileSelect;
    }
});

wrap.replace(TileEditor.prototype, "redraw", function() {
    const { tileset, tile, bg, fg } = this.editor.getSelections();
    if (!tile) return;

    this.editor.tileEditor.animateToggle.setCheckedSilent(tile.frames.length > 1);
    this.editor.actions.swapTileFrames.disabled = tile.frames.length === 1;
    this.editor.renderings.tilePaint1.canvas.style.opacity = tile.frames.length === 1 ? "0%" : null;

    const tilesetC = tileset;

    [this.editor.renderings.tilePaint0, this.editor.renderings.tilePaint1].forEach((rendering, i) => {
        fillRendering2D(rendering);

        const frameIndex = tile.frames[i] ?? tile.frames[0];
        const { x, y } = getTileCoords(tileset.canvas, frameIndex);
        rendering.globalCompositeOperation = "source-over"; 
        rendering.drawImage(
            tilesetC.canvas,
            x, y, TILE_PX, TILE_PX,
            0, 0, TILE_PX * TILE_ZOOM, TILE_PX * TILE_ZOOM,
        );

        rendering.globalAlpha = .25;
        rendering.drawImage(TILE_GRID.canvas, 0, 0);
        rendering.globalAlpha = 1;
    });
});

ONE("#tile-paint-row").style = "pointer-events: none; cursor: not-allowed; opacity: .75";

if (IS_TAGGED(CONFIG, "hide-color-tools")) {
	ONE("[name=room-paint-tool][value=color]").parentElement.hidden = true;
	ONE("[name=show-palette-window]").parentElement.hidden = true;
	ONE("[name=show-color-window]").parentElement.hidden = true;

	wrap.splice(window, "drawRoomThumbnail", function (original, rendering, palette, room) {
		palette = { colors: ["transparent", "#000000", "#AAAAAA", "#FF00FF", "#000000", "#000000", "#000000", "#000000"] };
		original(rendering, palette, room);
	});
}

//! CODE_ALL_TYPES
wrap.replace(window, "drawRecolorLayer", function (destination, render) {
	fillRendering2D(BACKG_PAGE);
	fillRendering2D(COLOR_PAGE);
	fillRendering2D(TILES_PAGE);

	render(BACKG_PAGE, COLOR_PAGE, TILES_PAGE);
    destination.drawImage(TILES_PAGE.canvas, 0, 0);
});

wrap.replace(window, "drawRecolorLayerDynamic", function (destination, render) {
	const { width, height } = destination.canvas;
	resizeRendering2D(BACKG_PAGE_D, width, height);
	resizeRendering2D(COLOR_PAGE_D, width, height);
	resizeRendering2D(TILES_PAGE_D, width, height);

	fillRendering2D(BACKG_PAGE_D);
	fillRendering2D(COLOR_PAGE_D);
	fillRendering2D(TILES_PAGE_D);

	render(BACKG_PAGE_D, COLOR_PAGE_D, TILES_PAGE_D);
    destination.drawImage(TILES_PAGE_D.canvas, 0, 0); //+++ JSM
});

//! CODE_PLAYBACK