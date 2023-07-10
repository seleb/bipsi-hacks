/**
🖥️
@file fullscreen
@summary Add a hotkey to toggle fullscreen.  A gamepad's "start" button can also toggle fullscreen.
@license MIT
@author Violgamba (Jon Heard)

@description
Add a hotkey to toggle fullscreen mode.
If "gamepad-input" plugin is used, a gamepad's "start" button triggers the "enter" key.  This also
toggles fullscreen mode if "enter" is set as the fullscreen hotkey, which is the default.


HOW TO USE:
1. Import this plugin into your game.
2. Run the game.
3. Press the "enter" key.  Note that the game becomes fullscreen.
3. Press the "enter" key again.  Note that the game becomes non-fullscreen.
NOTE: if this plugin's configuration is changed, the key to press may be different than "enter".


// Which keyboard key triggers fullscreen
//!CONFIG fullscreen-hotkey (text) "Enter"
*/

const KEY_FOR_FULLSCREEN = FIELD(CONFIG, 'fullscreen-keycode', 'text') || "Enter";

function toggleFullscreen() {
	var canvas = document.getElementById("player-canvas");
	if (!canvas) {
		return;
	}
	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement)
	{
		if (canvas.requestFullscreen) {
			canvas.requestFullscreen();
		} else if (document.documentElement.msRequestFullscreen) {
			canvas.msRequestFullscreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			canvas.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullscreen) {
			canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	}
	else
	{
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}

function fullscreenPlugin_onKeydown(e) {
	if (e.key == KEY_FOR_FULLSCREEN) {
		toggleFullscreen();
	}
}

// Make sure this plugin does NOT add multiple event handlers (i.e. each time the game is played)
const oldKeydownHandler = window.parent.window.EDITOR.fullscreenPlugin_onKeydown;
if (oldKeydownHandler) {
	window.parent.document.removeEventListener("keydown", oldKeydownHandler);
}
window.parent.window.EDITOR.fullscreenPlugin_onKeydown = fullscreenPlugin_onKeydown;

// Add key event handler both to the game, and to the editor
document.addEventListener("keydown", fullscreenPlugin_onKeydown);
window.parent.document.addEventListener("keydown", fullscreenPlugin_onKeydown);
