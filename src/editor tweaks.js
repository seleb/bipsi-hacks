/*
👣
@file editor tweaks
@summary Various adjustments to the editor that are too minor for individual plugins.  Each tweak is togglable.
@license MIT
@author Violgamba (Jon Heard)

@description
Various editor tweaks, or adjustments to the editor that are too minor for individual plugins.

This plugin's event contains a togglable text field for each tweak.  The field defaults to "true",
and can be set to "false" to disable the tweak.
NOTE: togglable text fields were chosen over tag fields for easier toggling.

Below are a list of the tweaks, starting with their togglable field.  Note that this list is subject
to change as new tweaks are added to this plugin.

TWEAKS LIST
- tweak--new-plugins-have-filename-tag - Each imported plugin's fields will begin with a tag named
	after the filename the plugin was loaded from.  This lets one quickly identify plugin events.
- tweak--new-fields-default-to-tag-type - New fields begin as "tag" types, rather than "text" types.
	This is useful for users who add tag events more frequently than text events.
- tweak--tileset-export-ordered-by-tile - When the tileset is exported, the graphics are re-ordered
	to match the tile order set in the editor.  This lets the user define the export order and makes
	sure that all animation frames are consecutive.
- tweak--save-button-shows-when-saved - When the game is saved, the save button dims until a change
	occurs, wherein it turns back to yellow.  If the change is undone, the save button dims again.
	This lets one know when the editor is in a saved state, removing the need for redundant save
	clicks to be sure.  NOTE: the button can still be clicked while dimmed.
- tweak--field-name-column-maximized - This widens the name column of the fields list ui.  Useful if
	using long field names.
- tweak--editing-hotkeys - 'delete', 'ctrl-c', 'ctrl-v' & 'ctrl-x' work as expected on events,
	fields & tiles right after clicking them.  Arrow keys move events, fields & tiles around right
	after clicking them.  'ctrl-shift-z' triggers REDO, rather than UNDO.


HOW TO USE:
1. Import this plugin into your game.  Note that the editor is altered by all the tweaks in this plugin.
2. Run through the config fields in this plugin's event.  Set any unwanted tweaks to 'false', then save the game.
2. Refresh the page.  Note that the tweaks that are set to false don't alter the editor.


// See @description for details on these fields
//!CONFIG tweak--new-plugins-have-filename-tag (text) "true"
//!CONFIG tweak--new-fields-default-to-tag-type (text) "true"
//!CONFIG tweak--tilset-export-ordered-by-tile (text) "true"
//!CONFIG tweak--save-button-shows-when-saved (text) "true"
//!CONFIG tweak--field-name-column-maximized (text) "true"
//!CONFIG tweak--editing-hotkeys (text) "true"
*/

//! CODE_EDITOR

function setupNewPluginsHaveFilenameTag() {
	// Redoing the "create-event-plugin-file" action requires copying a bunch of helper functions
	function parseOrNull(json) {
		try {
			return JSON.parse(json);
		} catch {
			return null;
		}
	}
	function fieldsFromPluginCode(code) {
		const regex = /\/\/!CONFIG\s+([\w-]+)\s+\(([\w-]+)\)\s*(.*)/g;
		const fields = Array.from(code.matchAll(regex)).map(([, key, type, json]) => ({ key, type, data: parseOrNull(json) }));
		return fields;
	}
	ui.actions.get('create-event-plugin-file').detach();
	// Here's the modified function
	ui.action('create-event-plugin-file', async () => {
		const [file] = await maker.pickFiles('application/javascript');
		if (!file) return;

		const js = await maker.textFromFile(file);
		const fields = [
			// Modification - added this line
			{ key: file.name, type: 'tag', data: true },
			{ key: 'is-plugin', type: 'tag', data: true },
			{ key: 'plugin-order', type: 'json', data: 0 },
			{ key: 'plugin', type: 'javascript', data: js },
			...fieldsFromPluginCode(js),
		];
		const id = nextEventId(window.EDITOR.stateManager.present);

		window.EDITOR.createEvent(fields);

		// Run EDITOR code for the new plugin
		const editorCode = window.getRunnableJavascriptForOnePlugin({ id, fields }, ['EDITOR']);
		new Function(editorCode)();
	});

	// Manually add this plugin's filename to its own event (hopefully the filename doesn't change)
	CONFIG.fields.unshift({ key: 'EditorTweaks.js', type: 'tag', data: true });

	// Prevent repeating this setup
	window.EDITOR.loadedEditorPlugins ||= new Set();
	window.EDITOR.loadedEditorPlugins.add('editorTweaks.new-plugins-have-filename-tag');
}
if (!window.EDITOR.loadedEditorPlugins?.has('editorTweaks.new-plugins-have-filename-tag') && FIELD(CONFIG, 'tweak--new-plugins-have-filename-tag', 'text').trim() !== 'false') {
	setupNewPluginsHaveFilenameTag();
}

function setupNewFieldsDefaultToTagType() {
	EventEditor.prototype.addField = async function addField() {
		this.editor.stateManager.makeChange(async data => {
			const { event } = this.getSelections(data);
			event.fields.push({ key: 'new field', type: 'tag', data: true });
			this.setSelectedIndex(event.fields.length - 1);
		});
	};

	// Prevent repeating this setup
	window.EDITOR.loadedEditorPlugins ||= new Set();
	window.EDITOR.loadedEditorPlugins.add('editorTweaks.new-fields-default-to-tag-type');
}
if (!window.EDITOR.loadedEditorPlugins?.has('editorTweaks.new-fields-default-to-tag-type') && FIELD(CONFIG, 'tweak--new-fields-default-to-tag-type', 'text').trim() !== 'false') {
	setupNewFieldsDefaultToTagType();
}

function setupTilsetExportOrderedByTile() {
	BipsiEditor.prototype.exportTileset = async function exportTileset() {
		return new Promise((resolve, reject) => {
			const { tileset: src } = window.EDITOR.getSelections();
			const dst = window.createRendering2D(src.canvas.width, src.canvas.height);
			let dstIndex = 0;
			this.stateManager.present.tiles.forEach(tile => {
				tile.frames.forEach(frameId => {
					const { x: sx, y: sy, size: tileSize } = window.getTileCoords(src.canvas, frameId);
					const { x: dx, y: dy } = window.getTileCoords(dst.canvas, dstIndex);
					dst.drawImage(src.canvas, sx, sy, tileSize, tileSize, dx, dy, tileSize, tileSize);
					dstIndex++;
				});
			});
			const name = 'bipsi-tileset.png';
			dst.canvas.toBlob(blob => {
				maker.saveAs(blob, name);
				resolve();
			});
		});
	};

	// Prevent repeating this setup
	window.EDITOR.loadedEditorPlugins ||= new Set();
	window.EDITOR.loadedEditorPlugins.add('editorTweaks.tilset-export-ordered-by-tile');
}
if (!window.EDITOR.loadedEditorPlugins?.has('editorTweaks.tilset-export-ordered-by-tile') && FIELD(CONFIG, 'tweak--tilset-export-ordered-by-tile', 'text').trim() !== 'false') {
	setupTilsetExportOrderedByTile();
}

function setupSaveButtonShowsWhenSaved() {
	let savedHistoryIndex = -1;

	// Find save button
	let saveButton = document.getElementById('undo-row');
	for (let i = 0; i < saveButton.childElementCount; i++) {
		if (saveButton.children[i].name === 'save') {
			saveButton = saveButton.children[i];
			break;
		}
	}
	if (saveButton.name !== 'save') {
		console.error('editor tweaks.saveButtonShowsWhenSaved - save button not found.');
		return;
	}

	// Tweak logic
	const refreshSavedIndicator = () => {
		if (window.EDITOR.stateManager.index === savedHistoryIndex) {
			saveButton.style.opacity = 0.5;
		} else {
			saveButton.style.opacity = 1.0;
		}
	};
	const onSave = () => {
		savedHistoryIndex = window.EDITOR.stateManager.index;
		refreshSavedIndicator();
	};

	// Append logic to the end of various save/history changing functions
	wrap.after(BipsiEditor.prototype, 'save', () => {
		if (window.EDITOR.unsavedChanges) {
			console.error('editor tweaks.saveButtonShowsWhenSaved - unsaved changes after saving');
			return;
		}
		onSave();
	});
	wrap.after(maker.StateManager.prototype, 'loadBundle', onSave);
	wrap.after(maker.StateManager.prototype, 'copyFrom', onSave);
	wrap.after(maker.StateManager.prototype, 'copyPresentFrom', onSave);
	wrap.after(maker.StateManager.prototype, 'makeCheckpoint', refreshSavedIndicator);
	wrap.after(maker.StateManager.prototype, 'makeChange', refreshSavedIndicator);
	wrap.after(maker.StateManager.prototype, 'undo', refreshSavedIndicator);
	wrap.after(maker.StateManager.prototype, 'redo', refreshSavedIndicator);

	// If app is first starting, set the save indicator
	if (window.EDITOR.stateManager.history.length === 1) {
		onSave();
	}

	// Prevent repeating this setup
	window.EDITOR.loadedEditorPlugins ||= new Set();
	window.EDITOR.loadedEditorPlugins.add('editorTweaks.save-button-shows-when-saved');
}
if (!window.EDITOR.loadedEditorPlugins?.has('editorTweaks.save-button-shows-when-saved') && FIELD(CONFIG, 'tweak--save-button-shows-when-saved', 'text').trim() !== 'false') {
	setupSaveButtonShowsWhenSaved();
}

function setupFieldNameColumnMaximized() {
	function addCssRuleToEnd(rule) {
		const lastSheet = document.styleSheets[document.styleSheets.length - 1];
		const newRuleIndex = lastSheet.cssRules.length;
		lastSheet.insertRule(rule, newRuleIndex);
	}
	addCssRuleToEnd('.event-line > select { flex: 0; padding: 0; padding-right: 0.5em; }');
	addCssRuleToEnd('.event-line { padding: 0; padding-right: .25em; gap: 0; }');
	addCssRuleToEnd('.event-line > input { padding-left: 0.3em; padding-right: 0;');

	// Prevent repeating this setup
	window.EDITOR.loadedEditorPlugins ||= new Set();
	window.EDITOR.loadedEditorPlugins.add('editorTweaks.field-name-column-maximized');
}
if (!window.EDITOR.loadedEditorPlugins?.has('editorTweaks.field-name-column-maximized') && FIELD(CONFIG, 'tweak--field-name-column-maximized', 'text').trim() !== 'false') {
	setupFieldNameColumnMaximized();
}

function setupEditingHotkeys() {
	const DIRECTIONS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
	const FOCUS = { EVENT: 1, FIELD: 2, TILE: 3 };
	let currentFocus = 0;
	let clipboardForFields = null;
	const clipboardForTiles = window.createRendering2D(TILE_PX * 2, TILE_PX);
	let clipboardForTilesFrameCount = 0;

	// Mouse down over a non-handled control, clear hotkey focus
	document.addEventListener('mousedown', () => {
		currentFocus = 0;
	});

	// Handled controls are focused on click
	document.getElementById('tile-map-paint').addEventListener('click', () => {
		if (window.EDITOR.roomPaintTool.value === 'events') {
			currentFocus = FOCUS.EVENT;
		}
	});
	document.getElementById('field-names').nextElementSibling.addEventListener('click', () => {
		if (window.EDITOR.roomPaintTool.value === 'events') {
			currentFocus = FOCUS.FIELD;
		}
	});
	document.getElementById('tile-select').addEventListener('click', () => {
		if (window.EDITOR.roomPaintTool.value === 'tile') {
			currentFocus = FOCUS.TILE;
		}
	});

	function copyTile() {
		const { tile, tileset } = window.EDITOR.getSelections();
		clipboardForTilesFrameCount = tile.frames.length;
		clipboardForTiles.clearRect(0, 0, TILE_PX * 2, TILE_PX);
		for (let i = 0; i < clipboardForTilesFrameCount; i++) {
			const { x: sx, y: sy } = window.getTileCoords(tileset.canvas, tile.frames[i]);
			clipboardForTiles.drawImage(tileset.canvas, sx, sy, TILE_PX, TILE_PX, i * TILE_PX, 0, TILE_PX, TILE_PX);
		}
	}
	function pasteTile() {
		// Modified from 'window.EDITOR.duplicateTile()'
		window.EDITOR.stateManager.makeChange(async data => {
			const { tileIndex, tileset } = window.EDITOR.getSelections(data);
			const id = nextTileId(data);
			const frames = [];

			data.tiles.splice(tileIndex, 0, { id, frames });
			for (let i = 0; i < clipboardForTilesFrameCount; i++) {
				frames.push(window.findFreeFrame(data.tiles));
				window.resizeTileset(tileset, data.tiles);
				const frame = window.copyTile(clipboardForTiles, i);
				window.drawTile(tileset, frames[i], frame);
			}
		});
	}

	// Handle the hotkeys.  Using "window" to override bipsi's normal hotkey behaviour.
	document.body.addEventListener('keydown', e => {
		if (e.code === 'KeyZ' && e.ctrlKey) {
			// Implement ctrl-shift-z as redo.  Also, re-implement undo to allow for key-repeat.
			if (e.shiftKey) {
				window.EDITOR.actions.redo.invoke();
			} else {
				window.EDITOR.actions.undo.invoke();
			}
			e.stopPropagation(); // Block original undo logic
		} else if (currentFocus) {
			if (e.code === 'Delete') {
				try {
					switch (currentFocus) {
						case FOCUS.EVENT:
							window.EDITOR.deleteSelectedEvent();
							break;
						case FOCUS.FIELD:
							window.EDITOR.eventEditor.removeField();
							break;
						case FOCUS.TILE:
							window.EDITOR.deleteTile();
							break;
						default:
					}
				} catch (err) {
					console.error(err);
				}
			} else if (e.code === 'KeyC' && e.ctrlKey) {
				try {
					switch (currentFocus) {
						case FOCUS.EVENT:
							if (!EDITOR.selectedEventId) return;
							window.EDITOR.copySelectedEvent();
							// Disable other copy types
							clipboardForFields = null;
							clipboardForTilesFrameCount = 0;
							break;
						case FOCUS.FIELD: {
							clipboardForFields = COPY(window.EDITOR.eventEditor.getSelections().field);
							// Disable other copy types
							window.EDITOR.actions.pasteEvent.disabled = true;
							clipboardForTilesFrameCount = 0;
							break;
						}
						case FOCUS.TILE:
							copyTile();
							// Disable other copy types
							window.EDITOR.actions.pasteEvent.disabled = true;
							clipboardForFields = null;
							break;
						default:
					}
				} catch (err) {
					console.error(err);
				}
			} else if (e.code === 'KeyX' && e.ctrlKey) {
				try {
					switch (currentFocus) {
						case FOCUS.EVENT:
							if (!EDITOR.selectedEventId) return;
							window.EDITOR.copySelectedEvent();
							window.EDITOR.deleteSelectedEvent();
							// Disable other copy types
							clipboardForFields = null;
							clipboardForTilesFrameCount = 0;
							break;
						case FOCUS.FIELD: {
							clipboardForFields = COPY(window.EDITOR.eventEditor.getSelections().field);
							window.EDITOR.eventEditor.removeField();
							// Disable other copy types
							window.EDITOR.actions.pasteEvent.disabled = true;
							clipboardForTilesFrameCount = 0;
							break;
						}
						case FOCUS.TILE:
							copyTile();
							window.EDITOR.deleteTile();
							// Disable other copy types
							window.EDITOR.actions.pasteEvent.disabled = true;
							clipboardForFields = null;
							break;
						default:
					}
				} catch (err) {
					console.error(err);
				}
			} else if (e.code === 'KeyV' && e.ctrlKey) {
				try {
					switch (currentFocus) {
						case FOCUS.EVENT:
							if (window.EDITOR.actions.pasteEvent.disabled) return; // Don't paste if paste button isn't clickable
							window.EDITOR.pasteSelectedEvent();
							break;
						case FOCUS.FIELD: {
							if (!clipboardForFields) return;
							// Modified from "EventEditor.addField()" as we also need to set the new field's values
							window.EDITOR.stateManager.makeChange(async data => {
								const { event, fieldIndex } = window.EDITOR.eventEditor.getSelections(data);
								event.fields.splice(fieldIndex, 0, COPY(clipboardForFields));
							});
							break;
						}
						case FOCUS.TILE:
							if (clipboardForTilesFrameCount === 0) return;
							pasteTile();
							break;
						default:
					}
				} catch (err) {
					console.error(err);
				}
			} else if (DIRECTIONS[e.code]) {
				try {
					const d = DIRECTIONS[e.code];
					switch (currentFocus) {
						case FOCUS.EVENT: {
							const { event } = window.EDITOR.getSelections();
							if (!event) return;
							const newPosition = [
								Math.max(0, Math.min(ROOM_SIZE - 1, event.position[0] + d[0])),
								Math.max(0, Math.min(ROOM_SIZE - 1, event.position[1] + d[1])),
							];
							if (newPosition[0] !== event.position[0] || newPosition[1] !== event.position[1]) {
								window.EDITOR.stateManager.makeChange(async data => {
									const eventToModify = window.findEventById(data, event.id);
									[eventToModify.position[0], eventToModify.position[1]] = newPosition;
									window.EDITOR.selectedEventCell = { x: newPosition[0], y: newPosition[1] };
								});
							}
							break;
						}
						case FOCUS.FIELD:
							window.EDITOR.eventEditor.shiftField(d[0] === -1 || d[1] === -1 ? -1 : 1);
							break;
						case FOCUS.TILE: {
							e.preventDefault(); // These are radio buttons with focus that changes with arrows.  Block that.
							const presentData = window.EDITOR.stateManager.present;
							const { tileIndex: startIndex } = window.EDITOR.getSelections(presentData);
							// Prevent wrap-around
							if ((startIndex % 9 === 0 && d[0] === -1) || (startIndex % 9 === 8 && d[0] === 1)) return;
							let endIndex = startIndex + d[0] + d[1] * 9;
							if (endIndex < 0 || endIndex > presentData.tiles.length - 1) {
								endIndex = startIndex;
							}
							if (endIndex !== startIndex) {
								window.EDITOR.stateManager.makeChange(async newData => {
									[newData.tiles[endIndex], newData.tiles[startIndex]] = [newData.tiles[startIndex], newData.tiles[endIndex]];
									window.EDITOR.tileBrowser.select.setValueSilent(endIndex);
									window.EDITOR.tileBrowser.select.inputs[endIndex].focus();
								});
							}
							break;
						}
						default:
					}
				} catch (err) {
					console.error(err);
				}
			}
		}
	});

	// Prevent repeating this setup
	window.EDITOR.loadedEditorPlugins ||= new Set();
	window.EDITOR.loadedEditorPlugins.add('editorTweaks.editing-hotkeys');
}
if (!window.EDITOR.loadedEditorPlugins?.has('editorTweaks.editing-hotkeys') && FIELD(CONFIG, 'tweak--editing-hotkeys', 'text').trim() !== 'false') {
	setupEditingHotkeys();
}
