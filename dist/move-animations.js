/**
👣
@file move animations
@summary ANY event can specify a tile for each direction and tiles for moving vs not moving.
@license MIT
@author Violgamba (Jon Heard)
@version 4.12.0



@description
ANY event (including the avatar) can specify a tile for each direction and tiles for moving vs not moving.


HOW TO USE - BASIC FOR THE AVATAR:
1. Import this plugin into your game.
2. Draw 4 tiles for the avatar.  One for each directions (up, left, right, down).
3. Add the following tile fields to the avatar event and set them to the tiles from step 2:
  "graphic-up" - the tile field used for the UP DIRECTION
  "graphic-left" - the tile field used for the LEFT DIRECTION
  "graphic-right" - the tile field used for the RIGHT DIRECTION
  "graphic" - the tile field used for the DOWN DIRECTION
  NOTE - "DOWN DIRECTION" uses the generic "graphic" field, instead of a custom field.
  NOTE - Any fields default to the "graphic" field if unspecified (or are not rendered, if no
    "graphic" field).
4. Playtest the game.  Move the avatar about.  Note that the tile changes when moving in different
   directions.


HOW TO USE - BASIC FOR ANY EVENT:
1. Import this plugin into your game.
2. Pick an event to setup for this "move-animation" plugin.  The avatar event is a valid choice.
3. Draw 4 tiles for the event (of step 2).  One for each direction (up, left, right, down).
4. Add the following fields to the event of step 2:
  "graphic-up" - the tile field used for the UP DIRECTION
  "graphic-left" - the tile field used for the LEFT DIRECTION
  "graphic-right" - the tile field used for the RIGHT DIRECTION
  "graphic" - the tile field used for the DOWN DIRECTION
  NOTE - "DOWN DIRECTION" uses the generic "graphic" field, instead of a custom field.
  NOTE - Any fields default to the "graphic" field if unspecified (or are not rendered, if no
    "graphic" field).
5. Setup a readily triggerable javascript field ("before", "after" or "touch").  Add a call to
   WALK() to move the event of step 2 in different directions.
6. Playtest the game and trigger the javascript field of step 5.  Note that the event's tile changes
   when moving in different directions.


ADDING THE SMOOTH-MOVE PLUGIN

When combined with the "smooth-moves" plugin, "move-animations" lets you specify tiles for moving vs
not moving.  This adds a few different ways to setup an event.

NOTE - For this plugin to combine with the smooth-move plugin, it needs to come AFTER it.  To be
sure that this happens, set the "plugin-order" field of the "move-animations" plugin's event to a
value that is higher than the "plugin-order" field of the "smooth-move" plugin's event.


HOW TO USE - A SIMPLE SMOOTH-MOVE SETUP:
Follow the instructions from the "HOW TO USE" for either "BASIC FOR THE AVATAR" or "BASIC FOR ANY
EVENT" with the following changes:
- Before starting, import the "smooth-move" into your game.
- After importing the "move-animations" plugin, set the "plugin-order" field of its event to 1.
- When drawing tiles, draw a tile for MOVING and a tile for NOT MOVING.
- When adding tile fields, add the following fields.
  - "graphic-move" - the tile field used when MOVING FROM TILE TO TILE.
  - "graphic" - the tile field used for NOT MOVING.
  NOTE - "NOT MOVING" uses the generic "graphic" field, instead of a custom field.
  NOTE - The "graphic-move" field defaults to the "graphic" field if unspecified (or is not
    rendered, if no "graphic" field).
- When playtesting, note that the event changes tile when moving vs not moving.


HOW TO USE - AN ADVANCED SMOOTH-MOVE SETUP
Follow the instructions from the "HOW TO USE" for either "BASIC FOR THE AVATAR" or "BASIC FOR ANY
EVENT" with the following changes:
- Before starting, import the "smooth-move" into your game.
- After importing the "move-animations" plugin, set the "plugin-order" field of its event to 1.
- When drawing tiles, draw 8 TILES: a tile for MOVING and a tile for NOT MOVING in each directions
  (up, left, right, down).
- When adding tile fields, add the following fields.
  - "graphic-up" - the tile field used for FACING UP (i.e. not moving).
  - "graphic-left" - the tile field used for FACING LEFT (i.e. not moving).
  - "graphic-right" - the tile field used for FACING RIGHT (i.e. not moving).
  - "graphic" - the tile field used for FACING DOWN (i.e. not moving).
  - "graphic-up-move" - the tile field used for MOVING UP.
  - "graphic-left-move" - the tile field used for MOVING LEFT.
  - "graphic-right-move" - the tile field used for MOVING RIGHT.
  - "graphic-down-move" - the tile field used for MOVING DOWN
  NOTE - "FACING DOWN" uses the generic "graphic" field, instead of a custom field.
  NOTE - The "graphic-*-move" fields default to "graphic-*" if unspecified.  "graphic-* fields
    default to the "graphic" field if unspecified (or is not rendered, if no "graphic" field).
- When playtesting, note that the event changes tile when moving vs not moving as well as for
    different directions.
*/
(function () {
'use strict';



// NOTE - The HOW TOs describe "NOT MOVING DOWN" as using the generic "graphic" field.  It actually
// uses the "graphic-down" field, but specifying the "graphic" field instead forces "graphic-down"
// to fall-back to it's default: the "graphic" field.  This is useful as it makes the event show
// this tile until the first time it moves.
const USED_TILE_FIELDS = ['graphic-up', 'graphic-left', 'graphic-right', 'graphic-down'];
const USED_TILE_FIELDS_ALTS = [];
let TILE_SWAP_DELAY = 0;

// the "smooth-move" plugin creates "BipsiPlayback.updateEventsMoveState()" if imported. If so,
// setup "move-animations" for it.  If not, create it here along with it's callers.
if (BipsiPlayback.prototype.updateEventsMoveState) {
	// Setup "move-animations" to combine with "smooth move"
	USED_TILE_FIELDS.push(...['graphic-up-move', 'graphic-left-move', 'graphic-right-move', 'graphic-down-move']);
	USED_TILE_FIELDS_ALTS.push(...['graphic-move', 'graphic-idle']);
	TILE_SWAP_DELAY = 1;
} else {
	// Create "BipsiPlayback.updateEventsMoveState()" and it's callers.
	BipsiPlayback.prototype.updateEventsMoveState = function updateEventsMoveState(event, isMoving, dx, dy) {
		event.isMoving = isMoving;
		if (dx !== undefined) {
			if (dx > 0) {
				event.facing = 'right';
			} else if (dx < 0) {
				event.facing = 'left';
			} else if (dy < 0) {
				event.facing = 'up';
			} else {
				event.facing = 'down';
			}
		}
	};
	wrap.before(BipsiPlayback.prototype, 'move', function move(dx, dy) {
		this.updateEventsMoveState(window.getEventById(this.data, this.avatarId), false, dx, dy);
	});
	let walkSrc = SCRIPTING_FUNCTIONS.WALK.toString();
	walkSrc = walkSrc.replace('async WALK', 'SCRIPTING_FUNCTIONS.WALK = async function WALK');
	walkSrc = walkSrc.replaceAll('const [dx, dy] = WALK_DIRECTIONS[dir];', 'const [dx, dy] = WALK_DIRECTIONS[dir];\nwindow.PLAYBACK.updateEventsMoveState(event, false, dx, dy);');
	new Function(walkSrc)();
}

// Tile changes are delayed to avoid flicker between move & idle tiles while smooth-moving past
// multiple cells.
const pendingGraphicChanges = {};

// This runs each time an event's move-state is changed
wrap.after(BipsiPlayback.prototype, 'updateEventsMoveState', function updateEventsMoveState(event) {
	// Make sure the given event is initialized for smooth-move-animations.
	if (!event.smoothMoveAnimationInitialized) {
		this.initSmoothMoveAnimationForEvent(event);
		event.smoothMoveAnimationInitialized = true;
	}
	// Determine the new graphic.  If same as old, remove any pending changes to this event's graphic.
	let newGraphicName;
	if (event.usesAltTiles) {
		newGraphicName = `graphic${event.isMoving ? '-move' : '-idle'}`;
	} else {
		newGraphicName = `graphic-${event.facing}${event.isMoving ? '-move' : ''}`;
	}
	if (event.currentGraphicName === newGraphicName) {
		delete pendingGraphicChanges[event.id];
		return;
	}
	// Track changing graphics to be updated in a subsequent frame
	pendingGraphicChanges[event.id] = { event, graphicName: newGraphicName, framesLeft: TILE_SWAP_DELAY };
});

// Update pending event graphic changes
wrap.before(BipsiPlayback.prototype, 'render', () => {
	Object.entries(pendingGraphicChanges).forEach(change => {
		if (change[1].framesLeft > 0) {
			change[1].framesLeft--;
			return;
		}
		const tile = FIELD(change[1].event, change[1].graphicName, 'tile');
		window.replaceFields(change[1].event, 'graphic', 'tile', tile);
		change[1].event.currentGraphicName = change[1].graphicName;
		delete pendingGraphicChanges[change[0]];
	});
});

// Assign defaults for any missing move-animation graphic fields for an event.
BipsiPlayback.prototype.initSmoothMoveAnimationForEvent = function initSmoothMoveAnimationForEvent(event) {
	event.usesAltTiles = FIELD(event, USED_TILE_FIELDS_ALTS[0], 'tile');
	const usedFields = event.usesAltTiles ? USED_TILE_FIELDS_ALTS : USED_TILE_FIELDS;
	const graphicTile = FIELD(event, 'graphic', 'tile');
	usedFields.forEach(fieldName => {
		// Field exists (no default)
		if (FIELD(event, fieldName, 'tile')) return;
		// Field is a directional-move.  Default to directional-nonmove.
		const moveTileMatch = fieldName.match(/^graphic-([^-]+)-move$/);
		if (moveTileMatch) {
			const tile = FIELD(event, `graphic-${moveTileMatch[1]}`, 'tile');
			window.replaceFields(event, fieldName, 'tile', tile);
			return;
		}
		// all others default to generic 'graphic' tile field.
		window.replaceFields(event, fieldName, 'tile', graphicTile);
	});
};

})();
