/**
👪
@file tall character
@summary Make the character taller
@license GPL3.0-or-later
@author Jummit
@version 2.2.0


@description
Extends the player one tile up.

HOW TO USE:
1. Import plugin in bipsi
2. Modify "graphic" and "colors" field on this event to change appearance
3. Modify "direction" to change position relative to player (options: "up", "down", "left", "right")

//!CONFIG is-head (tag) ""
//!CONFIG direction (text) "up"
//!CONFIG graphic (tile) 0
//!CONFIG colors (colors) { "bg": 1, "fg": 3 }
*/
this.hacks = this.hacks || {};
(function (exports) {
'use strict';



const hackOptions = {};

const directions = {
	up: [0, -1],
	down: [0, 1],
	left: [-1, 0],
	right: [1, 0],
};

hackOptions.direction = directions[FIELD(CONFIG, 'direction', 'text') || 'up'] || directions.up;

wrap.before(BipsiPlayback.prototype, 'render', () => {
	const playback = window.PLAYBACK;
	const avatar = window.getEventById(playback.data, playback.avatarId);
	const head = window.findEventByTag(playback.data, 'is-head');
	const pos = window.getLocationOfEvent(playback.data, avatar);
	const newPos = {
		room: pos.room,
		position: [pos.position[0] + hackOptions.direction[0], pos.position[1] + hackOptions.direction[1]],
	};
	window.moveEvent(playback.data, head, newPos);
});

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.tall_character = this.hacks.tall_character || {});
