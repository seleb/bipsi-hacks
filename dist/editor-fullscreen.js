/**
🖥️
@file editor fullscreen
@summary Add a ui button and hotkey to the editor to toggle fullscreen while playtesting the game.
@license MIT
@author Violgamba (Jon Heard)
@version 6.0.0


@description
Add a ui button and hotkey to the editor to toggle fullscreen mode while playtesting the game.
If 'gamepad-input' plugin is used, a gamepad's 'start' button triggers the 'enter' key.  This is
why 'enter' is the default fullscreen hotkey, to allow toggling fullscreen from a gamepad.


HOW TO USE:
1. Import this plugin into your game.
2. Run the game.
3. Press the 'enter' key.  Note that the game becomes fullscreen.
4. Press the 'enter' key again.  Note that the game becomes non-fullscreen.
5. Find the fullscreen button on the lower left of the ui (while the game is running).
6. Press the fullscreen button.  Note that the game becomes fullscreen.
NOTE: if this plugin's configuration is changed, the key to press may not be 'enter'.


// Which keyboard key triggers fullscreen
//!CONFIG fullscreen-hotkey (text) "Enter"
*/
(function () {
'use strict';



//! CODE_EDITOR

function setupEditorPlugin() {
	// Fullscreen toggle logic
	BipsiEditor.prototype.toggleFullscreen = function toggleFullscreen() {
		const canvas = this.playtestIframe.contentWindow.document.getElementById('player-canvas');
		if (!canvas) return;
		if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
			if (canvas.requestFullscreen) {
				canvas.requestFullscreen();
			} else if (document.documentElement.msRequestFullscreen) {
				canvas.msRequestFullscreen();
			} else if (document.documentElement.mozRequestFullScreen) {
				canvas.mozRequestFullScreen();
			} else if (document.documentElement.webkitRequestFullscreen) {
				canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		} else {
			// eslint-disable-next-line no-lonely-if
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
	};

	// Playtest toolbar button
	const playtestToolbar = document.getElementById('play-tab-view').children[1];
	const fullscreenButton = document.createElement('button');
	playtestToolbar.prepend(fullscreenButton);
	fullscreenButton.id = 'fullscreenButton';
	fullscreenButton.classList.add('icon-button');
	fullscreenButton.title = 'toggle fullscreen';
	fullscreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewbox="0 0 16 16" stroke="currentColor" stroke-linecap="round" fill="none" stroke-width="1.25"><path d="M5 2h-3v3"/><path d="M11 2h3v3"/><path d="M2 11v3h3"/><path d="M14 11v3h-3"/></svg>`;
	fullscreenButton.addEventListener('click', BipsiEditor.prototype.toggleFullscreen.bind(window.EDITOR));

	// Hotkey
	document.addEventListener('keydown', e => {
		if (e.key === (FIELD(CONFIG, 'fullscreen-hotkey', 'text')?.trim() || 'Enter')) {
			window.EDITOR.toggleFullscreen();
		}
	});

	// Prevent repeating this setup
	window.EDITOR.loadedEditorPlugins ||= new Set();
	window.EDITOR.loadedEditorPlugins.add('fullscreen');
}
if (!window.EDITOR.loadedEditorPlugins?.has('fullscreen')) {
	setupEditorPlugin();
}

//! CODE_PLAYBACK_DEV

// Add fullscreen hotkey while the playtest canvas has the focused (i.e. while playtesting the game)
const FULLSCREEN_HOTKEY = FIELD(CONFIG, 'fullscreen-hotkey', 'text')?.trim() || 'Enter';
document.addEventListener('keydown', e => {
	if (e.key === FULLSCREEN_HOTKEY) {
		window.parent.window.EDITOR.toggleFullscreen();
	}
});

})();
