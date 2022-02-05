/**
🎮
@file gamepad input
@summary HTML5 gamepad support
@license MIT
@author Sean S. LeBlanc

@description
Adds support for gamepad input.

Directional input is mapped to the left and right analog sticks, the dpad, and the face buttons (e.g. ABXY).
The start + select/back buttons are mapped to Enter so they can also progress dialogue.

HOW TO USE:
Import plugin in bipsi
*/
import { Axes, Buttons, Gamepads } from 'input-gamepads.js';

const gamepads = new Gamepads();

function triggerKeyEvent(name, key, code) {
	document.dispatchEvent(new KeyboardEvent(name, { key, code, repeat: false }));
}

function move(dpad, face, axis, axis2, axispast, axisdir, key, code) {
	// keydown
	if (gamepads.isJustDown(dpad) || gamepads.isJustDown(face) || gamepads.axisJustPast(axis, axispast, axisdir) || gamepads.axisJustPast(axis2, axispast, axisdir)) {
		triggerKeyEvent('keydown', key, code);
	}

	// keyup
	if (gamepads.isJustUp(dpad) || gamepads.isJustUp(face) || gamepads.axisJustPast(axis, axispast, -axisdir) || gamepads.axisJustPast(axis2, axispast, -axisdir)) {
		triggerKeyEvent('keyup', key, code);
	}
}

wrap.before(BipsiPlayback.prototype, 'update', () => {
	move(Buttons.DPAD_LEFT, Buttons.X, Axes.LSTICK_H, Axes.RSTICK_H, -0.5, -1, 'ArrowLeft', 37);
	move(Buttons.DPAD_RIGHT, Buttons.B, Axes.LSTICK_H, Axes.RSTICK_H, 0.5, 1, 'ArrowRight', 39);
	move(Buttons.DPAD_UP, Buttons.Y, Axes.LSTICK_V, Axes.RSTICK_V, -0.5, -1, 'ArrowUp', 38);
	move(Buttons.DPAD_DOWN, Buttons.A, Axes.LSTICK_V, Axes.RSTICK_V, 0.5, 1, 'ArrowDown', 40);

	if (gamepads.isJustDown(Buttons.START) || gamepads.isJustDown(Buttons.BACK)) {
		triggerKeyEvent('keydown', 'Enter', 13);
	}
	if (gamepads.isJustUp(Buttons.START) || gamepads.isJustUp(Buttons.BACK)) {
		triggerKeyEvent('keyup', 'Enter', 13);
	}
});
wrap.after(BipsiPlayback.prototype, 'update', () => {
	gamepads.update();
});
