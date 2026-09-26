/**
 * UNDER INVESTIGATION — Audio Engine (Howler.js + WebAudio Synthesizer Fallback)
 */

class AudioManager {
  constructor() {
    this.muted = false;
    this.sfxVolume = 0.85;
    this.ambienceVolume = 0.45;
    this.voiceVolume = 1.0;
    
    this.currentAmbience = null;
    this.currentVoice = null;
    this.soundCache = new Map();
    this.hitIndex = 0;
    this.audioContext = null;
  }

  init() {
    // Unlock AudioContext on first user interaction
    const unlock = () => {
      try {
        if (!this.audioContext) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) this.audioContext = new AudioContextClass();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      } catch (e) {
        console.warn('[Audio] Context unlock error:', e);
      }
    };

    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
  }

  playSFX(name) {
    if (this.muted) return;

    try {
      if (typeof Howl !== 'undefined') {
        const soundPath = `assets/sfx/${name}.mp3`;
        let sound = this.soundCache.get(soundPath);
        
        if (!sound) {
          sound = new Howl({
            src: [soundPath, `assets/sfx/${name}.wav`],
            volume: this.sfxVolume,
            onloaderror: () => {
              this.synthSFX(name);
            }
          });
          this.soundCache.set(soundPath, sound);
        }
        sound.play();
      } else {
        this.synthSFX(name);
      }
    } catch (e) {
      this.synthSFX(name);
    }
  }

  playHit() {
    if (this.muted) return;
    const hitSounds = ['hit1', 'hit2', 'hit3'];
    const chosenSound = hitSounds[this.hitIndex];
    this.hitIndex = (this.hitIndex + 1) % hitSounds.length;

    this.playSFX(chosenSound);
  }

  playWin() {
    this.playSFX('win');
  }

  playLose() {
    this.playSFX('lose');
  }

  playAmbience(trackName) {
    if (typeof Howl === 'undefined') return;

    if (this.currentAmbience) {
      this.currentAmbience.fade(this.currentAmbience.volume(), 0, 800);
      const prev = this.currentAmbience;
      setTimeout(() => {
        try { prev.stop(); } catch (e) {}
      }, 800);
    }

    if (!trackName || this.muted) return;

    try {
      this.currentAmbience = new Howl({
        src: [`assets/sfx/${trackName}.mp3`],
        html5: true,
        loop: true,
        volume: this.ambienceVolume,
        onloaderror: () => console.log(`[Audio] Ambience file not present: ${trackName}`)
      });
      this.currentAmbience.play();
    } catch (e) {
      console.warn('[Audio] Ambience error:', e);
    }
  }

  playVoice(voiceFile, onEndCallback = null) {
    if (this.currentVoice) {
      try { this.currentVoice.stop(); } catch (e) {}
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
          if (onEndCallback) onEndCallback();
        }
      });
      this.currentVoice.play();
    } catch (e) {
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

  // Synthesizer fallback in case audio files or policy blocks
  synthSFX(type) {
    if (this.muted || !this.audioContext) return;
    try {
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') ctx.resume();

      if (type.startsWith('hit') || type === 'punch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.11);
      } else if (type === 'win') {
        [261.6, 329.6, 392.0, 523.2].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.4);
        });
      } else if (type === 'lose') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }
    } catch (e) {}
  }
}

export const audio = new AudioManager();
