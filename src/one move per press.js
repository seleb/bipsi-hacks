/**
🦥
@file one move per press
@summary Limits movement to a single move per key/button press.
@license MIT
@author Violgamba (Jon Heard)


@description
Limits movement to a single move per key/button press.	Holding the key or button down no longer
results in multiple moves.  This is useful when the target player is not skilled with the input
device they are using.

For example, my young nieces make games by drawing maps and tiles with my laptop's touch screen.
However, they are not skilled at the keyboard or a gamepad, so they struggle when playing their
games, often moving the character further than intended.


HOW TO USE:
1. Import this plugin into your game.
2. Plat-test the game and try to hold a direction key or button down.	Note that the character only moves one cell per press.
*/

const DIRECTION_TO_KEYS = {
	'0,-1': ['ArrowUp', 'w'],
	'0,1': ['ArrowDown', 's'],
	'-1,0': ['ArrowLeft', 'a'],
	'1,0': ['ArrowRight', 'd'],
};

const moveKeyDownEvents = {
	ArrowUp: null,
	ArrowDown: null,
	ArrowLeft: null,
	ArrowRight: null,
	w: null,
	s: null,
	a: null,
	d: null,
};

window.addEventListener(
	'keydown',
	evt => {
		if (moveKeyDownEvents[evt.key] === undefined) return;
		moveKeyDownEvents[evt.key] = evt;
	},
	{ capture: true }
);

window.addEventListener('keyup', evt => {
	if (moveKeyDownEvents[evt.key] === undefined) return;
	moveKeyDownEvents[evt.key] = null;
});

wrap.after(BipsiPlayback.prototype, 'move', (dx, dy) => {
	const moveSrcKeys = DIRECTION_TO_KEYS[`${dx},${dy}`];
	if (!moveSrcKeys) {
		console.error(`Unhandled move: ${dx},${dy}`);
		return;
	}
	moveSrcKeys.forEach(moveSrcKey => {
		if (moveKeyDownEvents[moveSrcKey]) {
			document.dispatchEvent(new KeyboardEvent('keyup', moveKeyDownEvents[moveSrcKey]));
		}
	});
});
