/**
 * UNDER INVESTIGATION — Main Game Boot & Scene Router (main.js)
 */

import { gameState } from './state.js';
import { audio } from './audio.js';
import { ui } from './ui.js';

import { stage1 } from './stage1.js';
import { stage2 } from './stage2.js';
import { stage3 } from './stage3.js';
import { stage4 } from './stage4.js';
import { stage5 } from './stage5.js';

class GameRouter {
  constructor() {
    this.stageModules = {
      1: stage1,
      2: stage2,
      3: stage3,
      4: stage4,
      5: stage5
    };
    this.currentActiveStage = null;
  }

  init() {
    console.log('[App] Initializing UNDER INVESTIGATION...');
    audio.init();
    ui.init();

    // Init each stage module
    Object.values(this.stageModules).forEach(stage => stage.init());

    // Connect Stage 0 (Title / Prologue) Start Button
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        audio.playClick();
        gameState.setStage(1);
      });
    }

    // Connect Restart Case Button in ending
    const restartBtn = document.getElementById('btn-restart-game');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        gameState.resetAll();
      });
    }

    // Subscribe to state changes for stage switching
    gameState.subscribe((event, data) => {
      if (event === 'stage_change') {
        this.switchStage(data.to, data.from);
      } else if (event === 'full_reset') {
        this.switchStage(0, null);
      }
    });

    // Start on title stage (0)
    this.switchStage(0, null);
  }

  switchStage(newStageNum, oldStageNum) {
    console.log(`[Router] Transitioning: Stage ${oldStageNum} -> Stage ${newStageNum}`);

    // Cleanup previous stage
    if (oldStageNum && this.stageModules[oldStageNum]) {
      this.stageModules[oldStageNum].cleanup();
    }

    // Hide all stage sections
    document.querySelectorAll('.stage-section').forEach(sec => sec.classList.remove('active'));

    // Update Header Stage Indicator
    const stageBadge = document.getElementById('current-stage-indicator');
    if (stageBadge) {
      if (newStageNum === 0) {
        stageBadge.textContent = 'PROLOGUE';
      } else if (newStageNum >= 1 && newStageNum <= 5) {
        stageBadge.textContent = `STAGE ${newStageNum} / 5`;
      } else if (newStageNum === 6) {
        stageBadge.textContent = 'CASE CLOSED';
      }
    }

    // Activate the target section
    let targetSectionId = `stage-${newStageNum}`;
    if (newStageNum === 6) targetSectionId = 'stage-ending';

    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Start target stage logic
    if (newStageNum >= 1 && newStageNum <= 5 && this.stageModules[newStageNum]) {
      this.stageModules[newStageNum].start();
    } else if (newStageNum === 0) {
      audio.playAmbience('noir-ambient-loop');
    }
  }
}

// Bootstrap when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const router = new GameRouter();
  router.init();
});
