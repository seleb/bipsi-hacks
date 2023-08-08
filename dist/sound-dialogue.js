/**
💬
@file sound dialogue
@summary Add sound dialogue that plays alongside text dialogue.  Add VO to your game.
@license MIT
@author Violgamba (Jon Heard)
@version 4.8.0


@description
Add sound dialogue that plays alongside text dialogue.  Add VO to your game.
** NOTE - Requires the "sounds.js" Bipsi plugin. **

Motivation - My nieces can't read well yet, but they can draw and they can certainly talk.  This is
	part of an in-editor system to let them make games and easily add non-text dialogue.


HOW TO USE:
1. Make sure that the "sounds.js" plugin is imported into your game.
2. Import this plugin into your game.
3. If you don't already have a "library" event, create a new event with the tag "is-library".
4. Add an audio dialogue file (mp3 or wav) to the "library" event as a file field.
4. Find the text dialogue you want the audio dialogue to play alongside.  Add "&&X&&" to the start
	of the text, replacing X with the name of the field of step 4.
5. Run the game and trigger the text dialogue of step 5.  Note that the audio dialogue plays.
*/
(function () {
'use strict';



const EMPTY_CHAR_CODE = 1;
const EMPTY_CHAR = String.fromCharCode(EMPTY_CHAR_CODE);

// Keep track of which event is running the current js code
wrap.before(BipsiPlayback.prototype, 'runJS', (event, js, debug) => {
	if (window.PLAYBACK) {
		window.PLAYBACK.jsSourceEvent = event;
	}
});

// Add a zero-width character to the font so we can use it for characterless styles (like "sound")
function addEmptyCharToFont(font) {
	if (!font.characters.has(1)) {
		font.characters.set(1, { codepoint: EMPTY_CHAR_CODE, rect: { x: 0, y: 0, width: 0, height: 0 }, spacing: 0, image: font.characters.get(0).image });
	}
}

wrap.splice(DialoguePlayback.prototype, 'queue', function queueSound(original, script, options) {
	// Make sure the font includes a zero-width character
	addEmptyCharToFont(this.getOptions(options).font);
	// Replace sound markup with a sound style
	script = soundFakedownToTag(script);
	// Original logic
	return original.call(this, script, options);
});

// React to each "sound" style in the dialogue text by playing its sound
wrap.before(DialoguePlayback.prototype, 'applyStyle', () => {
	window.PLAYBACK.dialoguePlayback.currentPage.glyphs.forEach((glyph, i) => {
		if (!glyph.hidden && glyph.styles.has('sound')) {
			const soundName = glyph.styles.get('sound');
			if (soundName) {
				const assetId = window.PLAYBACK.makeScriptingDefines(window.PLAYBACK.jsSourceEvent).FIELD_OR_LIBRARY(soundName);
				if (assetId) {
					window.PLAYBACK.playSound(window.PLAYBACK.getFileObjectURL(assetId), 'dialogue');
				}
			}
			glyph.styles.delete('sound');
		}
	});
});

// Handle each sound markup by turning it into a sound-styled zero-width character
function soundFakedownToTag(text) {
	// Make sure the "&&"s are properly paired
	if ((text.match(/&&/g) ?? []).length % 2 !== 0) {
		return text;
	}

	// Swap each "&&" pair with a sound style and attach it to a zero-width character
	let start = text.indexOf('&&');
	let end = 0;
	while (start !== -1) {
		end = text.indexOf('&&', start + 1);
		text = `${text.slice(0, start)}{sound=${text.slice(start + 2, end)}}${EMPTY_CHAR}{-sound}${text.slice(end + 2)}`;
		start = text.indexOf('&&');
	}

	return text;
}

// Make sound dialogue stop playing when the dialogue ui is closed
wrap.after(DialoguePlayback.prototype, 'setPage', page => {
	if (!window.PLAYBACK?.dialoguePlayback.currentPage) {
		window.PLAYBACK?.stopSound('dialogue');
	}
});
wrap.after(DialoguePlayback.prototype, 'cancel', () => {
	window.PLAYBACK?.stopSound('dialogue');
});

})();
