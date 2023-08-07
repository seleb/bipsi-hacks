/**
📎
@file event bound images
@summary Display images relative to an event.  If the event moves, the image moves.
@license MIT
@author Violgamba (Jon Heard)


@description
Display images relative to an event.  If the event moves, the image moves.  Uses include:
- Simulate darkness by binding, to the avatar, an image of black with a transparent hole in the center.
- Show npc states using icon images bound above the events.

NOTE - Incidentally, there is an undocumented feature of "SHOW_IMAGE".  Instead of passing a single
image, you can pass an array of images.  If this is done then the images will be animated together
at the same rate as tiles are.  This feature can be useful in conjuntion with this plugin.


HOW TO USE
1. Import this plugin into a game.
2. Create a library event and add an file field to it.  Set the field to an image file.  We'll be binding this image to the avatar.
3. Add a javascript field named "after" to the avatar event.  Set it to the following code, replacing X with the name of the field of step 2:
  const X = FIELD_OR_LIBRARY("X");
  SHOW_IMAGE("demo", X, 2, 0, 0);
  PLAYBACK.bindImageToEvent("demo", EVENT);
4. Run the game and note that the image from step 2 is shown and that it moves along with the avatar.
5. As a brief explanation of the code:
	- "SHOW_IMAGE" is a native bipsi method to display an image.  The last two parameters (both 0 in
		the example) are used differently for an event-bound image, though.  For an event-bound
		image they determine where the image is drawn relative to the event its bound to.
	- "PLAYBACK.bindImageToEvent" is what makes the image move with the avatar.  It takes the image
		id that was passed to "SHOW_IMAGE" and the event to bind the image to.
*/

// A method for the user to call, after calling SHOW_IMAGE, to bind the new image to an event.
BipsiPlayback.prototype.bindImageToEvent = function bindImageToEvent(imageId, event) {
	const image = this.images.get(imageId);
	if (!image) {
		this.showError(`Attempted to bind an unassigned image to an event: "${imageId}".`);
		return;
	}
	// If there were no avatar-bound images up to now, start the frame updates.
	if (!Object.keys(this.eventBoundImages).length) {
		this.eventBoundImagesAnimationId = window.requestAnimationFrame(window.updateAllEventBoundImagePositions);
	}
	// Add the image/event combo to the binding list
	this.eventBoundImages[imageId] = { event, image, offset: [image.x, image.y] };
	// Update the new bound image's position immediately.  If we don't, it'll flash at the upper-left corner before the next update.
	const currentRoomId = window.roomFromEvent(window.PLAYBACK.data, window.getEventById(window.PLAYBACK.data, window.PLAYBACK.avatarId)).id;
	window.updateEventBoundImagePosition(this.eventBoundImages[imageId], currentRoomId);
};

// Modify PLAYBACK.hideImage - remove an image from the avatar-bound list, if it's there.
wrap.after(BipsiPlayback.prototype, 'hideImage', imageId => {
	delete window.PLAYBACK.eventBoundImages[imageId];
	if (!Object.keys(window.PLAYBACK.eventBoundImages).length) {
		window.cancelAnimationFrame(window.PLAYBACK.eventBoundImagesAnimationId);
	}
});

// Add new fields to PLAYBACK.
wrap.after(window, 'start', () => {
	window.PLAYBACK.eventBoundImages = {};
	window.PLAYBACK.eventBoundImagesAnimationId = null;
});

// Update positions for all avatar-bound images, based on their events' positions.
window.updateAllEventBoundImagePositions = () => {
	const currentRoomId = window.roomFromEvent(window.PLAYBACK.data, window.getEventById(window.PLAYBACK.data, window.PLAYBACK.avatarId)).id;
	Object.values(window.PLAYBACK.eventBoundImages).forEach(binding => window.updateEventBoundImagePosition(binding, currentRoomId));
	window.PLAYBACK.eventBoundImagesAnimationId = window.requestAnimationFrame(window.updateAllEventBoundImagePositions);
};

// Update the position for a single avatar-bound image, based on its event's position.
window.updateEventBoundImagePosition = (binding, currentRoomId) => {
	if (window.roomFromEvent(window.PLAYBACK.data, binding.event).id !== currentRoomId) {
		binding.image.x = 999;
		return;
	}
	binding.image.x = binding.event.position[0] * TILE_PX + binding.offset[0];
	binding.image.y = binding.event.position[1] * TILE_PX + binding.offset[1];
};
