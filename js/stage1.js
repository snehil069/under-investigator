/**
 * UNDER INVESTIGATION — Stage 1: Hit the Suspect (stage1.js)
 */

import { gameState } from './state.js';
import { ui } from './ui.js';
import { audio } from './audio.js';

export class Stage1 {
  constructor() {
    this.container = document.getElementById('stage-1');
  }

  init() {
    // Scaffold UI buttons/placeholders for Stage 1
    const nextBtn = document.getElementById('btn-s1-complete');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.complete());
    }
  }

  start() {
    console.log('[Stage 1] Started: Hit the Suspect');
    audio.playAmbience('noir-ambient-loop');
  }

  async complete() {
    console.log('[Stage 1] Completed!');
    
    await ui.showDialogue([
      { speaker: 'LEO', text: "You have the wrong man! I didn't steal the research prototype!" },
      { speaker: 'VANCE', text: "Save it for interrogation. We saw you running from the perimeter." },
      { speaker: 'JAGA', text: "He was carrying instructions, not the device. Let's take him in." }
    ]);

    gameState.setStage(2);
  }

  cleanup() {
    console.log('[Stage 1] Cleanup');
  }
}

export const stage1 = new Stage1();
