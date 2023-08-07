/**
🖼
@file dialogue portraits
@summary Add character portraits to dialogues
@license MIT
@author Violgamba (Jon Heard)
@version 4.6.1


@description
Add character portraits to be drawn above the dialogue panel.
A portrait can be:
  - one of the game's tiles (scaled up)
  - an image stored in an event's "file" field
  - multiple images stored in an event's "file" fields (for animation).
Allows for picking a portrait's colors from any in the current palette.
Allows for flipping a portrait and placing on the right-side of the dialogue panel.

HOW TO USE - A TILE AS A PORTRAIT:
1. Import plugin in bipsi
2. Pick a tile for a portrait.  Hover over the tile and note its id, as given by the tooltip.
3. Pick an event's "say" field.  Prepend the field with "@@X@@", replacing X with the id of the tile
   that was picked in step 2.
4. Run the game and touch the event that was picked on step 3.  Note the new portrait graphic.

HOW TO USE - AN IMAGE FILE AS A PORTRAIT:
1. Import plugin in bipsi
2. Add a "file" field to one of your events and load it with the image to be used as a portrait.
3. Give the "file" field (from step 2) a unique name.  Example: "smile".
4. Add a uniquely identifying tag to the event containing the image file.  Example: "cat".
5. Pick an event's "say" field.  Prepend the field with "@@X@@", replacing X with the following:
   1) the uniquely identifying tag entered in step 4
   2) a dash
   3) the name of the "file" field entered in step 3.
   Example: "@@cat-smile@@".
6. Note: if you're using the same event for all of these steps, you can omit the uniquely
   identifying tag and dash in the text entry of step 5.  You can omit step 4 as well.
   Example: "@@smile@@" works the same as "@@cat-smile@@", when working with a single event.
7. Run the game and touch the event that was picked on step 5.  Note the new portrait graphic.

HOW TO USE - MULTIPLE IMAGE FILES AS AN ANIMATED PORTRAIT:
1. Import plugin in bipsi
2. Add a "file" field to one of your events and load it with the image to be used as a portrait.
3. Give the "file" field (from step 2) a unique name, followed by "1".  Example: "smile1".
4. Repeat step 2 for the rest of the images in the animation.  Give each the same name as in step
   3, but with incrementing numbers at the end.  Example: "smile2", "smile3", "smile4".
5. Add a uniquely identifying tag to the event containing the image file.  Example: "cat".
6. Pick an event's "say" field.  Prepend the field with "@@X@@", replacing X with:
   1) the uniquely identifying tag entered in step 5
   2) a dash
   3) the name of the "file" field entered in step 3, but without the ending "1".
   Example: "@@cat-smile@@".
7. Note: if you're using the same event for all of these steps, you can omit the uniquely
   identifying tag and dash in the text entry of step 6.  You can omit step 5 as well.
   Example: "@@smile@@" works the same as "@@cat-smile@@", when working with a single event.
8. Run the game and touch the event that was picked on step 6.  Note the new portrait graphic.

OPTIONAL PARAMETERS
In the "HOW TO USE" instructions above, the "@@X@@" requires that "X" be specified.  There are other
OPTIONAL parameters available for "@@".  The full format is "@@X,S,F,B,O@@":
X - Which tile/image to use: an id number for a tile or an <event>-<field> id for an image.
S - Which side of the screen the portrait is drawn to (0 = left, 1 = right)
F - The foreground color used for a tile portrait.  This is an index into the current palette (1-7).
    This defaults to the foreground color of the touched tile, or 3.  0 is transparent.
B - The background color used for a tile portrait.  This is an index into the current palette (1-7).
    This defaults to the background color of the touched tile, or 1.  0 is transparent.
O - The border color used for a tile OR image portrait.  This is an index into the current palette
    (1-7).  This defaults to the ui dialogue's back color.  0, will use that default.

// The portrait's size
//!CONFIG scale (text) "4"

// The portrait's distance from the dialogue UI's edges
//!CONFIG margin (text) "2"

// Which side of the screen the portrait is drawn to (unless specified in the dialogue text).
//!CONFIG default-side (text) "0"

// What color to use as the portrait's border.  If 0, the dialogue-ui's back color is used.
//!CONFIG default-border-palette-color (text) "0"
*/
(function () {
'use strict';



const EMPTY_CHAR_CODE = 1;
const EMPTY_CHAR = String.fromCharCode(EMPTY_CHAR_CODE);

if (window.portraitVars) {
	console.error('portraitVars over-defined.  Suggests multiple copies of the same plugin.');
}
const portraitVars = {
	currentPortraitData: { type: null },
	currentPageHasPortrait: false,
	currentSide: 0,
	currentFgColorIndex: 3,
	currentBgColorIndex: 1,
	currentBorderColorIndex: 0,
	currentEvent: null,
};
window.portraitVars = portraitVars;
portraitVars.TINT_CANVAS = document.createElement('canvas');
portraitVars.TINT_CANVAS.width = 8;
portraitVars.TINT_CANVAS.height = 8;
portraitVars.TINT_CANVAS_CONTEXT = portraitVars.TINT_CANVAS.getContext('2d');

portraitVars.MARGIN = parseInt(FIELD(CONFIG, 'margin', 'text'), 10) || 2;
portraitVars.SCALE = parseInt(FIELD(CONFIG, 'scale', 'text'), 10) || 4;
portraitVars.DEFAULT_BORDER_PALETTE_COLOR = parseInt(FIELD(CONFIG, 'default-border-palette-color', 'text'), 10) || 0;
if (portraitVars.DEFAULT_BORDER_PALETTE_COLOR < 0 || portraitVars.DEFAULT_BORDER_PALETTE_COLOR > 7) {
	portraitVars.DEFAULT_BORDER_PALETTE_COLOR = 0;
}
portraitVars.DEFAULT_SIDE = parseInt(FIELD(CONFIG, 'default-side', 'text'), 10);
if (portraitVars.DEFAULT_SIDE !== 0 && portraitVars.DEFAULT_SIDE !== 1) {
	portraitVars.DEFAULT_SIDE = 0;
}

// Keep track of which event is running the current js code
wrap.before(BipsiPlayback.prototype, 'runJS', (event, js, debug) => {
	if (window.PLAYBACK) {
		window.PLAYBACK.jsSourceEvent = event;
	}
});

// #region PROCESS TEXT FOR PORTRAIT IDS

// Add a zero-width character to the font so we can use it for characterless styles (like "portrait")
function addEmptyCharToFont(font) {
	if (!font.characters.has(1)) {
		font.characters.set(1, { codepoint: EMPTY_CHAR_CODE, rect: { x: 0, y: 0, width: 0, height: 0 }, spacing: 0, image: font.characters.get(0).image });
	}
}
wrap.splice(DialoguePlayback.prototype, 'queue', function queuePortrait(original, script, options) {
	// Make sure the font includes a zero-width character
	addEmptyCharToFont(this.getOptions(options).font);
	// Dialogue has no portrait by default
	portraitVars.currentPortraitData.type = null;
	portraitVars.currentPageHasPortrait = false;
	// Parse custom markup
	script = portraitFakedownToTag(script);
	// Original logic
	return original.call(this, script, options);
});

// React to each "portrait" style in the dialogue text by setting up its portrait to be rendered
wrap.before(DialoguePlayback.prototype, 'applyStyle', () => {
	// Portrait logic
	window.PLAYBACK.dialoguePlayback.currentPage.glyphs.forEach((glyph, i) => {
		if (!glyph.hidden && glyph.styles.has('portrait')) {
			const args = glyph.styles.get('portrait').split(',');
			let portraitId = parseInt(args[0], 10) || args[0];
			portraitVars.currentSide = parseInt(args[1], 10);
			portraitVars.currentFgColorIndex = parseInt(args[2], 10);
			portraitVars.currentBgColorIndex = parseInt(args[3], 10);
			portraitVars.currentBorderColorIndex = parseInt(args[4], 10);
			// Use the portraited event's colors as defaults.
			const eventColors = FIELD(window.PLAYBACK.jsSourceEvent, 'colors', 'colors') || { fg: 3, bg: 1 };
			if ((!portraitId && portraitId !== 0) || portraitId < -1) {
				portraitId = null; // No portrait shown
			}
			if (portraitVars.currentSide !== 0 && portraitVars.currentSide !== 1) {
				portraitVars.currentSide = portraitVars.DEFAULT_SIDE;
			}
			if ((!portraitVars.currentFgColorIndex && portraitVars.currentFgColorIndex !== 0) || portraitVars.currentFgColorIndex < 0 || portraitVars.currentFgColorIndex > 7) {
				portraitVars.currentFgColorIndex = eventColors.fg;
			}
			if ((!portraitVars.currentBgColorIndex && portraitVars.currentBgColorIndex !== 0) || portraitVars.currentBgColorIndex < 0 || portraitVars.currentBgColorIndex > 7) {
				portraitVars.currentBgColorIndex = eventColors.bg;
			}
			if ((!portraitVars.currentBorderColorIndex && portraitVars.currentBorderColorIndex !== 0) || portraitVars.currentBorderColorIndex < 0 || portraitVars.currentBorderColorIndex > 7) {
				portraitVars.currentBorderColorIndex = portraitVars.DEFAULT_BORDER_PALETTE_COLOR;
			}

			// Work out the portrait info to be rendered
			gatherPortraitData(portraitId);
			glyph.styles.delete('portrait');
		}
	});
});

function shallowArrayEquals(a, b) {
	return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}

function gatherPortraitData(portraitId) {
	portraitVars.currentPortraitData.type = null;
	if (portraitId === -1 || (!portraitId && portraitId !== 0)) ; else if (typeof portraitId === 'number') {
		// Setup portrait from tile
		if (portraitId === portraitVars.currentPortraitData.tileId) {
			// Avoid re-loading the same tile consecutively
			portraitVars.currentPortraitData.type = 'tile';
			return;
		}
		const tile = window.PLAYBACK.data.tiles.find(i => i.id === portraitId);
		if (!tile) {
			return;
		}
		portraitVars.currentPortraitData.type = 'tile';
		portraitVars.currentPortraitData.frameIds = tile.frames;
		portraitVars.currentPortraitData.tileId = portraitId;
	} else {
		// Setup portrait from image
		const portraitIdParts = portraitId.split('-');
		const srcEvent = portraitIdParts.length === 1 ? window.PLAYBACK.jsSourceEvent : window.findEventByTag(window.PLAYBACK.data, portraitIdParts[0]);
		if (!srcEvent) {
			return;
		}
		// To support framed animations, try the field-id with a suffix of "1"
		// eslint-disable-next-line prefer-template
		const srcFields = [window.oneField(srcEvent, portraitIdParts[portraitIdParts.length - 1] + '1', 'file')];
		if (!srcFields[0]) {
			// If suffix of "1" didn't work, try the field-id with no extra suffix
			srcFields[0] = window.oneField(srcEvent, portraitIdParts[portraitIdParts.length - 1], 'file');
		} else {
			// Suffix of "1" worked!  Keep loading consecutive suffixes until we hit null
			let suffix = '2';
			let nextSrcField = window.oneField(srcEvent, portraitIdParts[portraitIdParts.length - 1] + suffix, 'file');
			while (nextSrcField) {
				srcFields.push(nextSrcField);
				suffix++;
				nextSrcField = window.oneField(srcEvent, portraitIdParts[portraitIdParts.length - 1] + suffix, 'file');
			}
		}
		if (!srcFields[0]) {
			return;
		}
		// Avoid re-loading the same image consecutively
		if (
			shallowArrayEquals(
				srcFields.map(x => x.data),
				portraitVars.currentPortraitData.imageResourceIds
			)
		) {
			portraitVars.currentPortraitData.type = 'image';
			return;
		}
		// Setup image objects
		portraitVars.currentPortraitData.images ||= [];
		for (let i = portraitVars.currentPortraitData.images.length; i < srcFields.length; i++) {
			portraitVars.currentPortraitData.images[i] = new Image();
		}
		// Make sure all images are clear (to avoid any flicker from prior dialogue)
		portraitVars.currentPortraitData.images.forEach(x => {
			x.src = null;
		});
		// Setup non-image portrait data (image part is setup above)
		portraitVars.currentPortraitData.type = 'image';
		portraitVars.currentPortraitData.imageResourceIds = srcFields.map(x => x.data);
		portraitVars.currentPortraitData.frameCount = srcFields.length;

		// Load the images from files into the portrait data
		const srcFiles = srcFields.map(x => {
			const resource = window.PLAYBACK.stateManager.resources.resources.get(x.data);
			return resource ? resource.instance : null;
		});
		srcFiles.forEach((x, i) => {
			if (!x) {
				return;
			}
			const reader = new FileReader();
			reader.onload = () => {
				portraitVars.currentPortraitData.images[i].src = reader.result;
			};
			reader.readAsDataURL(x);
		});
	}
}

// Handle each portrait markup by turning it into a portrait-styled zero-width character
function portraitFakedownToTag(text) {
	// Make sure the "@@"s are properly paired
	if ((text.match(/@@/g) ?? []).length % 2 !== 0) {
		return text;
	}

	// Swap each "@@" pair with a portrait style and attach it to a zero-width character
	let start = text.indexOf('@@');
	let end = 0;
	while (start !== -1) {
		end = text.indexOf('@@', start + 1);
		text = `${text.slice(0, start)}{portrait=${text.slice(start + 2, end)}}${EMPTY_CHAR}{-portrait}${text.slice(end + 2)}`;
		portraitVars.currentPageHasPortrait = true;
		start = text.indexOf('@@');
	}

	return text;
}
// #endregion

// #region DRAW PORTRAIT
wrap.splice(DialoguePlayback.prototype, 'render', original => {
	const { dialoguePlayback } = window.PLAYBACK;

	// No portrait? do original logic only
	if (!portraitVars.currentPageHasPortrait) {
		original.call(dialoguePlayback);
		return;
	}

	// Move a top-dialogue to the bottom, since we're adding a portrait above it
	if (dialoguePlayback.options.anchorY === 0) {
		dialoguePlayback.options.anchorY = 1;
	}

	// Original logic
	original.call(dialoguePlayback);

	// Portrait not shown yet?  early out.
	if (!portraitVars.currentPortraitData.type) {
		return;
	}

	// Determine dialogue UI's Y position (this is a recalculation of what's in original logic)
	const options = dialoguePlayback.getOptions(dialoguePlayback.currentPage.options);
	const height = options.padding * 2 + (options.font.lineHeight + options.lineGap) * options.lines;
	const width = 208;
	const { width: displayWidth, height: displayHeight } = dialoguePlayback.dialogueRendering.canvas;
	const spaceX = displayWidth - width;
	const spaceY = displayHeight - height;
	const margin = options.noMargin ? 0 : Math.ceil(Math.min(spaceX, spaceY) / 2);
	const minX = margin;
	const maxX = displayWidth - margin;
	const minY = margin;
	const maxY = displayHeight - margin;
	const dialogueUiY = Math.floor(minY + (maxY - minY - height) * options.anchorY);

	// Determine where to draw the portrait AND with what colors
	const portraitSize = (portraitVars.currentPortraitData.type === 'tile' ? 12 : 10) * portraitVars.SCALE;
	const portraitLoc = [];
	portraitLoc[0] = portraitVars.currentSide === 0 ? minX + portraitVars.MARGIN : maxX - portraitVars.MARGIN - portraitSize;
	portraitLoc[1] = dialogueUiY - portraitVars.MARGIN - portraitSize;
	const palette = window.PLAYBACK.getActivePalette();
	const borderColor = portraitVars.currentBorderColorIndex === 0 ? options.panelColor : palette.colors[portraitVars.currentBorderColorIndex];

	// Draw a panel border
	dialoguePlayback.dialogueRendering.fillStyle = borderColor;
	dialoguePlayback.dialogueRendering.fillRect(portraitLoc[0], portraitLoc[1], portraitSize, portraitSize);

	// Draw the portrait from a tile
	if (portraitVars.currentPortraitData.type === 'tile') {
		// Draw a background rectangle behind the portrait
		if (portraitVars.currentBgColorIndex > 0) {
			dialoguePlayback.dialogueRendering.fillStyle = palette.colors[portraitVars.currentBgColorIndex];
			dialoguePlayback.dialogueRendering.fillRect(
				portraitLoc[0] + 1 * portraitVars.SCALE,
				portraitLoc[1] + 1 * portraitVars.SCALE,
				portraitSize - 2 * portraitVars.SCALE,
				portraitSize - 2 * portraitVars.SCALE
			);
		}

		// Draw the portrait
		if (portraitVars.currentFgColorIndex > 0) {
			// Draw the portrait from frame-canvas to tint-canvas (flipped if necessary)
			const frameCanvas = window.PLAYBACK.stateManager.resources.get(window.PLAYBACK.data.tileset).canvas;
			const frameIndex = window.PLAYBACK.frameCount % portraitVars.currentPortraitData.frameIds.length;
			const frameId = portraitVars.currentPortraitData.frameIds[frameIndex];
			portraitVars.TINT_CANVAS_CONTEXT.globalCompositeOperation = 'source-over';
			portraitVars.TINT_CANVAS_CONTEXT.fillStyle = palette.colors[portraitVars.currentFgColorIndex];
			portraitVars.TINT_CANVAS_CONTEXT.fillRect(0, 0, portraitVars.TINT_CANVAS.width, portraitVars.TINT_CANVAS.height);
			portraitVars.TINT_CANVAS_CONTEXT.globalCompositeOperation = 'destination-atop';
			if (portraitVars.currentSide === 1) {
				portraitVars.TINT_CANVAS_CONTEXT.scale(-1, 1);
				portraitVars.TINT_CANVAS_CONTEXT.drawImage(frameCanvas, (frameId % 16) * 8, Math.trunc(frameId / 16) * 8, 8, 8, 0, 0, -8, 8);
				portraitVars.TINT_CANVAS_CONTEXT.scale(-1, 1);
			} else {
				portraitVars.TINT_CANVAS_CONTEXT.drawImage(frameCanvas, (frameId % 16) * 8, Math.trunc(frameId / 16) * 8, 8, 8, 0, 0, 8, 8);
			}

			// Draw the portrait from tint-canvas to screen
			dialoguePlayback.dialogueRendering.drawImage(
				portraitVars.TINT_CANVAS,
				0,
				0,
				8,
				8,
				portraitLoc[0] + 2 * portraitVars.SCALE,
				portraitLoc[1] + 2 * portraitVars.SCALE,
				portraitSize - 4 * portraitVars.SCALE,
				portraitSize - 4 * portraitVars.SCALE
			);
		}
	}
	// Draw the portrait from a picture file
	else if (portraitVars.currentPortraitData.type === 'image') {
		const frameIndex = window.PLAYBACK.frameCount % portraitVars.currentPortraitData.frameCount;
		dialoguePlayback.dialogueRendering.drawImage(
			portraitVars.currentPortraitData.images[frameIndex],
			portraitLoc[0] + 1 * portraitVars.SCALE,
			portraitLoc[1] + 1 * portraitVars.SCALE,
			portraitSize - 2 * portraitVars.SCALE,
			portraitSize - 2 * portraitVars.SCALE
		);
	}
});
// #endregion

})();
