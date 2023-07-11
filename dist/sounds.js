/**
🔊
@file sounds
@summary Sound effects from audio files (mp3, wav).  Also adds volume control for sounds and music.
@license MIT
@author Violgamba (Jon Heard)
@version 4.2.1


@description
Work with sound effect files (mp3, wav) in a manner akin to how Bipsi handles music.

- Plugin adds a new field behavior.  An event that has a "touch-sound" file field that contains a
	sound file (mp3 or wav), will play that sound file when it is touched.

- Plugin adds the following script functions:
	- PLAY_SOUND(sound, channel, looped) - Plays a sound.
		- "sound" - Indicates which sound to play.  This can be a string with the name of a field
		contained in the current event or the library event, or the result of a call to
		"FIELD_OR_LIBRARY(name)".
		- "channel" - An optional string parameter that defaults to "main".  For basic use, leave
		it null.  In this case, if you play a sound while a second one is already playing, the
		second sound is interrupted and stops.  If you need to play multiple sounds simultaneously
		(example: "sound effects" vs "ambient") use different channel names for different sounds.
		This will cause the sounds to play on separate sound objects so they will not interrupt
		each other.
		- "looped" - An optional boolean parameter that defaults to false.  If true, signifies that
		this sound should repeat indefinitely, or until stopped with "STOP_SOUND()" or interrupted
		by a different sound played on the same channel.
	- STOP_SOUND(channel) - Stops a playing sound playing.
		- "channel" - An optional string parameter.  If specified, the sound playing on the given
		channel is stopped, otherwise all sounds on all channels are stopped.
	- SET_SOUND_VOLUME(volume, channel) - Set sound volume.
		- "volume" - The volume to set sound to.  Expects a value from 0.0 to 1.0.
		- "channel" - An optional string parameter.  If specified, the volume is set only for the
		given channel.  If not specified, the volume is set for ALL channels.
	- SET_MUSIC_VOLUME(volume) - Set music volume.
		- "volume" - The volume to set music to.  Expects a value from 0.0 to 1.0.


HOW TO USE - EVENT TOUCH TRIGGERS AUDIO - SIMPLE:
1. Import this plugin into your game.
2. Pick an event to trigger audio from and add an audio file (mp3 or wav) to it as a file field
	named "touch-sound".
3. Run the game and touch the event of step 2.  Notice that the sound plays.


HOW TO USE - EVENT TOUCH TRIGGERS AUDIO - INTERMEDIATE:
1. Import this plugin into your game.
2. Pick an event to trigger audio from and add an audio file (mp3 or wav) to it as a "file" field
	with whatever name you wish.
3. Add a javascript field "touch" to the event of step 2.  "before" or "after" fields work as well.
4. Set the javascript field of step 3 to the following, replacing X with the field name of step 2:
	PLAY_SOUND("X");
3. Run the game and touch the event of step 2.  Notice that the sound plays.
NOTE - Adding the file field of step 2 to a library event, instead of the trigger event, also works.


HOW TO USE - EVENT TOUCH TRIGGERS AUDIO - ADVANCED (LIKE MUSIC IS DONE):
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

// The starting volume for music
//!CONFIG default-music-volume (text) "1.0"
*/
(function () {
'use strict';



const DEFAULT_SOUND_CHANNEL = 'main';

wrap.after(window, 'start', () => {
	window.PLAYBACK.soundChannels = {};
	window.PLAYBACK.defaultSoundVolume = parseFloat(FIELD(CONFIG, 'default-sound-volume', 'text')) || 0;
	window.PLAYBACK.music.volume = parseFloat(FIELD(CONFIG, 'default-music-volume', 'text')) || 0;
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

BipsiPlayback.prototype.setMusicVolume = function setMusicVolume(volume) {
	if (Number.isNaN(parseFloat(volume))) {
		console.log(`Invalid music volume: "${volume}".`);
	}
	volume = Math.min(Math.max(parseFloat(volume), 0), 1);

	this.music.volume = volume;
};
SCRIPTING_FUNCTIONS.SET_MUSIC_VOLUME = function SET_MUSIC_VOLUME(volume) {
	this.PLAYBACK.setMusicVolume(volume);
};

const BEHAVIOUR_TOUCH_SOUND = `
const sound = FIELD(EVENT, "touch-sound", "file");
if (sound) {
	PLAY_SOUND(sound);
}
`;
STANDARD_SCRIPTS.unshift(BEHAVIOUR_TOUCH_SOUND);

})();
