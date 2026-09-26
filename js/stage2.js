/**
 * UNDER INVESTIGATION — Stage 2: Break the Silence (stage2.js)
 * Interrogation Pressure Meter: Oscillates 0 -> 100 -> 0 continuously.
 * Target ranges: Round 1 (43.0 to 57.0), Round 2 (46.0 to 54.0), Round 3 (48.0 to 52.0).
 * STRICT RULE: ONE MISS = COMPLETE STAGE 2 RESET.
 */

import { gameState } from './state.js';
import { ui } from './ui.js';
import { audio } from './audio.js';

const ROUND_CONFIG = [
  {
    round: 1,
    minVal: 43.0,
    maxVal: 57.0,
    cycleDuration: 2800, // Relaxed, comfortable 2.8s sweep
    displayText: "43.0 — 57.0",
    wedgeHalfAngle: 18.2 // +/- 18.2 deg around top 0deg
  },
  {
    round: 2,
    minVal: 46.0,
    maxVal: 54.0,
    cycleDuration: 2200, // Smooth 2.2s sweep
    displayText: "46.0 — 54.0",
    wedgeHalfAngle: 10.4 // +/- 10.4 deg
  },
  {
    round: 3,
    minVal: 48.0,
    maxVal: 52.0,
    cycleDuration: 1800, // Focused 1.8s sweep
    displayText: "48.0 — 52.0",
    wedgeHalfAngle: 5.2 // +/- 5.2 deg
  }
];

const HINT_MESSAGES = [
  "TIME YOUR STOP WHEN THE ROTATING NEEDLE POINTS AT THE TOP 'STOP ZONE' (50).",
  "THE RED ZONE IS CONCENTRATED AROUND 50. WATCH THE VALUE 0 TO 100.",
  "PRESS SPACE OR CLICK [STOP METER] INSIDE THE TARGET ZONE."
];

export class Stage2 {
  constructor() {
    this.container = document.getElementById('stage-2');
    
    this.state = {
      round: 1,
      streak: 0,
      clueIndex: 0,
      hintLevel: 0,
      meterRunning: false,
      failed: false,
      isDialogueActive: false
    };

    this.pressureValue = 0; // 0 to 100
    this.animFrameId = null;
    this.startTime = 0;

    this.dom = {};
  }

  init() {
    this.dom = {
      roundDisplay: document.getElementById('s2-round-display'),
      streakText: document.getElementById('s2-streak-text'),
      pip1: document.getElementById('s2-pip-1'),
      pip2: document.getElementById('s2-pip-2'),
      pip3: document.getElementById('s2-pip-3'),
      sceneContainer: document.getElementById('s2-scene-container'),
      leoImg: document.getElementById('s2-leo-img'),
      dialTargetWedge: document.getElementById('s2-dial-target-wedge'),
      dialNeedleWrap: document.getElementById('s2-dial-needle-wrap'),
      pressureValDisplay: document.getElementById('s2-pressure-val'),
      targetRangeDisplay: document.getElementById('s2-target-range-text'),
      meterTrack: document.getElementById('s2-meter-track'),
      successZone: document.getElementById('s2-success-zone'),
      meterPointer: document.getElementById('s2-meter-pointer'),
      btnStopMeter: document.getElementById('btn-s2-stop-meter'),
      btnHint: document.getElementById('btn-s2-hint'),
      hintToast: document.getElementById('s2-hint-toast'),
      slot1: document.getElementById('s2-slot-1'),
      slot2: document.getElementById('s2-slot-2'),
      slot3: document.getElementById('s2-slot-3'),
      failModal: document.getElementById('s2-fail-modal'),
      failStoppedVal: document.getElementById('s2-fail-stopped-val'),
      btnRetry: document.getElementById('btn-s2-retry')
    };

    // Attach Stop Button
    if (this.dom.btnStopMeter) {
      this.dom.btnStopMeter.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.handleStopAttempt();
      });
    }

    // Spacebar / Enter listener for stopping meter or retrying
    window.addEventListener('keydown', (e) => {
      if (gameState.currentStage !== 2) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (this.state.failed) {
          this.retryStage();
        } else if (!this.state.isDialogueActive) {
          this.handleStopAttempt();
        }
      }
    });

    // Attach Retry Button on Failure Modal
    if (this.dom.btnRetry) {
      this.dom.btnRetry.addEventListener('click', (e) => {
        e.stopPropagation();
        this.retryStage();
      });
    }

    // Attach Hint Button
    if (this.dom.btnHint) {
      this.dom.btnHint.addEventListener('click', () => this.showHint());
    }
  }

  start() {
    console.log('[Stage 2] Started: Break the Silence');
    audio.playAmbience('stage2_bg');

    if (this.dom.failModal) {
      this.dom.failModal.style.display = 'none';
    }

    // Reset and start Round 1 immediately
    this.fullStageReset(true);
  }

  retryStage() {
    audio.playSFX('ui-click');
    if (this.dom.failModal) {
      this.dom.failModal.style.display = 'none';
    }
    this.fullStageReset(true);
  }

  fullStageReset(autoStart = true) {
    this.stopMeterLoop();

    this.state = {
      round: 1,
      streak: 0,
      clueIndex: 0,
      hintLevel: 0,
      meterRunning: false,
      failed: false,
      isDialogueActive: false
    };

    // Remove only stage 2 evidence on reset
    gameState.removeStage2Evidence();

    // Reset visuals
    if (this.dom.leoImg) {
      this.dom.leoImg.src = 'assets/img/stage2_leo_interrogation.png';
    }
    if (this.dom.sceneContainer) {
      this.dom.sceneContainer.classList.remove('shocked');
    }

    this.pressureValue = 0;
    this.updateHUD();
    this.updateCluesTray();
    this.applyRoundConfig(1);

    if (autoStart) {
      this.startCurrentRound();
    }
  }

  applyRoundConfig(roundNum) {
    const config = ROUND_CONFIG[roundNum - 1] || ROUND_CONFIG[0];
    
    // 1. Position success zone on horizontal track
    if (this.dom.successZone) {
      this.dom.successZone.style.setProperty('--zone-left', `${config.minVal}%`);
      this.dom.successZone.style.setProperty('--zone-width', `${config.maxVal - config.minVal}%`);
      this.dom.successZone.style.left = `${config.minVal}%`;
      this.dom.successZone.style.width = `${config.maxVal - config.minVal}%`;
    }

    // 2. Position target mark on the circular dial
    if (this.dom.dialTargetWedge) {
      const halfAngle = config.wedgeHalfAngle;
      const startDeg = 360 - halfAngle;
      const endDeg = halfAngle;
      this.dom.dialTargetWedge.style.background = `conic-gradient(from 0deg at 50% 50%, rgba(255, 30, 0, 0.55) 0deg, rgba(255, 30, 0, 0.55) ${endDeg}deg, transparent ${endDeg}deg, transparent ${startDeg}deg, rgba(255, 30, 0, 0.55) ${startDeg}deg, rgba(255, 30, 0, 0.55) 360deg)`;
    }

    if (this.dom.targetRangeDisplay) {
      this.dom.targetRangeDisplay.textContent = config.displayText;
    }

    if (this.dom.roundDisplay) {
      this.dom.roundDisplay.textContent = `ROUND ${roundNum} / 3`;
    }
  }

  startCurrentRound() {
    this.applyRoundConfig(this.state.round);
    this.state.meterRunning = true;
    this.state.failed = false;
    this.state.isDialogueActive = false;
    this.startTime = performance.now();
    this.runMeterLoop();
  }

  runMeterLoop() {
    this.stopMeterLoop();
    this.state.meterRunning = true;

    const config = ROUND_CONFIG[this.state.round - 1] || ROUND_CONFIG[0];
    const duration = config.cycleDuration;

    const animate = (timestamp) => {
      if (!this.state.meterRunning) return;

      const elapsed = timestamp - this.startTime;
      
      // Smooth continuous 0 -> 100 -> 0 linear oscillation (Triangle Wave)
      const cycleProgress = (elapsed % duration) / duration; // 0.0 to 1.0
      if (cycleProgress < 0.5) {
        this.pressureValue = cycleProgress * 200.0; // 0 to 100
      } else {
        this.pressureValue = (1.0 - cycleProgress) * 200.0; // 100 to 0
      }

      // 1. Update digital readout
      if (this.dom.pressureValDisplay) {
        this.dom.pressureValDisplay.textContent = this.pressureValue.toFixed(1);
      }

      // 2. Update horizontal track pointer
      if (this.dom.meterPointer) {
        this.dom.meterPointer.style.left = `${this.pressureValue}%`;
      }

      // 3. Update circular wall gauge needle (-130deg pointing at 0 to +130deg pointing at 100)
      const dialRot = -130.0 + (this.pressureValue / 100.0) * 260.0;
      if (this.dom.dialNeedleWrap) {
        this.dom.dialNeedleWrap.style.transform = `rotate(${dialRot}deg)`;
      }

      this.animFrameId = requestAnimationFrame(animate);
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  stopMeterLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.state.meterRunning = false;
  }

  handleStopAttempt() {
    if (this.state.failed || this.state.isDialogueActive) return;

    if (!this.state.meterRunning) {
      this.startCurrentRound();
      return;
    }

    this.stopMeterLoop();
    const config = ROUND_CONFIG[this.state.round - 1] || ROUND_CONFIG[0];

    // Check if stopped in target range
    const isSuccess = (this.pressureValue >= config.minVal && this.pressureValue <= config.maxVal);

    if (isSuccess) {
      this.handleRoundSuccess();
    } else {
      this.handleStageFailure();
    }
  }

  async handleRoundSuccess() {
    this.state.streak++;
    this.state.isDialogueActive = true;
    const currentRound = this.state.round;

    // Visual Shock & Screen tremor
    if (this.dom.sceneContainer) {
      this.dom.sceneContainer.classList.add('shocked');
    }
    if (this.dom.leoImg) {
      this.dom.leoImg.src = 'assets/img/stage2_leo_shocked.png';
    }

    // Play secret reveal sting
    audio.playSFX('secret-reveal-sting');
    this.updateHUD();

    if (currentRound === 1) {
      // Clue 1: Apartment 69, Gokuldham
      gameState.addEvidence('apartment-69');
      this.updateCluesTray();

      await ui.showDialogue([
        { speaker: 'JAGA', text: "Where were you supposed to meet them?!" },
        { speaker: 'LEO', text: "Apartment 69! In Gokuldham! That's where they told me to go!" }
      ]);

      // Reset expression & launch Round 2
      this.dom.leoImg.src = 'assets/img/stage2_leo_interrogation.png';
      this.dom.sceneContainer.classList.remove('shocked');
      this.state.isDialogueActive = false;

      this.state.round = 2;
      this.startCurrentRound();

    } else if (currentRound === 2) {
      // Clue 2: Secret Entrance & Handwritten Note
      gameState.addEvidence('secret-entrance');
      gameState.addEvidence('handwritten-note');
      this.updateCluesTray();

      await ui.showDialogue([
        { speaker: 'JAGA', text: "How did you bypass the security cameras?!" },
        { speaker: 'LEO', text: "When the power cuts, use the secret basement entrance! There's a handwritten code!" }
      ]);

      // Reset expression & launch Round 3
      this.dom.leoImg.src = 'assets/img/stage2_leo_interrogation.png';
      this.dom.sceneContainer.classList.remove('shocked');
      this.state.isDialogueActive = false;

      this.state.round = 3;
      this.startCurrentRound();

    } else if (currentRound === 3) {
      // Clue 3: Locker Phone
      gameState.addEvidence('locker-phone');
      this.updateCluesTray();

      await ui.showDialogue([
        { speaker: 'JAGA', text: "Who gave the order?!" },
        { speaker: 'LEO', text: "I swear I never saw their face! Everything was arranged through a burner phone inside the locker!" }
      ]);

      // Final Stage 2 Wrap up
      await ui.showDialogue([
        { speaker: 'VANCE', text: "Apartment 69. Secret entrance. Locker phone. That's our lead." },
        { speaker: 'JAGA', text: "Let's breach Apartment 69 and recover that phone." }
      ]);

      gameState.setFlag('stage2Complete', true);
      audio.playWin();

      setTimeout(() => {
        gameState.setStage(3);
      }, 400);
    }
  }

  handleStageFailure() {
    this.state.failed = true;
    this.stopMeterLoop();
    audio.playLose();

    if (this.dom.failStoppedVal) {
      this.dom.failStoppedVal.textContent = this.pressureValue.toFixed(1);
    }

    if (this.dom.failModal) {
      this.dom.failModal.style.display = 'flex';
    }
  }

  updateHUD() {
    if (this.dom.streakText) {
      this.dom.streakText.textContent = `${this.state.streak} / 3`;
    }

    if (this.dom.pip1) this.dom.pip1.classList.toggle('active', this.state.streak >= 1);
    if (this.dom.pip2) this.dom.pip2.classList.toggle('active', this.state.streak >= 2);
    if (this.dom.pip3) this.dom.pip3.classList.toggle('active', this.state.streak >= 3);
  }

  updateCluesTray() {
    // Slot 1: Apartment 69
    if (this.dom.slot1) {
      const hasClue1 = gameState.hasEvidence('apartment-69');
      this.dom.slot1.classList.toggle('unlocked', hasClue1);
      const statusEl = this.dom.slot1.querySelector('.s2-slot-status');
      if (statusEl) statusEl.textContent = hasClue1 ? '✓ APARTMENT 69' : '[ ??? ]';
    }

    // Slot 2: Secret Entrance
    if (this.dom.slot2) {
      const hasClue2 = gameState.hasEvidence('secret-entrance');
      this.dom.slot2.classList.toggle('unlocked', hasClue2);
      const statusEl = this.dom.slot2.querySelector('.s2-slot-status');
      if (statusEl) statusEl.textContent = hasClue2 ? '✓ SECRET ENTRANCE' : '[ ??? ]';
    }

    // Slot 3: Locker Phone
    if (this.dom.slot3) {
      const hasClue3 = gameState.hasEvidence('locker-phone');
      this.dom.slot3.classList.toggle('unlocked', hasClue3);
      const statusEl = this.dom.slot3.querySelector('.s2-slot-status');
      if (statusEl) statusEl.textContent = hasClue3 ? '✓ LOCKER PHONE' : '[ ??? ]';
    }
  }

  showHint() {
    if (!this.dom.hintToast) return;

    const message = HINT_MESSAGES[this.state.hintLevel % HINT_MESSAGES.length];
    this.state.hintLevel++;

    this.dom.hintToast.textContent = `💡 HINT: ${message}`;
    this.dom.hintToast.style.display = 'block';

    audio.playSFX('paper-rustle');

    setTimeout(() => {
      if (this.dom.hintToast) this.dom.hintToast.style.display = 'none';
    }, 3200);
  }

  cleanup() {
    this.stopMeterLoop();
    this.state.failed = false;
    this.state.isDialogueActive = false;
    if (this.dom.failModal) this.dom.failModal.style.display = 'none';
    if (this.dom.hintToast) this.dom.hintToast.style.display = 'none';
  }
}

export const stage2 = new Stage2();
