# bipsi hacks

A collection of re-usable scripts for [candle](https://twitter.com/ragzouken)'s [bipsi](https://kool.tools/bipsi).

- [Contents](#contents)
- [How to use](#how-to-use)

## Contents

- 🏘️ [adjacent rooms](/dist/adjacent-rooms.js): Auto-move between "adjacent" rooms by walking to room edges.
- 😴 [canvas replacement](/dist/canvas-replacement.js): WebGLazy bipsi integration
- 🧠 [computed fields](/dist/computed-fields.js): Use JavaScript to dynamically calculate fields that are normally static.
- ❔ [dialogue choices](/dist/dialogue-choices.js): Present options to the user via the "say" interface, then react to their choice.
- 🖼 [dialogue portraits](/dist/dialogue-portraits.js): Add character portraits to dialogues
- 🏷 [editor fields start as tags](/dist/editor-fields-start-as-tags.js): New fields begin as "tag" types, rather than "text" types.
- 🖥️ [editor fullscreen](/dist/editor-fullscreen.js): Add a ui button and hotkey to the editor to toggle fullscreen while playtesting the game.
- 🎪 [editor name column maxed](/dist/editor-name-column-maxed.js): Maximize the name column of the field list ui.
- 📎 [event bound images](/dist/event-bound-images.js): Display images relative to an event.  If the event moves, the image moves.
- 🖥️ [fullscreen button](/dist/fullscreen-button.js): Adds a fullscreen button to the lower-right of the game canvas.
- 🎮 [gamepad input](/dist/gamepad-input.js): HTML5 gamepad support
- 🪞 [mirrored event graphics](/dist/mirrored-event-graphics.js): Flip events with the "mirrored" tag
- 👣 [move animations](/dist/move-animations.js): ANY event can specify a tile for each direction and tiles for moving vs not moving.
- 🦥 [one move per press](/dist/one-move-per-press.js): Limits movement to a single move per key/button press or touch.
- 🫠 [smooth move](/dist/smooth-move.js): Add smooth movement to the avatar and to walking events.
- 💬 [sound dialogue](/dist/sound-dialogue.js): Add sound dialogue that plays alongside text dialogue.  Add VO to your game.
- 🔊 [sounds](/dist/sounds.js): Sound effects and music from audio files (mp3, wav).
- 👪 [tall character](/dist/tall-character.js): Make the character taller

## How to use

1. Download and save the script you want to use (make sure it's the version from the [`dist`](./dist) folder, not `src`)
2. Inside bipsi, under the `edit events` tab, select `import plugin`
   ![plugin import example](./readme-plugin-import-example.png)
3. Find and select the downloaded script
4. If a script has additional options, they will show up inside bipsi as editable fields on the new plugin event
