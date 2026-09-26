/**
 * UNDER INVESTIGATION — Stage 2: Break the Silence (stage2.js)
 */

import { gameState, EvidenceRegistry } from './state.js';
import { ui } from './ui.js';
import { audio } from './audio.js';

export class Stage2 {
  constructor() {
    this.container = document.getElementById('stage-2');
  }

  init() {
    const nextBtn = document.getElementById('btn-s2-complete');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.complete());
    }
  }

  start() {
    console.log('[Stage 2] Started: Break the Silence');
    audio.playAmbience('room-tone-loop');
  }

  async complete() {
    console.log('[Stage 2] Completed!');
    
    // Add clues obtained from interrogation
    gameState.addEvidence('NOTE_APARTMENT');
    gameState.addEvidence('LOCKER_PHONE_INFO');

    await ui.showDialogue([
      { speaker: 'LEO', text: "Alright! I'll talk! I was hired to enter Apartment 69, Gokuldham." },
      { speaker: 'LEO', text: "The note said: 'When the power supply cuts, go inside from the secret entrance.'" },
      { speaker: 'VANCE', text: "A secret entrance? Who was your contact?" },
      { speaker: 'LEO', text: "I only ever received instructions on a burner phone locked in the apartment." },
      { speaker: 'JAGA', text: "Then Apartment 69 is our next stop. Let's move." }
    ]);

    gameState.setStage(3);
  }

  cleanup() {
    console.log('[Stage 2] Cleanup');
  }
}

export const stage2 = new Stage2();
