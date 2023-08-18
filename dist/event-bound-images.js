/**
📎
@file event bound images
@summary Display images relative to an event.  If the event moves, the image moves.
@license MIT
@author Violgamba (Jon Heard)
@version 7.0.0



@description
Display images relative to an event.  If the event moves, the image moves.  Uses include:
- Simulate darkness by binding, to the avatar, an image of black with a transparent hole in the center.
- Show npc states using icon images bound above the events.

NOTE - Incidentally, there is an undocumented feature of "SHOW_IMAGE".  Instead of passing a single
image, you can pass an array of images.  If this is done then the images will be animated together
at the same rate as tiles are.  This feature can be useful in conjunction with this plugin.


HOW TO USE
1. Import this plugin into a game.
2. Create a library event and add an file field to it.  Set the field to an image file.  We'll be binding this image to the avatar.
3. Add a javascript field named "after" to the avatar event.  Set it to the following code, replacing X with the name of the field of step 2:
  const X = FIELD_OR_LIBRARY("X");
  SHOW_IMAGE("demo", X, 2, 0, 0);
  BIND_IMAGE_TO_EVENT("demo", EVENT);
4. Run the game and note that the image from step 2 is shown and that it moves along with the avatar.
5. As a brief explanation of the code:
	- "SHOW_IMAGE" is a native bipsi method to display an image.  The last two parameters (both 0 in
		the example) are used differently for an event-bound image, though.  For an event-bound
		image they determine where the image is drawn relative to the event its bound to.
	- "BIND_IMAGE_TO_EVENT" is what makes the image move with the avatar.  It takes the same image
		id that was passed to "SHOW_IMAGE" along with the event to bind the image to.
*/
(function () {
'use strict';



// A method for the user to call, after calling SHOW_IMAGE, to bind the new image to an event.
BipsiPlayback.prototype.bindImageToEvent = function bindImageToEvent(imageId, event) {
	const image = this.images.get(imageId);
	if (!image) {
		this.showError(`Attempted to bind an unassigned image to an event: "${imageId}".`);
		return;
	}
	// Add the image/event combo to the binding list
	this.eventBoundImages[imageId] = { event, image, offset: [image.x, image.y] };
	// Update the new bound image's position immediately.  If we don't, it'll flash at the upper-left corner before the next update.
	const currentRoomId = window.roomFromEvent(this.data, window.getEventById(this.data, this.avatarId)).id;
	this.updateEventBoundImage(this.eventBoundImages[imageId], currentRoomId);
};

SCRIPTING_FUNCTIONS.BIND_IMAGE_TO_EVENT = function BIND_IMAGE_TO_EVENT(id, event) {
	this.PLAYBACK.bindImageToEvent(id, event);
};

// Modify PLAYBACK.hideImage - remove an image from the avatar-bound list, if it's there.
wrap.after(BipsiPlayback.prototype, 'hideImage', function hideImage(imageId) {
	delete this.eventBoundImages[imageId];
});

// Add new fields to PLAYBACK.
wrap.after(BipsiPlayback.prototype, 'init', function init() {
	this.eventBoundImages = {};
});

// Update positions for all avatar-bound images just before rendering them.
wrap.before(BipsiPlayback.prototype, 'render', function render() {
	const currentRoomId = window.roomFromEvent(this.data, window.getEventById(this.data, this.avatarId)).id;
	Object.values(this.eventBoundImages).forEach(binding => this.updateEventBoundImage(binding, currentRoomId));
});

// Update the position for a single avatar-bound image, based on its event's position.
BipsiPlayback.prototype.updateEventBoundImage = function updateEventBoundImage(binding, currentRoomId) {
	// If bound event is in a different room, put the image off-screen
	if (window.roomFromEvent(this.data, binding.event).id !== currentRoomId) {
		binding.image.x = ROOM_PX;
		return;
	}
	binding.image.x = binding.event.position[0] * TILE_PX + binding.offset[0];
	binding.image.y = binding.event.position[1] * TILE_PX + binding.offset[1];
};

})();
