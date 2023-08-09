/**
👣
@file smooth move
@summary Add smooth movement to the avatar and to walking events.
@license MIT
@author Violgamba (Jon Heard)

@description
Add smooth movement to the avatar and to walking events.  The speed is a settable plugin parameter
and defaults to as near as I could measure to the same speed as the original, non-smoothed movement.


HOW TO USE:
1. Import this plugin into your game.
2. Playtest the game.  Note that the avatar movement is now smooth between cells.
3. Add a "walk" command to an event such that you can easily trigger it in the game.
4. Playtest the game and trigger the "walk" command of step 3.  Note that the walking event's
   movement is now smooth between cells.


// The time it takes the avatar to move one complete map-cell
//!CONFIG avatar-move-rate (json) 190

// The time it takes a walking event to move one complete map-cell
//!CONFIG event-move-rate (json) 400
*/

const AVATAR_MOVE_RATE = FIELD(CONFIG, 'avatar-move-rate', 'json') || 190;
const EVENT_MOVE_RATE = FIELD(CONFIG, 'event-move-rate', 'json') || 400;

// Lerp a 2-element array
function coordinateLerp(startCoords, endCoords, phase) {
	return [startCoords[0] * (1 - phase) + endCoords[0] * phase, startCoords[1] * (1 - phase) + endCoords[1] * phase];
}

// Round coordinates to pixel-aligned position.  Since coordinates are tile-based, pixels-alignment
// is at multiples of 1/pixels-per-tile.
function snapCoordsToPixels(coords) {
	return [Math.round(coords[0] * TILE_PX) / TILE_PX, Math.round(coords[1] * TILE_PX) / TILE_PX];
}

// Collection of currently running smooth-moves
const activeSmoothMoves = {};

// Smooth-move the given event to the given target position via lerping
async function runSmoothMove(event, targetPosition, moveRate) {
	// Grab the initial state
	const startPosition = event.position;
	let startTime = performance.now();
	// If near enough to the prior smooth-move, maintain movement timing (to avoid movement stutter)
	// NOTE - NONMOVE_LIMIT is experimentally derived from a reasonable framerate.  Too low and
	// there's stutter.  Too high and the event sometimes flash-jumps when spamming the movement key.
	const NONMOVE_LIMIT = 100;
	if (startTime - event.latestSmoothMoveEndTime < NONMOVE_LIMIT) {
		startTime = event.latestSmoothMoveEndTime;
	}

	// Use a promise to block the subsequent code until the smooth-move is completed
	return new Promise(resolve => {
		// Add this smooth-move logic to be run just before each scene render
		activeSmoothMoves[event.id] = time => {
			const lerpPhase = (time - startTime) / moveRate;

			// MID-ANIMATION
			if (lerpPhase < 1) {
				event.position = snapCoordsToPixels(coordinateLerp(startPosition, targetPosition, lerpPhase));
				// Return true to keep the smooth-move going
				return true;
			}

			// END-ANIMATION
			// Track the end time to allow for a smoother transition into the next smooth-move
			event.latestSmoothMoveEndTime = time;
			// Change event to idle state
			window.PLAYBACK.updateEventsMoveState(event, false);
			// Make sure event ends up at the destination
			event.position = targetPosition;
			// Stop blocking code
			resolve();
			// Return false to remove this smooth-move from the active list
			return false;
		};
	});
}

// Decoupling 'this.busy' from 'this.canMove' so 'busy' doesn't block key states from being
// monitored, which causes problems when hitting a key to turn mid-move
Object.defineProperty(BipsiPlayback.prototype, 'canMove', {
	get() {
		// return this.ready && this.dialoguePlayback.empty && !this.busy && !this.ended && !this.inputWait; // MOD-REMOVED
		return this.ready && this.dialoguePlayback.empty && !this.ended && !this.inputWait; // MOD-ADDED
	},
});

// Advance all active smooth-moves just before rendering the scene
wrap.before(BipsiPlayback.prototype, 'render', () => {
	const time = performance.now();
	Object.entries(activeSmoothMoves).forEach(smoothMove => {
		if (!smoothMove[1](time)) {
			delete activeSmoothMoves[smoothMove[0]];
		}
	});
});

// Called whenever an event's move state (i.e. isMoving & facing) needs to change.
BipsiPlayback.prototype.updateEventsMoveState = function updateEventsMoveState(event, isMoving, dx, dy) {
	event.isMoving = isMoving;
	if (isMoving) {
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

// Modify bipsi's event-walk functionality to incorporate smooth-move
SCRIPTING_FUNCTIONS.WALK = async function WALK(event, sequence, delay = 0.4, wait = 0.4) {
	const dirs = Array.from(sequence);
	// for-of used for consistency with original bipsi fn
	// eslint-disable-next-line no-restricted-syntax
	for (const dir of dirs) {
		if (dir === '.') {
			/* eslint-disable no-await-in-loop */
			await window.sleep(wait * 1000);
		} else {
			const [x, y] = event.position;
			const [dx, dy] = WALK_DIRECTIONS[dir];

			// MOD-REMOVED-BLOCK
			// x = Math.max(0, Math.min(ROOM_SIZE - 1, x + dx));
			// y = Math.max(0, Math.min(ROOM_SIZE - 1, y + dy));
			// event.position = [x, y];
			// await sleep(delay * 1000);
			// /MOD-REMOVED-BLOCK

			// MOD-ADDED-BLOCK
			window.PLAYBACK.updateEventsMoveState(event, true, dx, dy);
			/* eslint-disable no-await-in-loop */
			await runSmoothMove(event, [x + dx, y + dy], EVENT_MOVE_RATE);
			// /MOD-ADDED-BLOCK
		}
	}
};

// Modify bipsi's avatar move functionality to incorporate smooth-move
BipsiPlayback.prototype.move = async function move(dx, dy) {
	if (this.ended) this.proceed();
	// if (!this.canMove) return; // MOD-REMOVED
	if (!this.canMove || this.busy) return; // MOD-ADDED (see "Decoupling" comment above)

	this.busy = true;

	const avatar = window.getEventById(this.data, this.avatarId);
	const room = window.roomFromEvent(this.data, avatar);

	this.updateEventsMoveState(avatar, true, dx, dy); // MOD-ADDED

	// determine move destination
	const [px, py] = avatar.position;
	const [tx, ty] = [px + dx, py + dy];

	// is the movement stopped by the room edge or solid cells?
	const bounded = tx < 0 || tx >= ROOM_SIZE || ty < 0 || ty >= ROOM_SIZE;
	const blocked = bounded ? false : window.cellIsSolid(room, tx, ty);

	// if not, then update avatar position
	// if (!blocked && !bounded) avatar.position = [tx, ty]; // MOD-REMOVED
	// MOD-ADDED-BLOCK
	if (!blocked && !bounded) {
		await runSmoothMove(avatar, [tx, ty], AVATAR_MOVE_RATE);
	} else {
		this.updateEventsMoveState(avatar, false);
	}
	// /MOD-ADDED-BLOCK

	// find if there's an event that should be touched. prefer an event at
	// the cell the avatar tried to move into but settle for the cell
	// they're already standing on otherwise
	const [fx, fy] = avatar.position;
	const [event0] = window.getEventsAt(room.events, tx, ty, avatar);
	const [event1] = window.getEventsAt(room.events, fx, fy, avatar);
	const event = event0 ?? event1;

	// if there was such an event, touch it
	if (event) await this.touch(event);

	// MOD-ADDED-BLOCK
	// If the avatar is blocked or bounded, smooth-move doesn't run.  This means there's no movement
	// delay.  Manually add delay to avoid spamming touch logic more frequently than the original
	// movement does.
	if (blocked || bounded) {
		const delayStartTime = performance.now();
		do {
			await window.sleep(10);
		} while (performance.now() - delayStartTime < AVATAR_MOVE_RATE);
	}
	// /MOD-ADDED-BLOCK
	this.busy = false;
};

// Code injection - update 'window.makePlayback' - remove original move delay.
// Smooth move introduces a natural move delay.  Don't compound that with the original delay.
let makePlaybackSrc = window.makePlayback.toString();
makePlaybackSrc = makePlaybackSrc.replace('async function makePlayback', 'makePlayback = async function');
makePlaybackSrc = makePlaybackSrc.replaceAll(/\n *moveCooldown = [^;]+;/g, '');
new Function(makePlaybackSrc)();
