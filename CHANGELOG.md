# [8.3.0](https://github.com/seleb/bipsi-hacks/compare/v8.2.1...v8.3.0) (2024-06-02)


### Features

* add `room overlays` plugin ([#42](https://github.com/seleb/bipsi-hacks/issues/42)) ([e602658](https://github.com/seleb/bipsi-hacks/commit/e602658a71d2cc0501c078a1d1f1a2fb86975efe))

## [8.2.1](https://github.com/seleb/bipsi-hacks/compare/v8.2.0...v8.2.1) (2023-12-11)


### Bug Fixes

* **tall character:** Don't crash when no event has the `is-head` tag ([#39](https://github.com/seleb/bipsi-hacks/issues/39)) ([310d653](https://github.com/seleb/bipsi-hacks/commit/310d653a5041ee4682ecc2bc9e125bd7a8282801))

# [8.2.0](https://github.com/seleb/bipsi-hacks/compare/v8.1.1...v8.2.0) (2023-10-10)


### Features

* **move animations:** if an event has no move-animation fields, don't manage it's graphic state. ([#37](https://github.com/seleb/bipsi-hacks/issues/37)) ([f7d3292](https://github.com/seleb/bipsi-hacks/commit/f7d3292d52480a6262bb02fe4d7fbd2e5b4f1dec))

## [8.1.1](https://github.com/seleb/bipsi-hacks/compare/v8.1.0...v8.1.1) (2023-10-10)


### Bug Fixes

* **editor fields start as tags:** new field defaulting to "tag" type has data of true ([#36](https://github.com/seleb/bipsi-hacks/issues/36)) ([7a26afd](https://github.com/seleb/bipsi-hacks/commit/7a26afdb62af168ad186cb9d9bc13fc78e3d74b4))

# [8.1.0](https://github.com/seleb/bipsi-hacks/compare/v8.0.0...v8.1.0) (2023-09-06)


### Features

* add `one move per press` plugin ([#35](https://github.com/seleb/bipsi-hacks/issues/35)) ([e163ccc](https://github.com/seleb/bipsi-hacks/commit/e163ccc8db88edddcdbbd809f3f19f88ab777f92))

# [8.0.0](https://github.com/seleb/bipsi-hacks/compare/v7.0.1...v8.0.0) (2023-09-06)


### Features

* **sounds:** allows listening for sound end ([#34](https://github.com/seleb/bipsi-hacks/issues/34)) ([8ff963e](https://github.com/seleb/bipsi-hacks/commit/8ff963e942a9e3d48c4cb95f1464f54e0f176f13))


### BREAKING CHANGES

* **sounds:** `sounds` now replaces bipsi's PLAY_MUSIC system instead of working alongside it

## [7.0.1](https://github.com/seleb/bipsi-hacks/compare/v7.0.0...v7.0.1) (2023-08-18)


### Bug Fixes

* **editor fullscreen:** error triggering when game is published ([#32](https://github.com/seleb/bipsi-hacks/issues/32)) ([3dddd37](https://github.com/seleb/bipsi-hacks/commit/3dddd379573df4da0e84485c16bbf9bbf3716e54))

# [7.0.0](https://github.com/seleb/bipsi-hacks/compare/v6.0.0...v7.0.0) (2023-08-18)


### Features

* **dialogue portraits:** dialogue preview in the editor, updated order of config, added support for using `-` to clear state ([#30](https://github.com/seleb/bipsi-hacks/issues/30)) ([2878b0a](https://github.com/seleb/bipsi-hacks/commit/2878b0a1a58d81125916147e12ea41a00a981979))


### BREAKING CHANGES

* **dialogue portraits:** `default-border-palette-color`, `scale`, `default-side`, and `margin` configs changed from `text` to `json`

# [6.0.0](https://github.com/seleb/bipsi-hacks/compare/v5.0.1...v6.0.0) (2023-08-18)


### Features

* **dialogue choices:** Added a "sayStyle" option ([#31](https://github.com/seleb/bipsi-hacks/issues/31)) ([2bc01fa](https://github.com/seleb/bipsi-hacks/commit/2bc01fa2760ef9d1835a95f9a77b902b5e08325f))


### BREAKING CHANGES

* **dialogue choices:** `BipsiPlayback.prototype.sayChoices` and `SCRIPTING_FUNCTIONS.SAY_CHOICES` function signature modified: `sayStyle` was introduced as new third parameter, shifting `extraLineCount` and `event` over to fourth and fifth parameters

## [5.0.1](https://github.com/seleb/bipsi-hacks/compare/v5.0.0...v5.0.1) (2023-08-12)


### Bug Fixes

* **move animations:** doc polish ([#29](https://github.com/seleb/bipsi-hacks/issues/29)) ([9191bc8](https://github.com/seleb/bipsi-hacks/commit/9191bc8097915c327a931c39044261c5922631b5))

# [5.0.0](https://github.com/seleb/bipsi-hacks/compare/v4.12.0...v5.0.0) (2023-08-12)


### Bug Fixes

* **move animations:** Polish for docs and code ([#28](https://github.com/seleb/bipsi-hacks/issues/28)) ([7067e3c](https://github.com/seleb/bipsi-hacks/commit/7067e3c29091d8f50a77c23abe9ffb04688000e4))


### BREAKING CHANGES

* **move animations:** `initSmoothMoveAnimationForEvent` -> `initMoveAnimationForEvent`

# [4.12.0](https://github.com/seleb/bipsi-hacks/compare/v4.11.0...v4.12.0) (2023-08-12)


### Features

* add `smooth move` and `move animations` hacks ([#27](https://github.com/seleb/bipsi-hacks/issues/27)) ([1521d18](https://github.com/seleb/bipsi-hacks/commit/1521d18d7dbfb67e85fdeb6b2280b492edabd4c7))

# [4.11.0](https://github.com/seleb/bipsi-hacks/compare/v4.10.1...v4.11.0) (2023-08-09)


### Features

* add `dialogue-choices` hack ([#26](https://github.com/seleb/bipsi-hacks/issues/26)) ([0d20660](https://github.com/seleb/bipsi-hacks/commit/0d20660a0ab4de946ef8a905e92b0713067897fb))

## [4.10.1](https://github.com/seleb/bipsi-hacks/compare/v4.10.0...v4.10.1) (2023-08-08)


### Bug Fixes

* **dialogue portraits:** if an event isn't specified in a call to runJS()… ([#25](https://github.com/seleb/bipsi-hacks/issues/25)) ([4042490](https://github.com/seleb/bipsi-hacks/commit/40424908437077628bd265b00f692410680efc1d))

# [4.10.0](https://github.com/seleb/bipsi-hacks/compare/v4.9.0...v4.10.0) (2023-08-08)


### Features

* add `computed fields` hack ([#22](https://github.com/seleb/bipsi-hacks/issues/22)) ([70724fb](https://github.com/seleb/bipsi-hacks/commit/70724fb78a4ef7e6fba7db124693ab3f7195bfa2))

# [4.9.0](https://github.com/seleb/bipsi-hacks/compare/v4.8.1...v4.9.0) (2023-08-08)


### Features

* add `fullscreen button` hack ([#21](https://github.com/seleb/bipsi-hacks/issues/21)) ([51a18d1](https://github.com/seleb/bipsi-hacks/commit/51a18d1cff0af8b589017179fc94c868b655e361))

## [4.8.1](https://github.com/seleb/bipsi-hacks/compare/v4.8.0...v4.8.1) (2023-08-08)


### Bug Fixes

* **adjacent rooms:** non-jsdoc header ([8af30b5](https://github.com/seleb/bipsi-hacks/commit/8af30b50c147c14864af8eda04273b5f8e8717fc)), closes [#24](https://github.com/seleb/bipsi-hacks/issues/24)

# [4.8.0](https://github.com/seleb/bipsi-hacks/compare/v4.7.0...v4.8.0) (2023-08-08)


### Features

* add `event bound images` hack ([#23](https://github.com/seleb/bipsi-hacks/issues/23)) ([cfe78a0](https://github.com/seleb/bipsi-hacks/commit/cfe78a01e16f88d664bd8572db03a68b72790da7))

# [4.7.0](https://github.com/seleb/bipsi-hacks/compare/v4.6.1...v4.7.0) (2023-08-07)


### Features

* add `adjacent rooms` hack ([#19](https://github.com/seleb/bipsi-hacks/issues/19)) ([17bd4d2](https://github.com/seleb/bipsi-hacks/commit/17bd4d2d3e565e14b89abe73c95f730f82b0ee35))

## [4.6.1](https://github.com/seleb/bipsi-hacks/compare/v4.6.0...v4.6.1) (2023-08-07)


### Bug Fixes

* **editor fullscreen:** missing CONFIG parameter field causes console error log. ([#18](https://github.com/seleb/bipsi-hacks/issues/18)) ([b0a52e2](https://github.com/seleb/bipsi-hacks/commit/b0a52e225c319288c81904303880b867221f04a1))

# [4.6.0](https://github.com/seleb/bipsi-hacks/compare/v4.5.0...v4.6.0) (2023-07-25)


### Features

* add `editor name column maxed` hack ([#17](https://github.com/seleb/bipsi-hacks/issues/17)) ([16b4ed5](https://github.com/seleb/bipsi-hacks/commit/16b4ed5ca30c40edcf225340768e25c93837f182))

# [4.5.0](https://github.com/seleb/bipsi-hacks/compare/v4.4.0...v4.5.0) (2023-07-25)


### Features

* add `editor fields start as tags` hack ([#16](https://github.com/seleb/bipsi-hacks/issues/16)) ([cc3e2c2](https://github.com/seleb/bipsi-hacks/commit/cc3e2c2691e76644ab19b3db85a654cf6ebd308e))

# [4.4.0](https://github.com/seleb/bipsi-hacks/compare/v4.3.1...v4.4.0) (2023-07-23)


### Features

* add `editor fullscreen` plugin ([#14](https://github.com/seleb/bipsi-hacks/issues/14)) ([dae5c23](https://github.com/seleb/bipsi-hacks/commit/dae5c23275817cf591d9dbfe607146da5ba8780d))

## [4.3.1](https://github.com/seleb/bipsi-hacks/compare/v4.3.0...v4.3.1) (2023-07-17)


### Bug Fixes

* **sounds:** if "touch-sound" is text & doesn't match library audio, fail silently ([#12](https://github.com/seleb/bipsi-hacks/issues/12)) ([b928440](https://github.com/seleb/bipsi-hacks/commit/b9284401d48da975890c91e2ec4b57133b7c6a27))

# [4.3.0](https://github.com/seleb/bipsi-hacks/compare/v4.2.1...v4.3.0) (2023-07-14)


### Features

* **sounds:** `touch-sound` field can now be text ([#11](https://github.com/seleb/bipsi-hacks/issues/11)) ([8399258](https://github.com/seleb/bipsi-hacks/commit/8399258cd09eb888cef2bd5ca92184efb6aba0c2))

## [4.2.1](https://github.com/seleb/bipsi-hacks/compare/v4.2.0...v4.2.1) (2023-07-11)


### Bug Fixes

* **sounds:** play immediately on touch, avoid restarting loops, better invalid volume checks ([14cd556](https://github.com/seleb/bipsi-hacks/commit/14cd556d6ac53ae8bcb129b1e69496ee86dc92f1)), closes [#10](https://github.com/seleb/bipsi-hacks/issues/10)

# [4.2.0](https://github.com/seleb/bipsi-hacks/compare/v4.1.0...v4.2.0) (2023-07-11)


### Features

* add `sounds` and `sound dialogue` hacks ([#8](https://github.com/seleb/bipsi-hacks/issues/8)) ([f1ce312](https://github.com/seleb/bipsi-hacks/commit/f1ce3120258dd07a01b5c7e4fc9561cac6fc2d24)), closes [#5](https://github.com/seleb/bipsi-hacks/issues/5)

# [4.1.0](https://github.com/seleb/bipsi-hacks/compare/v4.0.0...v4.1.0) (2023-07-11)


### Features

* **dialogue portraits:** expose current event, support changing within a single page ([#7](https://github.com/seleb/bipsi-hacks/issues/7)) ([35536a5](https://github.com/seleb/bipsi-hacks/commit/35536a567f25b616ffafde0cfcd7bfe1bdbbba59))

# [4.0.0](https://github.com/seleb/bipsi-hacks/compare/v3.0.2...v4.0.0) (2023-07-11)


### Bug Fixes

* adjusted plugin file naming ([#6](https://github.com/seleb/bipsi-hacks/issues/6)) ([d2948b1](https://github.com/seleb/bipsi-hacks/commit/d2948b1ccce19e846f6d52cdd41385ab9bfeb862)), closes [#5](https://github.com/seleb/bipsi-hacks/issues/5)


### BREAKING CHANGES

* `dialogue-portraits` renamed to `dialogue portraits`
* `mirrored-event-graphics` renamed to `mirrored event
graphics`

Co-authored-by: Jonathan Heard <jon.heard.tutor@gmail.com>

## [3.0.2](https://github.com/seleb/bipsi-hacks/compare/v3.0.1...v3.0.2) (2023-07-08)


### Bug Fixes

* remove redundant versions ([c39e7e4](https://github.com/seleb/bipsi-hacks/commit/c39e7e4d7da51a381eaad7105f90c705dc44ca7c))

## [3.0.1](https://github.com/seleb/bipsi-hacks/compare/v3.0.0...v3.0.1) (2023-07-08)


### Bug Fixes

* `dist` not being cleaned before build ([f078395](https://github.com/seleb/bipsi-hacks/commit/f078395bc96422dc721745bcde778fb77bf28168))
* remove unused `index` ([e7728e2](https://github.com/seleb/bipsi-hacks/commit/e7728e2c5c27b70d1bca946f20919285c42dca8f))

# [3.0.0](https://github.com/seleb/bipsi-hacks/compare/v2.2.1...v3.0.0) (2023-07-08)


### Features

* support file-based portraits ([71b1acf](https://github.com/seleb/bipsi-hacks/commit/71b1acf8518fb323c6c33c7ba7942eddab74303d))


### BREAKING CHANGES

* `speech-portraits-from-tiles` hack renamed to `dialogue-portraits`, and now supports files

## [2.2.1](https://github.com/seleb/bipsi-hacks/compare/v2.2.0...v2.2.1) (2023-07-07)


### Bug Fixes

* minor issues with "mirrored events" and "speech portraits" hacks ([7e2e5e4](https://github.com/seleb/bipsi-hacks/commit/7e2e5e48fa2821d56a6d142a60fccc1da529dac8))

# [2.2.0](https://github.com/seleb/bipsi-hacks/compare/v2.1.0...v2.2.0) (2023-07-06)


### Features

* add "mirrored events" and "speech portraits" hacks ([7f8f647](https://github.com/seleb/bipsi-hacks/commit/7f8f6479b0e797d55625b584b34b9e7ff044d4fe))

# [2.1.0](https://github.com/seleb/bipsi-hacks/compare/v2.0.0...v2.1.0) (2023-07-01)


### Features

* add tall character plugin ([1b02309](https://github.com/seleb/bipsi-hacks/commit/1b023098ff9006dad05fae2d504e7bf025b3b6a3)), closes [#1](https://github.com/seleb/bipsi-hacks/issues/1)

# [2.0.0](https://github.com/seleb/bipsi-hacks/compare/v1.0.1...v2.0.0) (2022-02-06)


### Bug Fixes

* use modern js ([0e20d53](https://github.com/seleb/bipsi-hacks/commit/0e20d5384615f90ec2f2ffe57b00cba19116025b))


### Features

* use bipsi plugin options ([24022f1](https://github.com/seleb/bipsi-hacks/commit/24022f186342e3f51ac81712c23e97c2969e85ec))


### BREAKING CHANGES

* uses bipsi's `//!CONFIG` syntax to provide options + defaults instead of expecting you to modify the hack's main javascript field

Co-Authored-By: mark wonnacott <527158+ragzouken@users.noreply.github.com>

## [1.0.1](https://github.com/seleb/bipsi-hacks/compare/v1.0.0...v1.0.1) (2022-02-03)


### Bug Fixes

* replace empty fragment shader with `undefined` to avoid runtime error ([54de6de](https://github.com/seleb/bipsi-hacks/commit/54de6ded936a9223d17a243e114fd4cf8ea9674d))

# 1.0.0 (2022-02-03)


### Features

* initial build ([f39a657](https://github.com/seleb/bipsi-hacks/commit/f39a657b55078b70403a88d4bc384d8690a63d33))
