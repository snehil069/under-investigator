/**
 * UNDER INVESTIGATION — Stage 2: Break the Silence (stage2.js)
 * Circular dial gauge & linear track oscillating 0 -> 100 -> 0 repeatedly.
 * Target ranges: Round 1 (43 to 57), Round 2 (46 to 54), Round 3 (48 to 52).
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
    speed: 0.0028, // Sweep speed
    displayText: "43 — 57"
  },
  {
    round: 2,
    minVal: 46.0,
    maxVal: 54.0,
    speed: 0.0038, // Faster
    displayText: "46 — 54"
  },
  {
    round: 3,
    minVal: 48.0,
    maxVal: 52.0,
    speed: 0.0048, // Fastest & tightest
    displayText: "48 — 52"
  }
];

const HINT_MESSAGES = [
  "WATCH THE NEEDLE ROTATE 0 TO 100.",
  "THE RED ZONE IS THE SAFE ZONE AROUND 50.",
  "STOP WHEN THE PRESSURE VALUE IS INSIDE THE TARGET RANGE."
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
      failed: false
    };

    this.pressureValue = 0; // 0 to 100
    this.animFrameId = null;
    this.startTime = 0;
    this.lastTickTime = 0;

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
      briefingModal: document.getElementById('s2-briefing-modal'),
      btnStartInterrogation: document.getElementById('btn-s2-start-interrogation'),
      failModal: document.getElementById('s2-fail-modal'),
      failStoppedVal: document.getElementById('s2-fail-stopped-val'),
      btnRetry: document.getElementById('btn-s2-retry')
    };

    // Attach Stop Button
    if (this.dom.btnStopMeter) {
      this.dom.btnStopMeter.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleStopAttempt();
      });
    }

    // Spacebar listener for stopping meter
    window.addEventListener('keydown', (e) => {
      if (gameState.currentStage === 2 && (e.code === 'Space' || e.code === 'Enter')) {
        if (this.state.meterRunning && !ui.isDialoguePlaying) {
          e.preventDefault();
          this.handleStopAttempt();
        }
      }
    });

    // Attach Start Interrogation Button
    if (this.dom.btnStartInterrogation) {
      this.dom.btnStartInterrogation.addEventListener('click', () => {
        audio.playSFX('ui-click');
        if (this.dom.briefingModal) this.dom.briefingModal.style.display = 'none';
        this.startCurrentRound();
      });
    }

    // Attach Retry Button on Failure
    if (this.dom.btnRetry) {
      this.dom.btnRetry.addEventListener('click', () => {
        audio.playSFX('ui-click');
        if (this.dom.failModal) this.dom.failModal.style.display = 'none';
        this.fullStageReset(true);
      });
    }

    // Attach Hint Button
    if (this.dom.btnHint) {
      this.dom.btnHint.addEventListener('click', () => this.showHint());
    }
  }

  async start() {
    console.log('[Stage 2] Started: Break the Silence');
    audio.playAmbience('stage2_bg');

    // Run opening dialogue sequence first
    await ui.showDialogue([
      { speaker: 'VANCE', text: "Let's hear the rest." },
      { speaker: 'JAGA', text: "Where do we start?" },
      { speaker: 'VANCE', text: "With the truth." }
    ]);

    // Show Briefing Objective Modal
    if (this.dom.briefingModal) {
      this.dom.briefingModal.style.display = 'flex';
    }
    if (this.dom.failModal) {
      this.dom.failModal.style.display = 'none';
    }

    this.fullStageReset(false);
  }

  fullStageReset(autoStart = true) {
    this.stopMeterLoop();

    this.state = {
      round: 1,
      streak: 0,
      clueIndex: 0,
      hintLevel: 0,
      meterRunning: false,
      failed: false
    };

    // Remove only stage 2 evidence
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
    
    // Position success zone on track & digital display
    if (this.dom.successZone) {
      this.dom.successZone.style.setProperty('--zone-left', `${config.minVal}%`);
      this.dom.successZone.style.setProperty('--zone-width', `${config.maxVal - config.minVal}%`);
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
    this.startTime = performance.now();
    this.lastTickTime = performance.now();
    this.runMeterLoop();
  }

  runMeterLoop() {
    this.stopMeterLoop();

    const config = ROUND_CONFIG[this.state.round - 1] || ROUND_CONFIG[0];

    const animate = (timestamp) => {
      if (!this.state.meterRunning) return;

      const elapsed = timestamp - this.startTime;
      
      // Continuous sine sweep oscillating smoothly 0 to 100 to 0 repeatedly
      // sin oscillates from -1 to +1 -> mapped to 0 to 100
      const sineWave = (Math.sin(elapsed * config.speed) + 1) / 2; // 0.0 to 1.0
      this.pressureValue = sineWave * 100; // 0.0 to 100.0

      // Update digital readout
      if (this.dom.pressureValDisplay) {
        this.dom.pressureValDisplay.textContent = this.pressureValue.toFixed(1);
      }

      // Update linear track pointer
      if (this.dom.meterPointer) {
        this.dom.meterPointer.style.setProperty('--pointer-pos', `${this.pressureValue}%`);
      }

      // Update circular dial needle rotation (-130deg for 0 to +130deg for 100)
      const dialRot = -130 + (this.pressureValue / 100) * 260;
      if (this.dom.dialNeedleWrap) {
        this.dom.dialNeedleWrap.style.setProperty('--dial-rot', `${dialRot}deg`);
      }

      // Periodic meter ticking SFX
      if (timestamp - this.lastTickTime > 260) {
        this.lastTickTime = timestamp;
        audio.playSFX('meter-swing-tick');
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
    if (!this.state.meterRunning || this.state.failed) return;

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
        { speaker: 'JAGA', text: "Where were you supposed to go?" },
        { speaker: 'LEO', text: "Apartment 69. Gokuldham." }
      ]);

      // Return Leo image to normal & setup Round 2
      this.dom.leoImg.src = 'assets/img/stage2_leo_interrogation.png';
      this.dom.sceneContainer.classList.remove('shocked');

      this.state.round = 2;
      setTimeout(() => this.startCurrentRound(), 400);

    } else if (currentRound === 2) {
      // Clue 2: Secret Entrance & Handwritten Note
      gameState.addEvidence('secret-entrance');
      gameState.addEvidence('handwritten-note');
      this.updateCluesTray();

      await ui.showDialogue([
        { speaker: 'JAGA', text: "Why?" },
        { speaker: 'LEO', text: "That was the meeting point." },
        { speaker: 'JAGA', text: "How did they get inside?" },
        { speaker: 'LEO', text: "When the power cuts, use the secret entrance." }
      ]);

      // Return Leo image to normal & setup Round 3
      this.dom.leoImg.src = 'assets/img/stage2_leo_interrogation.png';
      this.dom.sceneContainer.classList.remove('shocked');

      this.state.round = 3;
      setTimeout(() => this.startCurrentRound(), 400);

    } else if (currentRound === 3) {
      // Clue 3: Locker Phone
      gameState.addEvidence('locker-phone');
      this.updateCluesTray();

      await ui.showDialogue([
        { speaker: 'JAGA', text: "Who told you?" },
        { speaker: 'LEO', text: "I don't know." },
        { speaker: 'JAGA', text: "How were you contacted?" },
        { speaker: 'LEO', text: "Through a phone." },
        { speaker: 'JAGA', text: "Where is it?" },
        { speaker: 'LEO', text: "Inside a locker." }
      ]);

      // Completion Sequence
      await ui.showDialogue([
        { speaker: 'NARRATOR', text: "THREE CLUES. ONE LOCATION. ONE PHONE. ONE SECRET." },
        { speaker: 'JAGA', text: "Apartment 69. Secret entrance. Locker phone." },
        { speaker: 'VANCE', text: "Then that's where we go." }
      ]);

      gameState.setFlag('stage2Complete', true);
      audio.playWin();

      setTimeout(() => {
        gameState.setStage(3);
      }, 600);
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
      this.dom.slot1.querySelector('.s2-slot-status').textContent = hasClue1 ? '✓ APARTMENT 69' : '[ ??? ]';
    }

    // Slot 2: Secret Entrance
    if (this.dom.slot2) {
      const hasClue2 = gameState.hasEvidence('secret-entrance');
      this.dom.slot2.classList.toggle('unlocked', hasClue2);
      this.dom.slot2.querySelector('.s2-slot-status').textContent = hasClue2 ? '✓ SECRET ENTRANCE' : '[ ??? ]';
    }

    // Slot 3: Locker Phone
    if (this.dom.slot3) {
      const hasClue3 = gameState.hasEvidence('locker-phone');
      this.dom.slot3.classList.toggle('unlocked', hasClue3);
      this.dom.slot3.querySelector('.s2-slot-status').textContent = hasClue3 ? '✓ LOCKER PHONE' : '[ ??? ]';
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
    if (this.dom.briefingModal) this.dom.briefingModal.style.display = 'none';
    if (this.dom.failModal) this.dom.failModal.style.display = 'none';
    if (this.dom.hintToast) this.dom.hintToast.style.display = 'none';
  }
}

export const stage2 = new Stage2();
