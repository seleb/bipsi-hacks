/*
🏘️
@file adjacent rooms
@summary Auto-move between "adjacent" rooms by walking to room edges.
@license MIT
@author Violgamba (Jon Heard)

@description
Auto-move between "adjacent" rooms by walking to room edges.  This plugin is useful if your game
is built around a grid of rooms, since it allows room-to-room navigation based on room adjacency,
rather than setting up exit events between each room.  Room adjacencies are defined by a grid-map of
room ids in the "room-map" text field of this plugin.  See comments for that field below.

NOTE - This plugin IS compatible with the "smooth move" plugin, but must come after it to work.  Use
the "plugin-order" field for this.


HOW TO USE:
1. Import this plugin into a game that has "adjacent" rooms with unblocked adjacent edges.
2. Fill this plugin's "room-map" field as explained in the field's comments below.  This defines room adjacencies.
3. Playtest the game.  Walk to an edge with an adjacent room, then bump it.  Note that you move into the adjacent room.


// "room-map" is a text field to hold a grid of room ids layed out with spaces and newlines.  This
// field lets one define room adjacencies as a grid-map.  Empty grid cells are defined by
// non-number, non-space characters.
// I suggest aligning room id's, either with leading 0's or extra spaces.  I also suggest using
// periods or period clusters for empty grid cells, though any non-numeric character should work.
// See example below.
// If your game needs multiple maps to tie all the rooms together then you can add multiple fields
// named "room-map" to this plugin.  When there are adjacency conflicts between these maps, later
// maps take precedence.
//
// EXAMPLE:
//
// 02 01
// .. 03
//
// (01 is the starting room.  To the left of it is 02.  Below it is 03.)
//
//!CONFIG room-map (text) ""


// If this tag is set, print the array of room adjacencies to the console at playback start.  This
// is useful to be sure that all adjacencies are properly setup.
// 
//!CONFIG log-adjacencies (tag) true
*/

const roomAdjacencies = {};

function includeAdjacenciesFromMapString(mapString) {
	if (!mapString.trim()) return;
	// Split the room-map into lines
	let roomMap = mapString.split('\n').filter(Boolean);
	// Split each line into individual cells
	roomMap = roomMap.map(line => {
		// Split each line into cells of text (either a number cluster or a non-number cluster)
		const cells = line.match(/[0-9]+|[^\s0-9]+/g);
		// Turn each cell of text into either a number or undefined
		return cells.map(item => {
			const num = parseInt(item, 10);
			return Number.isNaN(num) ? undefined : num;
		});
	});
	// Turn the cell data into adjacency lists
	for (let y = 0; y < roomMap.length; y++) {
		for (let x = 0; x < roomMap[y].length; x++) {
			const roomId = roomMap[y][x];
			if (roomId === undefined) continue;
			let other;
			other = roomMap[y][x - 1];
			if (other !== undefined) {
				roomAdjacencies[roomId] ||= {};
				roomAdjacencies[roomId].left = other;
			}
			other = roomMap[y][x + 1];
			if (other !== undefined) {
				roomAdjacencies[roomId] ||= {};
				roomAdjacencies[roomId].right = other;
			}
			other = roomMap[y - 1]?.[x];
			if (other !== undefined) {
				roomAdjacencies[roomId] ||= {};
				roomAdjacencies[roomId].up = other;
			}
			other = roomMap[y + 1]?.[x];
			if (other !== undefined) {
				roomAdjacencies[roomId] ||= {};
				roomAdjacencies[roomId].down = other;
			}
		}
	}
}
// Parse all room-maps into the adjacency list
const maps = FIELDS(CONFIG, 'room-map', 'text');
maps.forEach(includeAdjacenciesFromMapString);
if (FIELD(CONFIG, 'log-adjacencies', 'tag')) {
	console.log('Room adjacencies:', roomAdjacencies);
}

wrap.splice(BipsiPlayback.prototype, 'move', (original, dx, dy) => {
	if (!window.PLAYBACK.canMove || window.PLAYBACK.busy) return; // Extra "busy" flag check for compatibility with "smooth-move" plugin.
	const avatar = window.getEventById(window.PLAYBACK.data, window.PLAYBACK.avatarId);
	const [px, py] = avatar.position;
	const [tx, ty] = [px + dx, py + dy];
	const currentRoomAdjacencies = roomAdjacencies[window.roomFromEvent(window.PLAYBACK.data, avatar).id];
	if (currentRoomAdjacencies) {
		let adjacencyDestination;
		// If moving through an adjacency, setup a modified "location" object to move the pc to.
		// "target" is added to the location object to represent where pc should end up in the next room, while the ACTUAL position is one cell off-screen.
		// This allows the pc to "move" into the room, while also allowing a check to make sure the destination is not blocked.
		if (tx <= -1 && currentRoomAdjacencies.left !== undefined) {
			adjacencyDestination = { room: currentRoomAdjacencies.left, position: [ROOM_SIZE, avatar.position[1]], target: [ROOM_SIZE - 1, avatar.position[1]] };
		} else if (ty <= -1 && currentRoomAdjacencies.up !== undefined) {
			adjacencyDestination = { room: currentRoomAdjacencies.up, position: [avatar.position[0], ROOM_SIZE], target: [avatar.position[0], ROOM_SIZE - 1] };
		} else if (tx >= ROOM_SIZE && currentRoomAdjacencies.right !== undefined) {
			adjacencyDestination = { room: currentRoomAdjacencies.right, position: [-1, avatar.position[1]], target: [0, avatar.position[1]] };
		} else if (ty >= ROOM_SIZE && currentRoomAdjacencies.down !== undefined) {
			adjacencyDestination = { room: currentRoomAdjacencies.down, position: [avatar.position[0], -1], target: [avatar.position[0], 0] };
		}
		// Move to the adjacent room, but only if the destination cell isn't blocked
		if (adjacencyDestination !== undefined) {
			const room = window.getRoomById(window.PLAYBACK.data, adjacencyDestination.room);
			if (window.cellIsSolid(room, adjacencyDestination.target[0], adjacencyDestination.target[1])) return;
			window.moveEvent(window.PLAYBACK.data, avatar, adjacencyDestination);
		}
	}
	// Finish with normal movement logic
	original.call(window.PLAYBACK, dx, dy);
});
