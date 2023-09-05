/**
🔊
@file sounds
@summary Sound effects and music from audio files (mp3, wav).
@license MIT
@author Violgamba (Jon Heard)

@description
A basic system for sound effects and music from audio files (mp3, wav).  Use this instead of bipsi's
PLAY_MUSIC system for more control over the music.

- touch-sound field - This plugin adds the "touch-sound" behavior field to make an event play a
  sound whenever it is touched.
  The touch-sound field can be a file field with a sound file (mp3 or wav) that is played on touch.
  The touch-sound field can be a text field containing the name of a sound file field in the game's
  library event.  When touched the sound is played from the library event.

- This plugin adds the following script functions:
  - PLAY_SOUND(sound, channel, looped) - Plays a sound.
    - "sound" - Indicates which sound to play.  This is a string with the name of a field contained
      in the current event or the library event.  Alternately this can contain the result of a call
      to FIELD_OR_LIBRARY(name).
    - "channel" - An optional string parameter that defaults to "main".  For basic use, leave
      it null for the default.  If you play a sound while a previous sound is already playing, then
      the previous sound is interrupted and stops.  If you need to play multiple sounds
      simultaneously, such as playing sound effects while an ambient sound loops, then set this
      parameter to different names for different sound types (such as "fx" and "ambient").  This
      will cause the sounds to play on separate channels so they will not interrupt each other.
    - "looped" - An optional boolean parameter that defaults to false.  If true, signifies that
      this sound should repeat indefinitely, or until stopped with "STOP_SOUND()" or interrupted
      by a different sound played on the same channel.  If false, this sound will play only once.
  - STOP_SOUND(channel) - Stops a playing sound from playing.
    - "channel" - An optional string parameter.  If specified, the sound playing on the given
      channel is stopped.  If not specified, all sounds on all channels are stopped.
  - SET_SOUND_VOLUME(volume, channel) - Set the volume for one channel, or for all channels.
    - "volume" - The volume to set.  Expects a value from 0.0 to 1.0.
    - "channel" - An optional string parameter.  If specified, the volume is set only for the
		given channel.  If not specified, the volume is set for ALL channels.
  - ADD_ON_SOUND_END(callback, channel, runOnce) - Run code when a playing sound reaches its end.
	Note - This WILL trigger if a sound is looped.  If so, it triggers just before the sound loops.
    Note - This will NOT trigger if a sound is interrupted.
	Note - This returns an object that can be passed to REMOVE_ON_SOUND_END.
    - "callback" - A JavaScript function containing the code to run.  The function is passed a
      "name" argument containing the name of the sound that has ended.
    - "channel" - An optional string parameter that defaults to "main".  Only sounds played on this
      channel will trigger the given jsFunction.
    - "runOnce" - An optional boolean parameter that defaults to false.  If true, then only the next
      sound end will trigger the given jsFunction.  If false, all subsequent sound ends will trigger
      the given jsFunction.
  - REMOVE_ON_SOUND_END(toStop) - Removes code which triggers when sounds end, i.e. code that was
    passed to ADD_ON_SOUND_END().
    - "soundEndToStop" - An object returned from a call to ADD_ON_SOUND_END which represents the
      code we want to stop triggering.


HOW TO USE - EVENT TOUCH TRIGGERS AUDIO - SIMPLE:
1. Import this plugin into your game.
2. Pick an event to trigger audio from and add an sound file (mp3 or wav) to it as a file field
   named "touch-sound".
3. Run the game and touch the event of step 2.  Notice that the sound plays.


HOW TO USE - EVENT TOUCH TRIGGERS AUDIO - SIMPLE, USING A GAME LIBRARY:
1. Import this plugin into your game.
2. Add a library event by adding a tag to an event named "is-library".
3. Add a sound file (mp3 or wav) to the library event of step 2 as a file field.  Name it something
   appropriate.
4. Pick an event to trigger audio from and add a text field named "touch-sound".  Set the text field
   to the name of the field of step 3.
5. Run the game and touch the event of step 2.  Notice that the sound of step 3 plays.


HOW TO USE - EVENT TOUCH TRIGGERS AUDIO - INTERMEDIATE:
1. Import this plugin into your game.
2. Pick an event to trigger audio from and add an audio file (mp3 or wav) to it as a "file" field
	with whatever name you wish.
3. Add a javascript field "touch" to the event of step 2.  "before" or "after" fields work as well.
4. Set the javascript field of step 3 to the following, replacing X with the field name of step 2:
	PLAY_SOUND("X");
3. Run the game and touch the event of step 2.  Notice that the sound plays.
NOTE - Adding the file field of step 2 to a library event, instead of the trigger event, also works.


HOW TO USE - EVENT TOUCH TRIGGERS AUDIO - ADVANCED:
1. Import this plugin into your game.
2. Pick an event to trigger audio from and add an audio file (mp3 or wav) to it as a "file" field
	with whatever name you wish.
3. Add a javascript field "touch" to the event of step 2.  "before" or "after" fields work as well.
4. Set the javascript field of step 3 to the following, replace X with the field name of step 2:
	const toPlay = FIELD_OR_LIBRARY("X");
	if (toPlay) {
		PLAY_SOUND(toPlay);
	}
5. Run the game and touch the event from step 2.  Notice that the sound plays.
NOTE - Adding the file field of step 2 to a library event, instead of the trigger event, also works.


// The starting volume for sound
//!CONFIG default-sound-volume (text) "1.0"
*/

const DEFAULT_SOUND_CHANNEL = 'main';

wrap.after(window, 'start', () => {
	window.PLAYBACK.soundChannels = {};
	window.PLAYBACK.defaultSoundVolume = parseFloat(FIELD(CONFIG, 'default-sound-volume', 'text')) || 0;
});

BipsiPlayback.prototype.playSound = function playSound(sound, channel, looped) {
	if (!sound) {
		return;
	}
	channel ||= DEFAULT_SOUND_CHANNEL;
	if (!this.soundChannels[channel]) {
		this.soundChannels[channel] = document.createElement('audio');
		this.soundChannels[channel].volume = this.defaultSoundVolume;
	}
	// If request to loop a sound that's already looping, do nothing to avoid resetting the loop
	if (looped && this.soundChannels[channel] && this.soundChannels[channel].src === sound) {
		return;
	}
	// Setup the given sound on the given channel
	this.soundChannels[channel].src = sound;
	this.soundChannels[channel].loop = looped;
	this.soundChannels[channel].play();
};
SCRIPTING_FUNCTIONS.PLAY_SOUND = function PLAY_SOUND(sound, channel, looped) {
	let assetId = this.FIELD_OR_LIBRARY(sound, this.EVENT);
	if (!assetId) {
		assetId = sound;
	}
	sound = this.PLAYBACK.getFileObjectURL(assetId);
	this.PLAYBACK.playSound(sound, channel, looped);
};

BipsiPlayback.prototype.stopSound = function stopSound(channel) {
	if (channel) {
		if (!this.soundChannels[channel]) {
			return;
		}
		this.soundChannels[channel].pause();
		this.soundChannels[channel].removeAttribute('src');
		this.soundChannels[channel].loop = false;
	} else {
		Object.values(this.soundChannels).forEach(i => {
			i.pause();
			i.removeAttribute('src');
			i.loop = false;
		});
	}
};
SCRIPTING_FUNCTIONS.STOP_SOUND = function STOP_SOUND(channel) {
	this.PLAYBACK.stopSound(channel);
};

BipsiPlayback.prototype.setSoundVolume = function setSoundVolume(volume, channel) {
	// Prep the volume value
	if (Number.isNaN(parseFloat(volume))) {
		console.log(`Invalid sound volume: "${volume}".`);
	}
	volume = Math.min(Math.max(parseFloat(volume), 0), 1);

	if (channel) {
		// Set the volume for a single channel
		if (!this.soundChannels[channel]) {
			this.soundChannels[channel] = document.createElement('audio');
		}
		this.soundChannels[channel].volume = volume;
	} else {
		// Set the volume for ALL channels
		this.defaultSoundVolume = volume;
		Object.values(this.soundChannels).forEach(i => {
			i.volume = volume;
		});
	}
};
SCRIPTING_FUNCTIONS.SET_SOUND_VOLUME = function SET_SOUND_VOLUME(volume, channel) {
	this.PLAYBACK.setSoundVolume(volume, channel);
};

const BEHAVIOUR_TOUCH_SOUND = `
const field = oneField(EVENT, 'touch-sound');
if (!field || (field.type != 'file' && field.type != 'text')) {
	return;
}
if (!field.data) {
	return;
}
if (field.type == 'text') {
	const library = findEventById(PLAYBACK.data, PLAYBACK.libraryId);
	const libField = oneField(library, field.data);
	if (!libField || !libField.data) {
		return;
	}
}
PLAY_SOUND(field.data);
`;
STANDARD_SCRIPTS.unshift(BEHAVIOUR_TOUCH_SOUND);
