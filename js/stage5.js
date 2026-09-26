/**
 * UNDER INVESTIGATION — Stage 5: Solve the Case & Final Twist (stage5.js)
 */

import { gameState } from './state.js';
import { ui } from './ui.js';
import { audio } from './audio.js';

export class Stage5 {
  constructor() {
    this.container = document.getElementById('stage-5');
  }

  init() {
    const nextBtn = document.getElementById('btn-s5-trigger-glitch');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.triggerTwistGlitch());
    }
  }

  start() {
    console.log('[Stage 5] Started: Final Deduction');
    audio.playAmbience('buildup-loop');
  }

  async triggerTwistGlitch() {
    console.log('[Stage 5] Triggering Contradiction Glitch');
    
    // Glitch effect on screen
    const container = document.getElementById('game-container');
    container.classList.add('glitch-effect');
    audio.playSFX('glitch-static');

    setTimeout(async () => {
      container.classList.remove('glitch-effect');
      gameState.addEvidence('POLICE_OVERRIDE');

      await ui.showDialogue([
        { speaker: 'JAGA', text: "Wait... looking at the system override logs at 02:03 AM..." },
        { speaker: 'JAGA', text: "The camera blackout wasn't caused by a lab assistant. It was authorized by police credentials: DEVICE: POLICE-07!" },
        { speaker: 'VANCE', text: "Jaga... you always were too thorough for your own good." },
        { speaker: 'JAGA', text: "It was you, Vance! You disabled the cameras, used Leo as a decoy, and framed Maya!" },
        { speaker: 'VANCE', text: "You can't prove a thing without that prototype." },
        { speaker: 'JAGA', text: "Drop your weapon, Vance! You're under arrest!" }
      ]);

      audio.playSFX('case-closed-sting');
      gameState.setStage(6); // Go to Ending
    }, 1200);
  }

  cleanup() {
    console.log('[Stage 5] Cleanup');
  }
}

export const stage5 = new Stage5();
