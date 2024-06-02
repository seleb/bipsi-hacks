/**
🙈
@file room overlays
@summary Draw roof layers over a room that hides interiors until the player enters them.
@license MIT
@author candle

@description
Draw roof layers over a room that hides interiors until the player enters them.

HOW TO USE:
1. Import plugin in bipsi
2. In a desired room, create an event tagged "room-overlay"
3. Add to that event a "location" field called "room-overlay" for each desired layer, pointing to the room to draw over this one.
4. In the rooms to be overlaid, set walls in any place where the layer should be hidden if the player is standing there.
*/
wrap.after(BipsiPlayback.prototype, 'addLayersToScene', async function addLayersToScene(scene, dest, frame) {
	if (this.ended) return;

	const avatar = getEventById(this.data, this.avatarId);
	const room = roomFromEvent(this.data, avatar);

	const overlay = room.events.find(event => IS_TAGGED(event, 'room-overlay'));

	if (!overlay) return;

	const locations = FIELDS(overlay, 'room-overlay', 'location');
	const tileToFrame = makeTileToFrameMap(this.data.tiles, frame);

	function upscaler(func) {
		return () => {
			fillRendering2D(TEMP_ROOM);
			func();
			dest.drawImage(TEMP_ROOM.canvas, 0, 0, 256, 256);
		};
	}

	locations.forEach(location => {
		const room2 = getRoomById(this.data, location.room);
		const palette = getPaletteById(this.data, room2.palette);
		const tileset = this.stateManager.resources.get(this.data.tileset);

		const [fx, fy] = avatar.position;
		const solid = cellIsSolid(room2, fx, fy);

		if (!solid) {
			scene.push({ layer: 2.5, func: upscaler(() => drawTilemapLayer(TEMP_ROOM, tileset, tileToFrame, palette, room2)) });
		}
	});
});

