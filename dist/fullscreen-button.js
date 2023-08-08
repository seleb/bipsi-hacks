/**
🖥️
@file fullscreen button
@summary Adds a fullscreen button to the lower-right of the game canvas.
@license MIT
@author Violgamba (Jon Heard)
@version 4.10.0



@description
Adds a fullscreen button to the lower-right of the game canvas.  This is useful if the site your
game is hosted on does not automatically add fullscreen support.


HOW TO USE:
1. Import this plugin into your game.
2. Playtest the game.  Note the transparent button on the lower-right of the game window.
3. Click the transparent button and note that the game goes fullscreen.
4. Hit the "escape" key and the game becomes non-fullscreen.

// Customize the general button style
//!CONFIG button-style-normal (text) "width: 21px; height: 21px; padding: 0; margin:0; background-color: #888888; border: 2px outset #888888;"

// Customize the button style while the pointer is hovered over it
//!CONFIG button-style-hovered (text) "background-color: #ffffff;"

// Customize the button style while the pointer press pressed over it
//!CONFIG button-style-down (text) "border: 2px inset #888888;"

// Customize the button icon - the visual content within the button.
//!CONFIG button-icon (text) "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' stroke='currentColor' stroke-linecap='round' fill='none' stroke-width='1.25' width='14' height='14'><path d='M5 2h-3v3'></path><path d='M11 2h3v3'></path><path d='M2 11v3h3'></path><path d='M14 11v3h-3'></path></svg>"
*/
(function () {
'use strict';



const style = document.createElement('style');
document.head.append(style);
style.id = 'fullscreenButtonSytles';
style.innerHTML = `
	#fullscreen-button        { position: absolute; right: 2px; bottom: 2px; opacity: 50%; }
	#fullscreen-button        { ${FIELD(CONFIG, 'button-style-normal', 'text')} }
	#fullscreen-button:hover  { ${FIELD(CONFIG, 'button-style-hovered', 'text')} }
	#fullscreen-button:active { ${FIELD(CONFIG, 'button-style-down', 'text')} }
`;
const playbackCanvas = document.getElementById('player-canvas');
const fullscreenButton = document.createElement('button');
playbackCanvas.parentElement.append(fullscreenButton);
fullscreenButton.id = 'fullscreen-button';
fullscreenButton.title = 'toggle fullscreen mode';
fullscreenButton.innerHTML = FIELD(CONFIG, 'button-icon', 'text');
fullscreenButton.addEventListener('click', () => {
	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
		if (playbackCanvas.requestFullscreen) {
			playbackCanvas.requestFullscreen();
		} else if (document.documentElement.msRequestFullscreen) {
			playbackCanvas.msRequestFullscreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			playbackCanvas.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullscreen) {
			playbackCanvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
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
});

})();
