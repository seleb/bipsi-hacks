/**
👣
@file smooth move animations
@summary Define unique walking and idle tiles in each direction for any event.
@license MIT
@author Violgamba (Jon Heard)


@description
Builds on the smooth-move plugin to let you define unique walking and idle tiles in each direction
for any event.  Useful if using bipsi for a more graphically involved game.

NOTE - This plugin requires the smooth-move plugin in order to work.  It also needs to come AFTER
smooth-move, so set it's "plugin-order" to something higher than what the smooth-move plugin's
plugin-order is set to.

This works by letting you define extra tile type fields for different movement states of an event.
None of the extra tile fields are required.  Any missing fields are replaced with logical defaults.
All direction tiles default to the generic "graphic-idle" and "graphic-move" tiles.  Meanwhile, the
"graphic-idle" and "graphic-move" tiles default to the base "graphic" tile.  And if the event has
no "graphic" tile field then the event just won't be visible, as normal.


Here is the full list of the tile fields smooth-move-animations can use:

SMOOTH-MOVE-ANIMATIONS TILE FIELD KEYS:
graphic-idle, graphic-move,
graphic-idle-left, graphic-idle-right, graphic-idle-up, graphic-idle-down,
graphic-move-left, graphic-move-right, graphic-move-up, graphic-move-down

HOW TO USE - BASIC:
1. Import the smooth-move plugin into your game (required).
2. Import this plugin into your game.  Set it's "plugin-order" field to 1.
3. Create a tile to represent your avatar standing still.
4. Create a tile to represent your avatar moving.
5. Add a tile field to your avatar and name it "graphic-idle".  Set the field to the tile of step 3.
6. Add a tile field to your avatar and name it "graphic-move".  Set the field to the tile of step 4.
7. Playtest the game and move the avatar about.  Note that the avatar switches between the tiles
   when moving vs not moving.


HOW TO USE - ADVANCED:
1. Import the smooth-move plugin into your game (required).
2. Import this plugin into your game.  Set it's "plugin-order" field to 1.
3. Create tiles to represent your avatar standing still in all four directions: up, down, left, right.
4. Create tiles to represent your avatar moving in all four directions: up, down, left, right.
5. Add a four tile fields to your avatar and name them "graphic-idle-up", "graphic-idle-down",
   "graphic-idle-left", "graphic-idle-right".  Set each field to the proper tiles of step 3.
6. Add a four tile fields to your avatar and name them "graphic-move-up", "graphic-move-down",
   "graphic-move-left", "graphic-move-right".  Set each field to the proper tiles of step 4.
7. Playtest the game and move the avatar about.  Note that the avatar switches logically between all
   8 tiles.
*/

// Setup default avatar graphic tile fields, based on existing fields.
const GRAPHIC_DEFAULTS = {
	'graphic-move': ['graphic-move-left', 'graphic-move-right', 'graphic-move-up', 'graphic-move-down'],
	'graphic-idle': ['graphic-idle-left', 'graphic-idle-right', 'graphic-idle-up', 'graphic-idle-down'],
};

// All graphic changes are delayed by one frame to avoid flicker between move and idle when
// smooth-moving across multiple cells.
const pendingGraphicChanges = {};

// Assign defaults for any missing smooth-move-animation graphic fields for an event.
// NOTE - Falling back to a non-existant "graphic" field results in non-existant smooth-move-animation graphic fields, which is fine.
BipsiPlayback.prototype.initSmoothMoveAnimationForEvent = function initSmoothMoveAnimationForEvent(event) {
	Object.keys(GRAPHIC_DEFAULTS).forEach(baseName => {
		GRAPHIC_DEFAULTS[baseName].forEach(fieldName => {
			if (FIELD(event, fieldName, 'tile')) return;
			let tile = FIELD(event, baseName, 'tile');
			if (!tile) {
				tile = FIELD(event, 'graphic', 'tile');
			}
			window.replaceFields(event, fieldName, 'tile', tile);
		});
	});
};

// This runs each time an event's move-state is changed by the smooth-move plugin.
wrap.after(BipsiPlayback.prototype, 'updateEventsMoveState', function updateEventsMoveState(event) {
	// Make sure the given event is initialized for smooth-move-animations.
	if (!event.smoothMoveAnimationInitialized) {
		this.initSmoothMoveAnimationForEvent(event);
		event.smoothMoveAnimationInitialized = true;
	}
	// Determine the new graphic.  If same as old, remove any pending changes to this event's graphic.
	const newGraphicName = `graphic-${event.isMoving ? 'move' : 'idle'}-${event.facing}`;
	if (event.currentGraphicName === newGraphicName) {
		delete pendingGraphicChanges[event.id];
		return;
	}
	// Track changing graphics to be updated in a subsequent frame
	pendingGraphicChanges[event.id] = { event, graphicName: newGraphicName, framesLeft: 1 };
});

// Update pending event graphic changes
wrap.after(BipsiPlayback.prototype, 'render', () => {
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
