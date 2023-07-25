/**
🏷
@file editor fields start as tags
@summary New fields begin as "tag" types, rather than "text" types.
@license MIT
@author Violgamba (Jon Heard)
@version 4.5.0


@description
New fields begin as "tag" types, rather than "text" types.  This is useful for users who add tag
events more frequently than text events.


HOW TO USE
1. Import this plugin into your game.
2. Add a new field to an event.  Note that the new field is a tag type.
*/
(function () {
'use strict';



//! CODE_EDITOR

function setupEditorPlugin() {
	wrap.after(EventEditor.prototype, 'addField', () => {
		const { event } = window.EDITOR.getSelections();
		event.fields[event.fields.length - 1].type = 'tag';
		window.EDITOR.eventEditor.refresh();
	});

	// Prevent repeating this setup
	window.EDITOR.loadedEditorPlugins ||= new Set();
	window.EDITOR.loadedEditorPlugins.add('fieldsStartAsTags');
}
if (!window.EDITOR.loadedEditorPlugins?.has('fieldsStartAsTags')) {
	setupEditorPlugin();
}

//! CODE_PLAYBACK

})();
