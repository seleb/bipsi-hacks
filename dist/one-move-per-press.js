/**
🦥
@file one move per press
@summary Limits movement to a single move per key/button press or touch.
@license MIT
@author Violgamba (Jon Heard)
@version 8.2.1



@description
Limits movement to a single move per key/button press or touch.  Holding the key or button down no
longer results in multiple moves and neither does touch-dragging.  This is useful when the target
player is not skilled with the input device they are using.

For example, my young nieces make games by drawing maps and tiles with my laptop's touch screen.
However, they are not skilled at the keyboard or a gamepad, so they struggle when playing their
games, often moving the character further than intended.


HOW TO USE - BASIC:
1. Import this plugin into your game.
2. Playtest the game, then hold a direction key or button down.  Note that the character only moves
   one cell per press.

HOW TO USE - TURN ON/OFF:
1. Import this plugin into your game.
2. Make an event that is readily touchable.
3. Add a touch script (javascript field named 'before', 'after' or 'touch') to the event of step 2.
   Set the script to this:
  PLAYBACK.oneMovePerPress = !PLAYBACK.oneMovePerPress;
4. Playtest the game, then hold a direction key or button down.  Note that the character only moves
   one cell per press.
5. Touch the event of step 2, then hold a direction key or button down.  Note that the character
   movement is normal, i.e. it keeps moving as long as the key/button is held.

//!CONFIG plugin-starts-on (json) true
*/
(function () {
'use strict';



const keysPressed = new Set();
let blockMovement = false;

// Track changes to 'PLAYBACK.oneMovePerPress' flag to clear this plugin's state when enabled
let oneMovePerPressIsOn = !!FIELD(CONFIG, 'plugin-starts-on', 'json');
wrap.after(window, 'start', () => {
	window.PLAYBACK.oneMovePerPress = !!FIELD(CONFIG, 'plugin-starts-on', 'json');
});

// Track pressed keys
window.addEventListener(
	'keydown',
	evt => {
		if (!window.PLAYBACK.oneMovePerPress) return;
		keysPressed.add(evt.key);
	},
	{ capture: true }
);

// Track pressed keys AND release movement block if all keys/touches are released.
document.addEventListener('keyup', evt => {
	if (!window.PLAYBACK.oneMovePerPress) return;
	keysPressed.delete(evt.key);
	if (keysPressed.size === 0) {
		blockMovement = false;
	}
});

// Track touch
document.addEventListener('pointerdown', evt => {
	if (!window.PLAYBACK.oneMovePerPress) return;
	keysPressed.add('pointer');
});

// Track touch AND release movement block if all keys/touches are released.
document.addEventListener('pointerup', evt => {
	if (!window.PLAYBACK.oneMovePerPress) return;
	keysPressed.delete('pointer');
	if (keysPressed.size === 0) {
		blockMovement = false;
	}
});

wrap.splice(BipsiPlayback.prototype, 'move', function move(original, ...args) {
	// If plugin was JUST enabled, clear its state
	if (oneMovePerPressIsOn !== window.PLAYBACK.oneMovePerPress) {
		oneMovePerPressIsOn = window.PLAYBACK.oneMovePerPress;
		if (oneMovePerPressIsOn) {
			keysPressed.clear();
			blockMovement = false;
		}
	}

	if (!window.PLAYBACK.oneMovePerPress) {
		// Do normal logic, if PLAYBACK.oneMovePerPress is false
		original.call(this, ...args);
	} else {
		// Only accept movement if 'blockMovement' flag is false
		if (!blockMovement) {
			original.call(this, ...args);
		}
		// Only set movement blocking if a key is pressed, since this may run AFTER the 'keyup' listener.
		if (keysPressed.size > 0) {
			blockMovement = true;
		}
	}
});

})();
