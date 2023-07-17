/*
👣
@file smooth move
@summary Add smooth (lerped) movement to the avatar.
@license MIT
@author Violgamba (Jon Heard)

@description
Add smooth (lerped) movement to the avatar.  The speed is a settable config, and defaults to roughly
the same speed as the original, non-smoothed movement.

This plugin also handles separate tile fields for avatar moving vs idle states.  Since this creates
incompatibility with the 'direction-avatar.js' plugin, this plugin also handles direction-based
tile fields.  All of these fields have logical defaults, so can be safely ignored.
See below for details.


graphic-move-left, graphic-move-right, graphic-move-up, graphic-move-down
graphic-idle-left, graphic-idle-right, graphic-idle-up, graphic-idle-down
-------------------------------------------------------------------------
If the avatar has one or more of the above tile fields, then those tiles will be used at the logical
times.  If any of these fields are not present, then they default to the 'graphic-move' and
'graphic-idle' fields.  If either 'graphic-move' or 'graphic-idle' are not present, then THEY
default to the 'graphic' tile field.


HOW TO USE:
1. Import this plugin into your game.
2. Run the game.  Notice that the avatar movement is now smooth between cells.


// The rapidity of the avatar's movement
//!CONFIG move-speed (text) "190"

// Whether to update the avatar's 'graphic' field whenever the avatar moves.  Useful for controlling
// the avatar graphic outside of this plugin.
//!CONFIG manage-avatar-graphic (text) "true"
*/

const MOVE_SPEED = parseInt(FIELD(CONFIG, 'move-speed', 'text'), 10) || 190;
const MANAGE_AVATAR_GRAPHIC = FIELD(CONFIG, 'manage-avatar-graphic', 'text') !== 'false' ?? true;

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));

function coordLerp(startCoords, endCoords, phase) {
	return [startCoords[0] * (1 - phase) + endCoords[0] * phase, startCoords[1] * (1 - phase) + endCoords[1] * phase];
}

// Setup default avatar graphic tile fields, based on existing fields.
const GRAPHIC_DEFAULTS = {
	'graphic-move': ['graphic-move-left', 'graphic-move-right', 'graphic-move-up', 'graphic-move-down'],
	'graphic-idle': ['graphic-idle-left', 'graphic-idle-right', 'graphic-idle-up', 'graphic-idle-down'],
};
wrap.after(window, 'start', () => {
	if (MANAGE_AVATAR_GRAPHIC) {
		const avatar = getEventById(PLAYBACK.data, PLAYBACK.avatarId);
		Object.keys(GRAPHIC_DEFAULTS).forEach(baseName => {
			GRAPHIC_DEFAULTS[baseName].forEach(fieldName => {
				if (FIELD(avatar, fieldName, 'tile')) {
					return;
				}
				let tile = FIELD(avatar, baseName, 'tile');
				if (!tile) {
					tile = FIELD(avatar, 'graphic', 'tile');
				}
				replaceFields(avatar, fieldName, 'tile', tile);
			});
		});
		avatar.direction = 'down';
		PLAYBACK.onAvatarTurn(0, 0);
	}
});

// Called whenever a state change prompts a graphic change
function refreshAvatarGraphic(avatar) {
	const tile = FIELD(avatar, `graphic-${avatar.isMoving ? 'move' : 'idle'}-${avatar.direction}`, 'tile');
	if (tile) {
		replaceFields(avatar, 'graphic', 'tile', tile);
	}
}
// Called when a move causes the avatar to turn
BipsiPlayback.prototype.onAvatarTurn = function onAvatarTurn(dx, dy) {
	let direction = 'down';
	if (dx > 0) {
		direction = 'right';
	} else if (dx < 0) {
		direction = 'left';
	} else if (dy < 0) {
		direction = 'up';
	}
	const avatar = getEventById(this.data, this.avatarId);
	avatar.direction = direction;
	refreshAvatarGraphic(avatar);
};

// "Smooth" move the avatar via lerping
BipsiPlayback.prototype.animateSmoothMove = async function animateSmoothMove(avatar, endPosition) {
	return new Promise(resolve => {
		// Change to the 'move' graphic
		if (MANAGE_AVATAR_GRAPHIC) {
			avatar.isMoving = true;
			refreshAvatarGraphic(avatar);
		}

		// Record initial state
		const startPosition = avatar.position;
		let startTime = performance.now();
		// If near enough to the prior smooth move, maintain movement timing
		if (startTime - this.smoothMoveEndTime < 60) {
			startTime = this.smoothMoveEndTime;
		}

		// Animation
		const updateMovement = time => {
			const lerpPhase = (time - startTime) / MOVE_SPEED;

			if (lerpPhase < 1) {
				avatar.position = coordLerp(startPosition, endPosition, lerpPhase);
				requestAnimationFrame(updateMovement);
			} else {
				// Track end time to allow transitioning into the next smooth-move
				this.smoothMoveEndTime = time;

				// Change to 'idle' graphic
				if (MANAGE_AVATAR_GRAPHIC) {
					avatar.isMoving = false;
					refreshAvatarGraphic(avatar);
				}

				// End smooth move
				avatar.position = endPosition;
				resolve();
			}
		};
		requestAnimationFrame(updateMovement);
	});
};

// Decoupling 'this.busy' from 'this.canMove' so 'busy' doesn't block keystates from being monitored
Object.defineProperty(BipsiPlayback.prototype, 'canMove', {
	get() {
		return this.ready && this.dialoguePlayback.empty && !this.ended && !this.inputWait;
	},
});

// Update 'BipsiPlayback.move' via code injection (instead of copying the entire method)
let BipsiPlaybackMoveSrc = BipsiPlayback.prototype.move.toString();
BipsiPlaybackMoveSrc = BipsiPlaybackMoveSrc.replace('async move', 'BipsiPlayback.prototype.move = async function');

// Call code that manages avatar direction-based graphic changes
BipsiPlaybackMoveSrc = BipsiPlaybackMoveSrc.replace(
	'this.busy = true;',
	`this.busy = true;
	if (MANAGE_AVATAR_GRAPHIC) {
		this.onAvatarTurn(dx,dy);
	}`
);

// Change move from instant-position-change to lerping
BipsiPlaybackMoveSrc = BipsiPlaybackMoveSrc.replace('avatar.position = [tx, ty];', 'await this.animateSmoothMove(avatar, [ tx, ty ]);');

// If avatar blocked/bounded, smooth move doesn't run, so there's no delay.  Manually add delay to
// avoid spamming the touch logic more frequently than original movement does.
BipsiPlaybackMoveSrc = BipsiPlaybackMoveSrc.replace(
	'this.busy = false;',
	`
	if (blocked || bounded) {
		let delayStartTime = performance.now();
		do {
			await sleep(10);
		} while ((performance.now() - delayStartTime) < MOVE_SPEED);
	}
	this.busy = false;`
);

// See 'BipsiPlayback.canMove' redefinition comments above.  Decoupling 'this.busy' from 'this.move'
// means we manually have to check it here.
BipsiPlaybackMoveSrc = BipsiPlaybackMoveSrc.replace('if (!this.canMove) return;', 'if (!this.canMove || this.busy) return;');
eval(BipsiPlaybackMoveSrc);

// Update 'makePlayback' via code injection (instead of copying the entire method)
let makePlaybackSrc = makePlayback.toString();
makePlaybackSrc = makePlaybackSrc.replace('async function makePlayback', 'makePlayback = async function');

// Smooth move introduces a natural move delay.  Don't compound that with the original delay.
makePlaybackSrc = makePlaybackSrc.replace('moveCooldown = .2;', '');

eval(makePlaybackSrc);
