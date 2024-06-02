/**
🔊
@file sounds
@summary Sound effects and music from audio files (mp3, wav).
@license MIT
@author Violgamba (Jon Heard)
@version 8.3.0


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
  - ADD_ON_SOUND_END(callback, channel) - Run code when a playing sound reaches its end.
	Note - This WILL trigger if a sound is looped.  If so, it triggers just after the sound loops.
    Note - This will NOT trigger if a sound is interrupted.
	Note - This returns an object that can be passed to REMOVE_ON_SOUND_END.
    - "callback" - A JavaScript function containing the code to run.  It is passed three arguments:
      - source - the event containing the sound that was played
	  - name - the name of the event field containing the sound that was played
	  - channel - the name of the channel the sound was played on
    - "channel" - An optional string parameter, defaulting to "main".  Sounds played on this channel
      will trigger the given jsFunction.
  - REMOVE_ON_SOUND_END(toStop) - Removes code which triggers when sounds end, i.e. code that was
    passed to ADD_ON_SOUND_END().
    - "soundEndToStop" - An object returned from a call to ADD_ON_SOUND_END which represents the
      code we want to stop triggering.


HOW TO USE - EVENT TOUCH TRIGGERS AUDIO - SIMPLE:
1. Import this plugin into your game.
2. Pick an event to trigger audio from and add a sound file (mp3 or wav) to it as a file field
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
(function () {
'use strict';



const DEFAULT_SOUND_CHANNEL = 'main';

SCRIPTING_FUNCTIONS.PLAY_SOUND = function PLAY_SOUND(sound, channel, looped) {
	let assetId = this.FIELD_OR_LIBRARY(sound, this.EVENT);
	if (!assetId) {
		assetId = sound;
	}
	if (!this.PLAYBACK.stateManager.resources.resources.has(assetId)) {
		console.error(`Invalid sound asset id: "${assetId}"`);
		return;
	}
	FIELD(this.EVENT, sound, 'file');

	// Determine sound's source and name
	const libraryReference = FIELD(this.EVENT, sound, 'text');
	let soundSource = null;
	let soundName = '';
	if (libraryReference) {
		soundSource = window.getEventById(window.PLAYBACK.data, window.PLAYBACK.libraryId);
		soundName = libraryReference;
	} else if (!FIELD(this.EVENT, sound, 'file')) {
		soundSource = window.getEventById(window.PLAYBACK.data, window.PLAYBACK.libraryId);
		soundName = sound;
	} else {
		soundSource = this.EVENT;
		soundName = sound;
	}

	sound = this.PLAYBACK.getFileObjectURL(assetId);
	this.PLAYBACK.playSound(sound, channel, looped, soundSource, soundName);
};
BipsiPlayback.prototype.playSound = function playSound(sound, channel, looped, soundSource, soundName) {
	if (!sound) return;
	channel ||= DEFAULT_SOUND_CHANNEL;
	if (!this.soundChannels[channel]) {
		this.soundChannels[channel] = { audioPlayer: document.createElement('audio') };
		this.soundChannels[channel].audioPlayer.volume = this.defaultSoundVolume;
	}

	// If asked to loop a sound, and already looping that sound, early out.
	if (looped && this.soundChannels[channel].audioPlayer.src === sound && this.soundChannels[channel].audioPlayer.loop) return;

	// Setup the given sound on the given channel
	this.soundChannels[channel].audioPlayer.src = sound;
	this.soundChannels[channel].audioPlayer.loop = looped;
	this.soundChannels[channel].soundSource = soundSource;
	this.soundChannels[channel].soundName = soundName;
	this.soundChannels[channel].audioPlayer.play();
};

SCRIPTING_FUNCTIONS.STOP_SOUND = function STOP_SOUND(channel) {
	this.PLAYBACK.stopSound(channel);
};
BipsiPlayback.prototype.stopSound = function stopSound(channel) {
	if (channel) {
		if (!this.soundChannels[channel]) return;
		this.soundChannels[channel].audioPlayer.pause();
		this.soundChannels[channel].audioPlayer.removeAttribute('src');
		this.soundChannels[channel].audioPlayer.loop = false;
	} else {
		Object.values(this.soundChannels).forEach(i => {
			i.audioPlayer.pause();
			i.audioPlayer.removeAttribute('src');
			i.audioPlayer.loop = false;
		});
	}
};

SCRIPTING_FUNCTIONS.SET_SOUND_VOLUME = function SET_SOUND_VOLUME(volume, channel) {
	this.PLAYBACK.setSoundVolume(volume, channel);
};
BipsiPlayback.prototype.setSoundVolume = function setSoundVolume(volume, channel) {
	// Prep the volume value
	if (Number.isNaN(parseFloat(volume))) {
		console.error(`Invalid sound volume: "${volume}".`);
		return;
	}
	volume = Math.min(Math.max(parseFloat(volume), 0), 1);

	if (channel) {
		// Set the volume for a single channel
		if (!this.soundChannels[channel]) {
			this.soundChannels[channel] = { audioPlayer: document.createElement('audio') };
		}
		this.soundChannels[channel].audioPlayer.volume = volume;
	} else {
		// Set the volume for ALL channels
		this.defaultSoundVolume = volume;
		Object.values(this.soundChannels).forEach(i => {
			i.audioPlayer.volume = volume;
		});
	}
};

SCRIPTING_FUNCTIONS.ADD_ON_SOUND_END = function ADD_ON_SOUND_END(callback, channel) {
	return this.PLAYBACK.addOnSoundEnd(callback, channel);
};
BipsiPlayback.prototype.addOnSoundEnd = function addOnSoundEnd(callback, channel) {
	channel ||= DEFAULT_SOUND_CHANNEL;
	if (!this.soundChannels[channel]) {
		this.soundChannels[channel] = { audioPlayer: document.createElement('audio') };
	}
	const result = { channel };
	result.listenerFnc = () => {
		callback(this.soundChannels[channel].soundSource, this.soundChannels[channel].soundName, channel);
	};
	// trigger for a non-looping sound
	this.soundChannels[channel].audioPlayer.addEventListener('ended', result.listenerFnc);
	// trigger for a looping sound
	this.soundChannels[channel].audioPlayer.addEventListener('seeked', result.listenerFnc);
	return result;
};

SCRIPTING_FUNCTIONS.REMOVE_ON_SOUND_END = function REMOVE_ON_SOUND_END(toStop) {
	this.PLAYBACK.removeOnSoundEnd(toStop);
};
BipsiPlayback.prototype.removeOnSoundEnd = function removeOnSoundEnd(toStop) {
	if (!toStop || !toStop.channel || !toStop.listenerFnc) {
		console.error('Invalid toStop argument', toStop);
	}
	if (!this.soundChannels[toStop.channel]) return;
	this.soundChannels[toStop.channel].audioPlayer.removeEventListener('ended', toStop.listenerFnc);
	this.soundChannels[toStop.channel].audioPlayer.removeEventListener('seeked', toStop.listenerFnc);
};

wrap.after(window, 'start', () => {
	window.PLAYBACK.soundChannels = {};
	window.PLAYBACK.defaultSoundVolume = parseFloat(FIELD(CONFIG, 'default-sound-volume', 'text')) || 0;
});

const BEHAVIOUR_TOUCH_SOUND = `
const field = oneField(EVENT, 'touch-sound');
if (!field || (field.type != 'file' && field.type != 'text')) {
	return;
}
if (!field.data) {
	return;
}
PLAY_SOUND('touch-sound');
`;
STANDARD_SCRIPTS.unshift(BEHAVIOUR_TOUCH_SOUND);

})();
