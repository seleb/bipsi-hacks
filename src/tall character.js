/**
👪
@file tall character
@summary Make the character taller
@license GPL3.0-or-later
@author Jummit

@description
Extends the player one tile up.

HOW TO USE:
Import plugin in bipsi and add the "is-head" tag to this event.
Add a "graphic" tag as well.
*/

export const hackOptions = {};

const directions = {
	up: [0, -1],
	dowm: [0, 1],
	left: [-1, 0],
	right: [1, 0],
};

hackOptions.direction = directions[FIELD(CONFIG, 'direction', 'text') ?? 'up'];

wrap.before(BipsiPlayback.prototype, 'render', () => {
	const playback = window.PLAYBACK;
	const avatar = getEventById(playback.data, playback.avatarId);
	const head = findEventByTag(playback.data, 'is-head');
	const pos = getLocationOfEvent(playback.data, avatar);
	const new_pos = {
		room: pos.room,
		position: [pos.position[0] + hackOptions.direction[0], pos.position[1] + hackOptions.direction[1]],
	};
	moveEvent(playback.data, head, new_pos);
});
