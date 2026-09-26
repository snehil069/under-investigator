/**
 * UNDER INVESTIGATION — Stage 1: Hit the Suspect (stage1.js)
 */

import { gameState } from './state.js';
import { ui } from './ui.js';
import { audio } from './audio.js';

const COMIC_WORDS = ['WHACK!', 'POW!', 'BAM!', 'CRACK!', 'SMACK!'];
const GAME_DURATION = 20;
const HITS_PER_ZONE = 3;
const TOTAL_ZONES = 5;
const TARGET_TOTAL_HITS = TOTAL_ZONES * HITS_PER_ZONE; // 15

export class Stage1 {
  constructor() {
    this.container = document.getElementById('stage-1');
    this.totalHits = 0;
    this.timerRemaining = GAME_DURATION;
    this.timerInterval = null;
    this.lastHitTime = 0;
    this.isPlaying = false;

    this.zones = {
      head: { name: 'HEAD', hits: 0, max: HITS_PER_ZONE, completed: false },
      leftEye: { name: 'L-EYE', hits: 0, max: HITS_PER_ZONE, completed: false },
      rightEye: { name: 'R-EYE', hits: 0, max: HITS_PER_ZONE, completed: false },
      nose: { name: 'NOSE', hits: 0, max: HITS_PER_ZONE, completed: false },
      mouthChin: { name: 'CHIN', hits: 0, max: HITS_PER_ZONE, completed: false }
    };

    // DOM references
    this.dom = {};
  }

  init() {
    this.dom = {
      briefingModal: document.getElementById('s1-briefing-modal'),
      failModal: document.getElementById('s1-fail-modal'),
      btnStartAction: document.getElementById('btn-s1-start-action'),
      btnRetry: document.getElementById('btn-s1-retry'),
      timerDisplay: document.getElementById('s1-timer-display'),
      timerBox: document.getElementById('s1-timer-box'),
      hitsDisplay: document.getElementById('s1-hits-display'),
      hitsProgress: document.getElementById('s1-hits-progress'),
      failHitsDisplay: document.getElementById('s1-fail-hits'),
      characterMover: document.getElementById('s1-character-mover'),
      characterStage: document.getElementById('s1-character-stage'),
      characterImg: document.getElementById('s1-character-img'),
      impactFlash: document.getElementById('s1-impact-flash'),
      fxLayer: document.getElementById('s1-fx-layer'),
      hitboxes: {
        head: document.getElementById('s1-hitbox-head'),
        leftEye: document.getElementById('s1-hitbox-leftEye'),
        rightEye: document.getElementById('s1-hitbox-rightEye'),
        nose: document.getElementById('s1-hitbox-nose'),
        mouthChin: document.getElementById('s1-hitbox-mouthChin')
      },
      badges: {
        head: document.getElementById('s1-badge-head'),
        leftEye: document.getElementById('s1-badge-leftEye'),
        rightEye: document.getElementById('s1-badge-rightEye'),
        nose: document.getElementById('s1-badge-nose'),
        mouthChin: document.getElementById('s1-badge-mouthChin')
      }
    };

    // Attach Briefing Start Button
    if (this.dom.btnStartAction) {
      this.dom.btnStartAction.addEventListener('click', () => {
        audio.playSFX('ui-click');
        this.dom.briefingModal.style.display = 'none';
        this.startArcadeAction();
      });
    }

    // Attach Retry Button
    if (this.dom.btnRetry) {
      this.dom.btnRetry.addEventListener('click', () => {
        audio.playSFX('ui-click');
        this.dom.failModal.style.display = 'none';
        this.startArcadeAction();
      });
    }

    // Attach Hitbox Handlers
    for (const [zoneKey, hitboxEl] of Object.entries(this.dom.hitboxes)) {
      if (!hitboxEl) continue;

      const triggerHit = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.handleHit(zoneKey, e);
      };

      hitboxEl.addEventListener('touchstart', triggerHit, { passive: false });
      hitboxEl.addEventListener('mousedown', triggerHit);
    }
  }

  start() {
    console.log('[Stage 1] Started: Hit the Suspect');
    audio.playAmbience('noir-ambient-loop');

    // Show initial briefing modal
    if (this.dom.briefingModal) {
      this.dom.briefingModal.style.display = 'flex';
    }
    if (this.dom.failModal) {
      this.dom.failModal.style.display = 'none';
    }

    this.resetState();
  }

  resetState() {
    this.stopTimer();
    this.totalHits = 0;
    this.timerRemaining = GAME_DURATION;
    this.isPlaying = false;
    this.lastHitTime = 0;

    for (const key in this.zones) {
      this.zones[key].hits = 0;
      this.zones[key].completed = false;
    }

    if (this.dom.characterMover) {
      this.dom.characterMover.style.animationPlayState = 'running';
    }

    if (this.dom.characterImg) {
      this.dom.characterImg.src = 'assets/img/leo1.png';
    }

    if (this.dom.timerBox) {
      this.dom.timerBox.classList.remove('warning');
    }

    if (this.dom.fxLayer) {
      this.dom.fxLayer.innerHTML = '';
    }

    this.updateHUD();
  }

  startArcadeAction() {
    this.resetState();
    this.isPlaying = true;
    this.startTimer();
  }

  startTimer() {
    this.stopTimer();
    this.updateTimerUI();

    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      this.updateTimerUI();

      if (this.timerRemaining <= 0) {
        this.timerRemaining = 0;
        this.stopTimer();
        this.handleTimeout();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerUI() {
    if (this.dom.timerDisplay) {
      this.dom.timerDisplay.textContent = this.timerRemaining;
    }

    if (this.dom.timerBox) {
      if (this.timerRemaining <= 5 && this.isPlaying) {
        this.dom.timerBox.classList.add('warning');
      } else {
        this.dom.timerBox.classList.remove('warning');
      }
    }
  }

  handleHit(zoneKey, event) {
    if (!this.isPlaying || this.timerRemaining <= 0) return;

    // Rate limiter (prevents accidental jitter double-hits)
    const now = performance.now();
    if (now - this.lastHitTime < 90) return;
    this.lastHitTime = now;

    const zone = this.zones[zoneKey];
    if (!zone || zone.completed) return;

    // Increment hit counters
    zone.hits++;
    this.totalHits++;

    if (zone.hits >= zone.max) {
      zone.hits = zone.max;
      zone.completed = true;
    }

    // Play hit sound effect
    audio.playHit();

    // Trigger visual jolt & comic popup
    this.triggerPunchEffect(zoneKey, event);
    this.updateHUD();
    this.updateExpression();

    // Check Win Condition
    if (this.totalHits >= TARGET_TOTAL_HITS) {
      this.handleWin();
    }
  }

  triggerPunchEffect(zoneKey, event) {
    // 1. Character jolt
    if (this.dom.characterStage) {
      this.dom.characterStage.classList.remove('punched');
      void this.dom.characterStage.offsetWidth; // Reflow

      const randOffset = (Math.random() - 0.5) * 24;
      const randRot = (Math.random() - 0.5) * 6;
      this.dom.characterStage.style.setProperty('--punch-offset-x', `${randOffset}px`);
      this.dom.characterStage.style.setProperty('--punch-rot', `${randRot}deg`);
      this.dom.characterStage.classList.add('punched');
    }

    // 2. White flash
    if (this.dom.impactFlash) {
      this.dom.impactFlash.classList.add('flash');
      setTimeout(() => {
        if (this.dom.impactFlash) this.dom.impactFlash.classList.remove('flash');
      }, 70);
    }

    // 3. Comic Burst Text & Sparks
    this.spawnComicBurst(zoneKey, event);
  }

  spawnComicBurst(zoneKey, event) {
    if (!this.dom.fxLayer || !this.dom.characterStage) return;

    const stageRect = this.dom.characterStage.getBoundingClientRect();
    let clickX = stageRect.width / 2;
    let clickY = stageRect.height / 2;

    if (event && event.clientX) {
      clickX = event.clientX - stageRect.left;
      clickY = event.clientY - stageRect.top;
    } else {
      const hitboxEl = this.dom.hitboxes[zoneKey];
      if (hitboxEl) {
        clickX = hitboxEl.offsetLeft + hitboxEl.offsetWidth / 2;
        clickY = hitboxEl.offsetTop + hitboxEl.offsetHeight / 2;
      }
    }

    // Comic Word Element
    const comicEl = document.createElement('div');
    const randomWord = COMIC_WORDS[Math.floor(Math.random() * COMIC_WORDS.length)];
    comicEl.className = 's1-comic-burst';
    comicEl.textContent = randomWord;
    comicEl.style.left = `${clickX}px`;
    comicEl.style.top = `${clickY}px`;
    this.dom.fxLayer.appendChild(comicEl);

    // Sparks
    for (let i = 0; i < 5; i++) {
      const spark = document.createElement('div');
      spark.className = 's1-spark';
      spark.style.left = `${clickX}px`;
      spark.style.top = `${clickY}px`;
      const angle = (Math.PI * 2 / 5) * i + (Math.random() * 0.5);
      const distance = 25 + Math.random() * 35;
      spark.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      this.dom.fxLayer.appendChild(spark);
      setTimeout(() => spark.remove(), 320);
    }

    setTimeout(() => comicEl.remove(), 400);
  }

  updateExpression() {
    if (!this.dom.characterImg) return;

    let targetImg = 'assets/img/leo1.png';
    if (this.totalHits >= 12) {
      targetImg = 'assets/img/leodefeat.png';
    } else if (this.totalHits >= 9) {
      targetImg = 'assets/img/leo4.png';
    } else if (this.totalHits >= 6) {
      targetImg = 'assets/img/leo3.png';
    } else if (this.totalHits >= 3) {
      targetImg = 'assets/img/leo2.png';
    }

    if (this.dom.characterImg.getAttribute('src') !== targetImg) {
      this.dom.characterImg.src = targetImg;
    }
  }

  updateHUD() {
    // Total hits & Progress Bar
    if (this.dom.hitsDisplay) {
      this.dom.hitsDisplay.innerHTML = `${this.totalHits}<span class="s1-hud-sub">/15</span>`;
    }
    if (this.dom.hitsProgress) {
      const percent = Math.min(100, (this.totalHits / TARGET_TOTAL_HITS) * 100);
      this.dom.hitsProgress.style.width = `${percent}%`;
    }

    // 5 Zone Badges & Hitboxes
    for (const key in this.zones) {
      const zone = this.zones[key];
      const badgeEl = this.dom.badges[key];
      const hitboxEl = this.dom.hitboxes[key];

      if (badgeEl) {
        const countText = badgeEl.querySelector('.s1-badge-count');
        if (countText) countText.textContent = `${zone.hits}/${zone.max}`;

        const pips = badgeEl.querySelectorAll('.pip');
        pips.forEach((pip, idx) => {
          if (idx < zone.hits) pip.classList.add('active');
          else pip.classList.remove('active');
        });

        if (zone.completed) badgeEl.classList.add('completed');
        else badgeEl.classList.remove('completed');
      }

      if (hitboxEl) {
        if (zone.completed) hitboxEl.classList.add('completed');
        else hitboxEl.classList.remove('completed');
      }
    }
  }

  handleTimeout() {
    this.isPlaying = false;
    audio.playLose();

    if (this.dom.failHitsDisplay) {
      this.dom.failHitsDisplay.textContent = `${this.totalHits} / 15`;
    }

    if (this.dom.failModal) {
      this.dom.failModal.style.display = 'flex';
    }
  }

  async handleWin() {
    this.isPlaying = false;
    this.stopTimer();

    // Pause mover and show defeated state
    if (this.dom.characterMover) {
      this.dom.characterMover.style.animationPlayState = 'paused';
    }
    if (this.dom.characterImg) {
      this.dom.characterImg.src = 'assets/img/leodefeat.png';
    }

    // Play Victory Stinger
    audio.playWin();

    // Brief pause for impact
    setTimeout(async () => {
      await ui.showDialogue([
        { speaker: 'LEO', text: "Stop! I yield! You have the wrong man! I didn't steal the research prototype!" },
        { speaker: 'LEO', text: "I was only paid to cause a commotion and draw security away! I never even saw the mastermind's face!" },
        { speaker: 'VANCE', text: "Save the excuses for the interrogation room. We caught you red-handed fleeing the perimeter." },
        { speaker: 'JAGA', text: "He wasn't carrying the stolen prototype, Vance. Let's break his silence and find who hired him." }
      ]);

      gameState.setStage(2);
    }, 450);
  }

  cleanup() {
    this.stopTimer();
    this.isPlaying = false;
    if (this.dom.briefingModal) this.dom.briefingModal.style.display = 'none';
    if (this.dom.failModal) this.dom.failModal.style.display = 'none';
  }
}

export const stage1 = new Stage1();
