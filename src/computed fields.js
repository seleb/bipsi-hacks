/**
🔊
@file computed fields
@summary Use JavaScript to dynamically calculate fields that are normally static.
@license MIT
@author Violgamba (Jon Heard)

@description
Use JavaScript to dynamically calculate fields that are normally static.  This allows for events
that automatically change based on the game's state.  For example, an npc event's graphic field can
be computed based on whether a "food" event is in the room.  If the player removes the "food" event,
then the npc event's graphic automatically changes.

This plugin is useful if the game has many state changes and/or many events reacting to state changes.

The plugin field "computed-fields" lets you specify which fields can be computed.  See comments for
this field at the bottom of this header.


HOW TO USE - COMPUTE AVATAR'S GRAPHIC BASED ON WHICH SIDE OF THE ROOM THEY ARE ON
1. Import this plugin into a game with an open room to move about in.
2. Create two tiles for two avatar graphics.
3. Create two tile fields on the Avatar event.  Name them "graphic-1" and "graphic-2".  Set them to the tiles of step 2.
4. Change the avatar event's "graphic" field to be "javascript" type.  Set it to this code:
  let f = "graphic-1";
  if (EVENT.position[0] > 7) f = "graphic-2";
  let data = FIELD(EVENT, f, "tile");
  return { type: "tile", data: data };
5. Run the game and move the player horizontally across the room.  Note that it's graphic changes halfway across.
6. BONUS: Note that the avatar shows no graphic in the editor.  You can fix this by adding a "tile"
		type field named "graphic" anywhere below the field of step 4.  The editor will use this
		field for the graphic, while the playback will use the field of step 4 for the graphic.


HOW TO USE - COMPUTE TERRAIN PASSABILITY BASED ON WHETHER AN ITEM IS TAKEN
1. Import this plugin into a game with an open room to move about in.
2. Draw a "boots" tile for an item.
3. Draw a "spikes" tile for the floor.
4. Add a "message" event beside the player.  Set the "say" field to "I put on the boots.".  Add a tag
		field and name it "boots".  Add a tile field named "graphic" and set it to the boots tile of step 2.
5. Add a "character" event a few cells from the avatar.  Set its graphic to the spikes tile of step 3.  Erase the "say" field.
6. Change the "solid" tag field for the event of step 5 to javascript type.  Set it to this code:
  if (!FIND_EVENT("boots")) return;
  return { type: "tag", data: true };
7. Copy the event of step 5.  Paste it around the player and the boots so that they are surrounded.
8. Playtest the game.  Try to step over the spikes without getting the boots.  You should be blocked.  Walk over the boots and now the spikes should not block you.


HOW TO USE - DIALOGUE CHANGES BASED ON HOW LONG THE GAME IS PLAYED
1. Import this plugin into a game.
2. Add a character event near the avatar with a custom graphic tile.
3. Set the "say" field for the event of step 2 to a javascript type.  Set it to this code:
  CLEAR_EVENT_SAY_CACHE(EVENT);
  let data =
    "We've been here for " +
    PLAYBACK.frameCount +
    " ticks.";
  return { type: "dialogue", data: data };
4. Run the game and repeatedly interact with the event of step 2.  Note that the dialogue changes.
5. Also, not that the code begins with "CLEAR_EVENT_SAY_CACHE(EVENT);".  This is important to render
	the latest "say" value.  Without it the dialogue is cached, so won't show changes.


// A newline-delimited list of the names of fields that should be computed if their type is javascript.
//!CONFIG computed-fields (text) "graphic\nsay\nsolid\ncolors\ntouch-location"
*/

const computedFields = new Set((window.oneField(CONFIG, 'computed-fields', 'text')?.data || '').split('\n').filter(Boolean));

// Callable by calculated "say" fields for when they need to change their value.
window.CLEAR_EVENT_SAY_CACHE = event => {
	window.PLAYBACK.variables.forEach((value, key, map) => {
		if (key.startsWith(`SAY-ITERATORS/${event.id}`)) {
			map.delete(key);
		}
	});
};

// A variation of "runJS" which (A) is synchronous (B) returns the return-value of the code.
BipsiPlayback.prototype.runJSNonAsync = function runJSNonAsync(event, js, debug = false) {
	const defines = this.makeScriptingDefines(event);
	const names = Object.keys(defines).join(', ');
	const preamble = `const { ${names} } = this;\n`;

	try {
		const script = new Function('', preamble + js);
		return script.call(defines);
	} catch (e) {
		const long = `> SCRIPT ERROR "${e}"\n---\n${js}\n---`;
		this.log(long);

		const error = `SCRIPT ERROR:\n${e}`;
		this.showError(error);
		return undefined;
	}
};

// Setup the following functions AFTER game is started as they reference PLAYBACK, which isn't ready
// right away.
wrap.after(window, 'start', () => {
	window.oneField = function oneField(event, name, type = undefined) {
		// If the requested field is NOT a computed field, do original logic.
		if (!computedFields.has(name) && type === 'javascript') {
			return event.fields.find(field => field.key === name && field.type === (type ?? field.type));
		}

		// This IS a computed field.  Get the first field that matches either 'javascript' or the given type.
		let result = event.fields.find(field => field.key === name && (field.type === 'javascript' || field.type === (type ?? field.type)));
		if (result?.type === 'javascript') {
			const computedField = window.PLAYBACK.runJSNonAsync(event, result.data);
			if (computedField && computedField.type && computedField.data && computedField.type === (type ?? computedField.type)) {
				computedField.key = name;
				result = computedField;
			} else {
				result = undefined;
			}
		}
		return result;
	};

	window.allFields = function allFields(event, name, type = undefined) {
		// If the requested field s NOT a computed field, do original logic
		if (!computedFields.has(name) || type === 'javascript') {
			return event.fields.filter(field => field.key === name && field.type === (type ?? field.type));
		}

		// This IS a computed field.
		const result = [];
		event.fields.forEach(field => {
			// Only accept fields with the given name search
			if (field.key !== name) return;
			// Accept type matched fields
			if (field.type === (type ?? field.type)) {
				result.push(field);
			}
			// Accept computed fields
			else if (field.type === 'javascript') {
				const computedField = window.PLAYBACK.runJSNonAsync(event, field.data);
				if (computedField && computedField.type && computedField.data && (!type || computedField.type === type)) {
					computedField.key = name;
					result.push(computedField);
				}
			}
		});
		return result;
	};

	window.allEventTags = function allEventTags(event) {
		return event.fields
			.filter(field => {
				if (field.type === 'tag') {
					return true;
				}
				if (computedFields.has(field.key) && field.type === 'javascript') {
					return window.PLAYBACK.runJSNonAsync(event, field.data)?.type === 'tag';
				}
				return false;
			})
			.map(field => field.key);
	};
});
