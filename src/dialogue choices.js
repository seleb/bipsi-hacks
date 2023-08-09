/**
❔
@file dialogue choices
@summary Present options to the user via the "say" interface, then react to their choice.
@license MIT
@author Violgamba (Jon Heard)


@description
Present options to the user via the "say" interface, then react to their choice.  This can be useful
in a variety of ways, such as for creating dialogue trees or for picking settings.


HOW TO USE - BASIC CHOICE RESULTS:
1. Import this plugin into your game.
2. Add a message event to a corner of the room.  Remove it's "one-time" field.  Set it's "say" field
   to "hello from a location".
3. Create a character event near the avatar.  Remove it's "say" field.  Add a "trigger-location"
   field of location type.  Add an "after" field of javascript type.
4. Set the "trigger-location" field of step 3 to point to the position of the event from step 2.
5. Set the "after" field from step 3 to the following code:
  SAY_CHOICES("Make a choice...", [
    ["Try a function result", () => SAY("hello from a function")],
    ["Try a string result", "hello from a string"],
    ["Try a location result", FIELD(EVENT,"trigger-location","location")],
    ["Try a number result", 3],
  ]);
6. Playtest the game and bump the character event of step 3.  Note that a series of choices is
   presented that matches the code of step 5.  Try each choice.
7. Here are some notes on the code of step 5:
  - The first parameter defines the text that is shown above the choices.  Try setting it to null or
    an empty string.
  - The second parameter is an array of choices.  Up to 4 choices are readily supported. More are
    possible via the plugin's "choice-keys" parameter, though I suggest not overdoing this.
  - Each choice is an array of two values.  The first value is a string for what to show in the
    dialogue ui for this choice.
    The second is a "result" object defining what to do when the choice is selected.
  - Different types of "result" objects can work.  Support for some basic result types is natively
    setup, and more types can be added.  Below is a list of the natively supported result types.
	Note that the "number" type is NOT natively supported.  Thus, the fourth choice from the code of
	step 5 shows what happens when a non-supported result type is chosen.  Basically, nothing
	happens within the game, but a warning IS printed to the browser console.

NATIVELY SUPPORTED RESULT TYPES:
	- function - run the function when selected. (see the first choice from the code of step 5)
	- string - Display the string as a new dialogue when selected. (see the second choice from the code of step 5)
	- location object - Touch the event at the given location when selected. (see the third choice from the code of step 5)
	- location field - Treated just like "location object" above.
	- javascript field - Treated just like "function" above.


HOW TO USE - CUSTOM CHOICE RESULTS:
1. Import this plugin into your game.
2. Modify this plugin's "custon-choice-results" field by setting it to the following code:
  if (typeof CHOICE_RESULT === "number") {
    await SAY("" + CHOICE_RESULT);
    return true;
  }
3. Create a character event.  Remove it's "say" field.  Add an "after" field of javascript type.
4. Set the "after" field from step 3 to the following code:
  SAY_CHOICES("Choose a formula...", [
    ["2 * 2", 4],
    ["8 + 1", 9],
    ["3^2", 9],
  ]);
5. Playtest the game and bump the character event of step 3.  Note that a series of choices is
   presented that matches the code of step 4.  Each choice has a number result and that result is
   shown in a dialogue ui when the choice is selected.  Numbers aren't natively supported as choice
   results, but the plugin's "custom-choice-results" field adds support for them.


// An array of which keys trigger which choices.  The "char" property defines what is displayed for
// that choice in the dialogue ui.  The "codes" property is an array of key-event "key" values which
// will trigger that choice.
//!CONFIG choice-keys (json) [{"char":"↑","codes":["ArrowUp","w","W"]},{"char":"↓","codes":["ArrowDown","s","S"]},{"char":"←","codes":["ArrowLeft","a","A"]},{"char":"→","codes":["ArrowRight","d","D"]}]

// A javascript field that is called each time the user makes a choice.  It allows for custom
// choice-result reactions.  The javascript field is run and given the "CHOICE_RESULT" variable,
// which holds the result object of the choosen dialogue.  If the "custom-choice-results" code
// successfully handles a result, then it should return truthy, which will signal a short-circuit of
// all subsequent result-handling for that result.  If this plugin contains multiple javascript
// fields named "custom-choice-results", then each is run in order.
//!CONFIG custom-choice-results (javascript) ""

// Choice dialogues include a "preamble" text, which is shown above the choice texts.  This field
// determines how many blank lines to put between the preamble text and the choice texts.
//!CONFIG preamble-separation-count (text) "1"

// The dialogue system has a hardcoded text-line width.  However, if the width is changed (by
// another plugin, for example) then you can update this number to match.
//!CONFIG dialogue-line-width (text) "192"

// The dialogue system's font has a fixed character width.  However, if the width is changed (by
// another plugin, for example) then you can update this number to match.
//!CONFIG dialogue-character-width (text) "6"
*/

const CHOICE_KEYS = FIELD(CONFIG, 'choice-keys', 'json');
const CUSTOM_CHOICE_RESULT_HANDLERS = FIELDS(CONFIG, 'custom-choice-results', 'javascript');
const PREAMBLE_SEPARATION_COUNT = parseInt(FIELD(CONFIG, 'preamble-separation-count', 'text')?.trim(), 10) ?? 1;
const DIALOGUE_LINE_WIDTH = parseInt(FIELD(CONFIG, 'dialogue-line-width', 'text')?.trim(), 10) ?? 192;
const DIALOGUE_CHARACTER_WIDTH = parseInt(FIELD(CONFIG, 'dialogue-character-width', 'text')?.trim(), 10) ?? 6;

// Method to trigger a choices-dialogue
BipsiPlayback.prototype.sayChoices = function sayOptions(preamble, choices, extraLineCount = 0, event = undefined) {
	if (choices.length === 0) return undefined;
	const preambleLineCount = preamble ? this.calculateLineCountOfDialogueText(preamble) + PREAMBLE_SEPARATION_COUNT : 0;
	const choiceCount = Math.min(choices.length, CHOICE_KEYS.length);
	let dialogueText = preamble ? `${preamble}\n${'\n'.repeat(PREAMBLE_SEPARATION_COUNT)}` : '';
	for (let i = 0; i < choiceCount; i++) {
		const separatorText = i > 0 ? '\n' : '';
		dialogueText += `${separatorText}${CHOICE_KEYS[i].char} ${choices[i][0]}`;
	}
	// Wait for the next frame to set choiceResultOptions.  This prevents any prior keystroke from triggering a choice.
	setTimeout(() => {
		this.choiceResultOptions = choices.map(choice => choice[1]);
	}, 0);
	this.choicesSourceEvent = event; // This is used in a few places throughout the plugin
	return this.say(dialogueText, { lines: preambleLineCount + choiceCount + extraLineCount, glyphRevealDelay: 0 });
};

// Simpler method for use within a javascript field
SCRIPTING_FUNCTIONS.SAY_CHOICES = async function SAY_CHOICES(preamble, choices, extraLineCount = 0, event = this.EVENT) {
	return this.PLAYBACK.sayChoices(preamble, choices, extraLineCount, event);
};

// Get how many lines the given text will display as in the dialogue system.
BipsiPlayback.prototype.calculateLineCountOfDialogueText = function calculateLineCountOfDialogueText(text) {
	if (!text?.trim()) return 0;
	const lines = text.split('\n');
	let result = 0;
	lines.forEach(line => {
		result += Math.floor(line.length / (DIALOGUE_LINE_WIDTH / DIALOGUE_CHARACTER_WIDTH)) + 1;
	});
	return result;
};

// Given an object representing a choice-result, this function determines what to do with it.
BipsiPlayback.prototype.runChoice = async function runChoice(choiceResult) {
	// Start by running custom choice-result handlers.
	if (CUSTOM_CHOICE_RESULT_HANDLERS.length) {
		window.CHOICE_RESULT = choiceResult;
		for (let i = 0; i < CUSTOM_CHOICE_RESULT_HANDLERS.length; i++) {
			const handler = CUSTOM_CHOICE_RESULT_HANDLERS[i];
			// eslint-disable-next-line no-await-in-loop
			if (await this.runJS(this.choicesSourceEvent, handler)) {
				// If a custom choice-result handler handled the result (i.e. returned truthy) then we're done.
				delete window.CHOICE_RESULT;
				return;
			}
		}
		delete window.CHOICE_RESULT;
	}
	// If none of the custom choice-result handlers worked, run through the native handlers.
	switch (typeof choiceResult) {
		case 'function':
			choiceResult();
			break;
		case 'string':
			this.say(choiceResult);
			break;
		case 'object':
			// Location object
			if (choiceResult.room && choiceResult.position) {
				const event = window.getEventAtLocation(this.data, choiceResult);
				if (event) {
					this.touch(event);
				}
			}
			// javascript field
			else if (choiceResult.key && choiceResult.data && choiceResult.type === 'javascript') {
				this.runJS(this.choicesSourceEvent, choiceResult.data);
			}
			// location field
			else if (choiceResult.key && choiceResult.data && choiceResult.type === 'location') {
				this.runChoice(choiceResult.data);
			}
			break;
		default: {
			console.warn('A choice with an unhandled result type produced no effect:', choiceResult);
		}
	}
};

BipsiPlayback.prototype.handleKeydownForChoices = function handleKeydownForChoices(keyEvent) {
	if (keyEvent.repeat) return;
	if (!this.choiceResultOptions) return;
	for (let i = 0; i < this.choiceResultOptions.length; i++) {
		if (CHOICE_KEYS[i].codes.includes(keyEvent.key)) {
			keyEvent.stopPropagation();
			keyEvent.preventDefault();
			const choiceResult = this.choiceResultOptions[i];
			this.choiceResultOptions = null;
			this.proceed();
			this.runChoice(choiceResult);
			break;
		}
	}
};
// Add listener to window, instead of document, to allow overriding bipsi's original 'keydown' listener.
window.addEventListener('keydown', evt => window.PLAYBACK.handleKeydownForChoices(evt), { capture: true });

// Block dialogue proceeding from keystrokes if there are dialogue choices to choose from
wrap.splice(BipsiPlayback.prototype, 'proceed', function proceed(original) {
	if (this.choiceResultOptions) return null;
	return original.call(this);
});
