/*
📱
@file max size on mobile
@summary Make the game display as large as possible on mobile platforms.
@license MIT
@author Violgamba (Jon Heard)

@description
Itch.io's embedded web system does not have a fullscreen option for mobile platforms.  In this case
bipsi games are left to their own sizing mechanism.  While bipsi auto-sizes to fit the available
screen-space, it does so in multiples of 256 pixels.  This means that, on mobile devices, there's
anywhere from 0 to 256 pixels of unused space.  This may be undesirable given the small size of most
mobile device screens.  If so, then this plugin is useful.  It changes bipsi to use as much
screen-space as possible when run on a mobile device.


HOW TO USE:
1. Import this plugin into your game.
2. Export the game and run it on a mobile device.  Note that the game is as big as possible while
   maintaining a square aspect.
*/

function detectPlatform_mobile() {
	const toMatch = [ /Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i ];
	return toMatch.some((toMatchItem) => {
		return navigator.userAgent.match(toMatchItem);
	});
}
if (detectPlatform_mobile()) {
	// On mobile devices, rewrite this function for maximal screen usage.
	scaleElementToParent = function(element, margin = 0) {
		const parent = element.parentElement;

		const [tw, th] = [parent.clientWidth-margin*2, parent.clientHeight-margin*2];
		const [sw, sh] = [tw / element.clientWidth, th / element.clientHeight];
		let scale = Math.min(sw, sh);

		// Disabling this line allows for maximal screen usage
		// if (scale > 1) scale = Math.floor(scale); 

		element.style.setProperty("transform", `translate(-50%, -50%) scale(${scale})`);
		return scale;
	}
}
