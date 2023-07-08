# bipsi hacks

A collection of re-usable scripts for [candle](https://twitter.com/ragzouken)'s [bipsi](https://kool.tools/bipsi).

- [Contents](#contents)
- [How to use](#how-to-use)

## Contents

- 😴 [canvas replacement](/dist/canvas-replacement.js): WebGLazy bipsi integration
- 🖼 [dialogue portraits](/dist/dialogue-portraits.js): Add character portraits to dialogues
- 🎮 [gamepad input](/dist/gamepad-input.js): HTML5 gamepad support
- 🪞 [mirrored event graphics](/dist/mirrored-event-graphics.js): Flip events with the "mirrored" tag
- 👪 [tall character](/dist/tall-character.js): Make the character taller

## How to use

1. Download and save the script you want to use (make sure it's the version from the [`dist`](./dist) folder, not `src`)
2. Inside bipsi, under the `edit events` tab, select `import plugin`
   ![plugin import example](./readme-plugin-import-example.png)
3. Find and select the downloaded script
4. If a script has additional options, they will show up inside bipsi as editable fields on the new plugin event
