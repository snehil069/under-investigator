/**
 * UNDER INVESTIGATION — Stage 4: Find the Liar (stage4.js)
 */

import { gameState } from './state.js';
import { ui } from './ui.js';
import { audio } from './audio.js';

export class Stage4 {
  constructor() {
    this.container = document.getElementById('stage-4');
  }

  init() {
    const nextBtn = document.getElementById('btn-s4-complete');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.complete());
    }
  }

  start() {
    console.log('[Stage 4] Started: Find the Liar');
    audio.playAmbience('suspense-loop');
  }

  async complete() {
    console.log('[Stage 4] Completed!');

    await ui.showDialogue([
      { speaker: 'MAYA', text: "I left the laboratory before 2:00 AM! I wasn't there during the blackout!" },
      { speaker: 'JAGA', text: "Contradiction! The security log in Apartment 69 records your card badge at 02:08 AM!" },
      { speaker: 'MAYA', text: "What?! No! Someone else must have used my card! I really wasn't there!" },
      { speaker: 'VANCE', text: "The evidence speaks for itself, Maya. Case closed... or is it?" }
    ]);

    gameState.setStage(5);
  }

  cleanup() {
    console.log('[Stage 4] Cleanup');
  }
}

export const stage4 = new Stage4();
