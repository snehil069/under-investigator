/**
 * UNDER INVESTIGATION — Stage 3: Find the Clue (stage3.js)
 */

import { gameState } from './state.js';
import { ui } from './ui.js';
import { audio } from './audio.js';

export class Stage3 {
  constructor() {
    this.container = document.getElementById('stage-3');
  }

  init() {
    const nextBtn = document.getElementById('btn-s3-complete');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.complete());
    }
  }

  start() {
    console.log('[Stage 3] Started: Apartment 69 Search');
    audio.playAmbience('noir-ambient-loop');
  }

  async complete() {
    console.log('[Stage 3] Completed!');
    
    // Add clues discovered in Apartment 69
    gameState.addEvidence('LOCKER_PIN');
    gameState.addEvidence('SECURITY_PRINTOUT');
    gameState.addEvidence('BURNER_PHONE');

    await ui.showDialogue([
      { speaker: 'JAGA', text: "Look at this security printout: 'Maya Lin — Entered: 02:08 AM'." },
      { speaker: 'VANCE', text: "02:08 AM? That falls squarely inside the 02:00–02:20 AM blackout window!" },
      { speaker: 'JAGA', text: "And the burner phone contacts match Maya Lin, Dr. Jhatka, and Elena Rostova." },
      { speaker: 'VANCE', text: "We need to interrogate the suspects immediately and spot the liar." }
    ]);

    gameState.setStage(4);
  }

  cleanup() {
    console.log('[Stage 3] Cleanup');
  }
}

export const stage3 = new Stage3();
