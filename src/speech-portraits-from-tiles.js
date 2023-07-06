/**
🖼
@file Speech portraits from tiles
@summary Add VN-style portraits to dialogues via tiles
@license MIT
@author Violgamba (Jon Heard)
@version 1.0.0

@description
Visual-novel-style portraits drawn over the speech panel.
A portrait is one of the game's tiles, scaled up.
Allows for picking the portrait's color from the current palette.
Allows for flipping the portrait and placing on the right-side of the speech panel.

HOW TO USE:
1. Import plugin in bipsi
2. Pick a tile for a portrait.  Hover over the tile and note its id, as given by the tooltip.
3. Pick an event's "say" field.  Prepend the field with "@@X@@", replacing X with the id of the tile
   that was picked in step 2.
4. Run the game and touch the event that was picked on step 3.  Note the new portrait graphic.

The "@@X@@" requires that "X" be specified.  There are other OPTIONAL parameters:
The full format - "@@X,S,F,B,O@@"
X - Which tile to use for the portrait.
S - Which side of the screen the portrait is drawn to (0 = left, 1 = right)
F - The foreground color to use for the portrait.  This is an index into the current palette (#1-7).
    This defaults to the foreground color specified by the touched tile, or 3.  0 is transparent.
B - The background color to use for the portrait.  This is an index into the current palette (#1-7).
    This defaults to the background color specified by the touched tile, or 1.  0 is transparent.
O - The border color used around the portrait.  This is an index into the current palette (#1-7).
    This defaults to the ui dialogue's back color.  If 0, will use the default.

// The portrait's size
//!CONFIG scale (text) "5"

// The portrait's y-position
//!CONFIG vertical-offset (text) "190"

// Which side of the screen the portrait is drawn to (unless specified in the dialogue text).
//!CONFIG default-side (text) "0"

// What color to use as the portrait's border.  If 0, the dialogue-ui's back color is used.
//!CONFIG default-border-palette-color (text) "0"

*/

if (window.portraitVars) {
	console.error('portraitVars over-defined.  Suggests multiple copies of the same plugin.');
}
window.portraitVars = {
	currentPortraitId: -1, currentSide: 0, currentFgColorIndex: 3, currentBgColorIndex: 1,
	currentBorderColorIndex: 0, currentEvent: null
};
portraitVars.OFFSET_X_LEFT = 24;
portraitVars.OFFSET_X_RIGHT = 232;
portraitVars.OFFSET_Y = FIELD(CONFIG, 'vertical-offset', 'text') || 190;
portraitVars.TINT_CANVAS = document.createElement('canvas');
portraitVars.TINT_CANVAS.width = 8;
portraitVars.TINT_CANVAS.height = 8;
portraitVars.TINT_CANVAS_CONTEXT = portraitVars.TINT_CANVAS.getContext('2d');
portraitVars.SCALE = parseInt(FIELD(CONFIG, 'scale', 'text')) || 5;
portraitVars.DEFAULT_BORDER_PALETTE_COLOR =
	parseInt(FIELD(CONFIG, 'default-border-palette-color', 'text')) || 0;
if (portraitVars.DEFAULT_BORDER_PALETTE_COLOR <0 || portraitVars.DEFAULT_BORDER_PALETTE_COLOR >7) {
	portraitVars.DEFAULT_BORDER_PALETTE_COLOR = 0;
}
portraitVars.DEFAULT_SIDE = FIELD(CONFIG, 'default-side', 'text');
if (portraitVars.DEFAULT_SIDE != 0 && portraitVars.DEFAULT_SIDE != 1) {
	portraitVars.DEFAULT_SIDE = 0
}

///////////////////////////////////
// TRACK THE CURRENTLY RUN EVENT //
///////////////////////////////////
if (!portraitVars.orig_bipsiPlayback_runJS) {
	portraitVars.orig_bipsiPlayback_runJS = BipsiPlayback.prototype.runJS;
}
BipsiPlayback.prototype.runJS = async function(event, js, debug=false) {
	// Original logic
	portraitVars.orig_bipsiPlayback_runJS.bind(this)(event, js, debug);

	// Portrait logic
	portraitVars.currentEvent = event;
};

///////////////////////////////////
// PROCESS TEXT FOR PORTRAIT IDS //
///////////////////////////////////
if (!portraitVars.orig_parseFakeDown) {
	portraitVars.orig_parseFakeDown = parseFakedown;
}
parseFakedown = function(text) {
	// Original logic
	text = portraitVars.orig_parseFakeDown(text);

	// Portrait logic
	text = portraitVars.portraitFakedownToTag(text);

	return text;
};
if (!portraitVars.orig_dialoguePlayback_applyStyle) {
	portraitVars.orig_dialoguePlayback_applyStyle = DialoguePlayback.prototype.applyStyle;
}
DialoguePlayback.prototype.applyStyle = function() {
	// Original logic
	portraitVars.orig_dialoguePlayback_applyStyle.bind(this)();

	// Portrait logic
	this.currentPage.glyphs.forEach((glyph, i) => {
		if (glyph.styles.has('portrait')) {
			const args = glyph.styles.get('portrait').split(',');
			portraitVars.currentPortraitId = parseInt(args[0])
			portraitVars.currentSide = parseInt(args[1]);
			portraitVars.currentFgColorIndex = parseInt(args[2]);
			portraitVars.currentBgColorIndex = parseInt(args[3]);
			portraitVars.currentBorderColorIndex = parseInt(args[4]);
			// Use the portraited event's colors as defaults.
			const eventColors = FIELD(portraitVars.currentEvent, 'colors', 'colors') || {fg:3,bg:1};
			if ((!portraitVars.currentPortraitId && portraitVars.currentPortraitId != 0) ||
			    portraitVars.currentPortraitId < -1) {
				portraitVars.currentPortraitId = -1; // -1 = NO portrait shown
			}
			if (portraitVars.currentSide != 0 && portraitVars.currentSide != 1) {
				portraitVars.currentSide = portraitVars.DEFAULT_SIDE;
			}
			if ((!portraitVars.currentFgColorIndex && portraitVars.currentFgColorIndex != 0) ||
			    portraitVars.currentFgColorIndex < 0 || portraitVars.currentFgColorIndex > 7) {
				portraitVars.currentFgColorIndex = eventColors.fg;
			}
			if ((!portraitVars.currentBgColorIndex && portraitVars.currentBgColorIndex != 0) ||
			    portraitVars.currentBgColorIndex < 0 || portraitVars.currentBgColorIndex > 7) {
				portraitVars.currentBgColorIndex = eventColors.bg;
			}
			if ((!portraitVars.currentBorderColorIndex && portraitVars.currentBorderColorIndex != 0) ||
			    portraitVars.currentBorderColorIndex < 0 || portraitVars.currentBorderColorIndex > 7) {
				portraitVars.currentBorderColorIndex = portraitVars.DEFAULT_BORDER_PALETTE_COLOR;
			}
		}
	});
};
portraitVars.portraitFakedownToTag = function(text) {
	// Make sure the "@@"s are properly paired
	if ((text.match(/@@/g) ?? []).length % 2 != 0) {
		return text;
	}

	// Swap each "@@" pair with a portrait style (to attach to the next character)
	let start = text.indexOf('@@');
	let end = 0;
	while (start != -1) {
		end = text.indexOf('@@', start+1);
		text =
			text.slice(0, start) + '{portrait=' + text.slice(start+2, end) + '}' +
			text.slice(end+2, end+3) + '{-portrait}' + text.slice(end+3);
		start = text.indexOf('@@');
	}

	// If the first character does not already have a portrait style, add a NON-portrait style.
	if (!text.startsWith('{portrait=')) {
		text = '{portrait=-1}' + text[0] + '{-portrait}' + text.slice(1);
	}

	return text;
};

///////////////////
// DRAW PORTRAIT //
///////////////////
if (!portraitVars.orig_dialoguePlayback_render) {
	portraitVars.orig_dialoguePlayback_render = DialoguePlayback.prototype.render;
}
DialoguePlayback.prototype.render = function() {
	// No portrait? do original logic only
	if (portraitVars.currentPortraitId < 0) {
		portraitVars.orig_dialoguePlayback_render.bind(this)();
		return;
	}

	// Always show dialogue at bottom
	this.options.anchorY = 1;

	// Original logic
	portraitVars.orig_dialoguePlayback_render.bind(this)();

	// Determine where to draw the portrait AND with what colors
	const portraitLoc = [
		portraitVars.currentSide == 1 ?
			(portraitVars.OFFSET_X_RIGHT - 12 * portraitVars.SCALE) :
			(portraitVars.OFFSET_X_LEFT),
		(portraitVars.OFFSET_Y - 12 * portraitVars.SCALE)
	];
	const options = this.getOptions(this.currentPage.options);
	const palette = PLAYBACK.getActivePalette();
	const borderColor =
		portraitVars.currentBorderColorIndex == 0 ?
		options.panelColor :
		palette.colors[portraitVars.currentBorderColorIndex];

	// Draw a panel border
	this.dialogueRendering.fillStyle = borderColor;
	this.dialogueRendering.fillRect(
		portraitLoc[0] + 0 * portraitVars.SCALE, portraitLoc[1] + 0 * portraitVars.SCALE,
		12 * portraitVars.SCALE, 12 * portraitVars.SCALE);

	// Draw a background rectangle behind the portrait
	if (portraitVars.currentBgColorIndex > 0)
	{
		this.dialogueRendering.fillStyle = palette.colors[portraitVars.currentBgColorIndex];
		this.dialogueRendering.fillRect(
			portraitLoc[0] + 1 * portraitVars.SCALE, portraitLoc[1] + 1 * portraitVars.SCALE,
			10 * portraitVars.SCALE, 10 * portraitVars.SCALE);
	}

	// Draw the portrait
	if (portraitVars.currentFgColorIndex > 0)
	{
		// Draw the portrait from frame-canvas to tint-canvas (flipped if necessary)
		const frameCanvas = PLAYBACK.stateManager.resources.get(PLAYBACK.data.tileset).canvas;
		const tileFrameIds = PLAYBACK.data.tiles[portraitVars.currentPortraitId - 1].frames;
		const animationStep = PLAYBACK.frameCount % tileFrameIds.length;
		const frameId = tileFrameIds[animationStep];
		portraitVars.TINT_CANVAS_CONTEXT.globalCompositeOperation = 'source-over';
		portraitVars.TINT_CANVAS_CONTEXT.fillStyle =
			palette.colors[portraitVars.currentFgColorIndex];
		portraitVars.TINT_CANVAS_CONTEXT.fillRect(
			0, 0, portraitVars.TINT_CANVAS.width, portraitVars.TINT_CANVAS.height);
		portraitVars.TINT_CANVAS_CONTEXT.globalCompositeOperation = 'destination-atop';
		if (portraitVars.currentSide == 1) {
			portraitVars.TINT_CANVAS_CONTEXT.scale(-1, 1);
			portraitVars.TINT_CANVAS_CONTEXT.drawImage(frameCanvas, frameId*8,0,8,8, 0,0,-8,8);
			portraitVars.TINT_CANVAS_CONTEXT.scale(-1, 1);
		} else {
			portraitVars.TINT_CANVAS_CONTEXT.drawImage(frameCanvas, frameId*8,0,8,8, 0,0,8,8);
		}

		// Draw the portrait from tint-canvas to screen
		this.dialogueRendering.drawImage(
			portraitVars.TINT_CANVAS, 0, 0, 8, 8,
			portraitLoc[0] + 2 * portraitVars.SCALE, portraitLoc[1] + 2 * portraitVars.SCALE,
			8 * portraitVars.SCALE,  8  * portraitVars.SCALE);
	}
};
