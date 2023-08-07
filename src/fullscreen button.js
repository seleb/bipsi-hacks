/**
🖥️
@file fullscreen button
@summary Adds a fullscreen button to the lower-right of the game canvas.
@license MIT
@author Violgamba (Jon Heard)
@version 4.7.0


@description
Adds a fullscreen button to the lower-right of the game canvas.  This is useful if the site your
game is hosted on does not automatically add fullscreen support.


HOW TO USE:
1. Import this plugin into your game.
2. Playtest the game.  Note the transparent button on the lower-right of the game window.
3. Click the transparent button and note that the game goes fullscreen.
4. Hit the "escape" key and the game becomes non-fullscreen.
*/

const playerUi = document.getElementById('player');
const fullscreenButton = document.createElement('button');
playerUi.append(fullscreenButton);
fullscreenButton.id = 'btnToggleFullscreen';
fullscreenButton.setAttribute('style', 'position:absolute;width:21px;height:21px;right:2px;bottom:2px;padding:0;opacity:40%;');
fullscreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" stroke="currentColor" stroke-linecap="round" fill="none" stroke-width="1.25" width="14" height="14"><path d="M5 2h-3v3"></path><path d="M11 2h3v3"></path><path d="M2 11v3h3"></path><path d="M14 11v3h-3"></path></svg>`;
fullscreenButton.addEventListener('click', () => {
	const canvas = document.getElementById('player-canvas');
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
});
