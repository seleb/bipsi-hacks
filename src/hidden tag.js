/*
🫥
@file hidden tag
@summary A graphical event won't be rendered if it includes the "hidden" tag.
@license MIT
@author Violgamba (Jon Heard)

@description
Adds support for the "hidden" tag.  A graphical event won't be rendered if it includes the "hidden"
tag.  This is useful if an event must be hidden until a later time.  It is intended to be simpler
than alternatives, such as storing the event's graphic in a separate field and copying it into the
graphic field to unhide the event, which can become cumbersome when paired with other graphic
control techniques.


HOW TO USE:
1. Import this plugin into a game that has an event with a graphic field.
2. Add a "hidden" tag to the event with the graphic field.
3. Add an "after" (or "before") javascript field to the event.  Fill it with this code:
		UNTAG(EVENT, 'hidden');
4. Playtest the game and note that the event doesn't show up.
5. Move the pc to touch the hidden event.  Note that the event becomes visible.
*/

wrap.splice(window, 'drawEventLayer', (original, destination, tileset, tileToFrame, palette, events) => {
	// Store and remove graphics for hidden events
	const hiddenEvents = [];
	events.forEach(event => {
		if (!window.eventIsTagged(event, 'hidden')) return;
		const graphicFields = window.allFields(event, 'graphic');
		hiddenEvents.push({ event, graphicFields });
		window.clearFields(event, 'graphic');
	});

	// Run original logic
	original(destination, tileset, tileToFrame, palette, events);

	// Restore graphics for hidden events
	hiddenEvents.forEach(eventInfo => {
		eventInfo.event.fields.push(...eventInfo.graphicFields);
	});
});
