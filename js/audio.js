/**
 * UNDER INVESTIGATION — Audio Engine (Howler.js Wrapper)
 */

class AudioManager {
  constructor() {
    this.muted = false;
    this.sfxVolume = 0.8;
    this.ambienceVolume = 0.4;
    this.voiceVolume = 1.0;
    
    this.currentAmbience = null;
    this.currentVoice = null;
    this.soundCache = new Map();
  }

  init() {
    // Check if Howler is loaded via CDN
    if (typeof Howl === 'undefined') {
      console.warn('[Audio] Howler.js not detected. Audio will operate in silent fallback mode.');
    }
  }

  playSFX(name) {
    if (this.muted || typeof Howl === 'undefined') return;

    try {
      const soundPath = `assets/sfx/${name}.mp3`;
      let sound = this.soundCache.get(soundPath);
      
      if (!sound) {
        sound = new Howl({
          src: [soundPath, `assets/sfx/${name}.wav`],
          volume: this.sfxVolume,
          onloaderror: () => console.log(`[Audio] SFX file not yet present: ${name}`)
        });
        this.soundCache.set(soundPath, sound);
      }
      sound.play();
    } catch (e) {
      console.warn('[Audio] SFX play error:', e);
    }
  }

  playAmbience(trackName) {
    if (typeof Howl === 'undefined') return;

    if (this.currentAmbience) {
      this.currentAmbience.fade(this.currentAmbience.volume(), 0, 1000);
      setTimeout(() => {
        if (this.currentAmbience) this.currentAmbience.stop();
      }, 1000);
    }

    if (!trackName || this.muted) return;

    try {
      this.currentAmbience = new Howl({
        src: [`assets/sfx/${trackName}.mp3`],
        html5: true,
        loop: true,
        volume: this.ambienceVolume,
        onloaderror: () => console.log(`[Audio] Ambience file not yet present: ${trackName}`)
      });
      this.currentAmbience.play();
    } catch (e) {
      console.warn('[Audio] Ambience error:', e);
    }
  }

  playVoice(voiceFile, onEndCallback = null) {
    if (this.currentVoice) {
      this.currentVoice.stop();
      this.currentVoice = null;
    }

    if (this.muted || typeof Howl === 'undefined' || !voiceFile) {
      if (onEndCallback) setTimeout(onEndCallback, 300);
      return;
    }

    try {
      this.currentVoice = new Howl({
        src: [voiceFile],
        volume: this.voiceVolume,
        onend: () => {
          if (onEndCallback) onEndCallback();
        },
        onloaderror: () => {
          console.log(`[Audio] Voiceover file not present: ${voiceFile}, continuing with text.`);
          if (onEndCallback) onEndCallback();
        }
      });
      this.currentVoice.play();
    } catch (e) {
      console.warn('[Audio] Voice error:', e);
      if (onEndCallback) onEndCallback();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (typeof Howler !== 'undefined') {
      Howler.mute(this.muted);
    }
    return this.muted;
  }
}

export const audio = new AudioManager();
