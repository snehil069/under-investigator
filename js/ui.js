/**
 * UNDER INVESTIGATION — UI System & Dialogue Queue (ui.js)
 */

import { audio } from './audio.js';
import { gameState } from './state.js';

class UIManager {
  constructor() {
    this.dialogueQueue = [];
    this.isDialoguePlaying = false;
    this.currentDialogueResolve = null;

    this.dialogueOverlay = null;
    this.speakerElem = null;
    this.textElem = null;
    this.evidenceDrawer = null;
    this.evidenceList = null;
  }

  init() {
    this.dialogueOverlay = document.getElementById('dialogue-overlay');
    this.speakerElem = document.getElementById('dialogue-speaker');
    this.textElem = document.getElementById('dialogue-text');
    this.evidenceDrawer = document.getElementById('evidence-drawer');
    this.evidenceList = document.getElementById('evidence-list');

    // Dialogue advance click on overlay
    if (this.dialogueOverlay) {
      this.dialogueOverlay.addEventListener('click', () => this.advanceDialogue());
    }

    // Global click advances dialogue if open (unless clicking a game action button)
    document.addEventListener('click', (e) => {
      if (this.isDialoguePlaying && !e.target.closest('#btn-s2-stop-meter') && !e.target.closest('#btn-toggle-evidence')) {
        this.advanceDialogue();
      }
    });

    // Keyboard support for dialogue advance
    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && this.isDialoguePlaying) {
        this.advanceDialogue();
      }
    });

    // Evidence drawer button toggle
    const toggleEvidenceBtn = document.getElementById('btn-toggle-evidence');
    const closeEvidenceBtn = document.getElementById('btn-close-evidence');
    if (toggleEvidenceBtn) {
      toggleEvidenceBtn.addEventListener('click', () => this.toggleEvidenceDrawer());
    }
    if (closeEvidenceBtn) {
      closeEvidenceBtn.addEventListener('click', () => this.closeEvidenceDrawer());
    }

    // Audio mute button
    const muteBtn = document.getElementById('btn-toggle-audio');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        muteBtn.textContent = isMuted ? '🔇 MUTED' : '🔊 AUDIO';
      });
    }

    // Subscribe to gameState to update evidence panel
    gameState.subscribe((event, data) => {
      if (event === 'evidence_added') {
        this.renderEvidenceList();
        this.showToast(`EVIDENCE ACQUIRED: ${data.name}`);
      } else if (event === 'stage2_evidence_cleared' || event === 'evidence_removed') {
        this.renderEvidenceList();
      }
    });
  }

  showDialogue(dialogueLines) {
    return new Promise((resolve) => {
      this.dialogueQueue = Array.isArray(dialogueLines) ? [...dialogueLines] : [dialogueLines];
      this.currentDialogueResolve = resolve;
      this.isDialoguePlaying = true;
      if (this.dialogueOverlay) {
        this.dialogueOverlay.classList.add('visible');
      }
      this.processNextDialogueLine();
    });
  }

  processNextDialogueLine() {
    if (this.dialogueQueue.length === 0) {
      this.dismissDialogue();
      return;
    }

    const currentLine = this.dialogueQueue.shift();
    
    // Set speaker
    if (this.speakerElem) {
      this.speakerElem.textContent = currentLine.speaker;
      this.speakerElem.className = 'dialogue-speaker';
      const speakerKey = currentLine.speaker.toLowerCase();
      if (['vance', 'jaga', 'leo', 'maya'].includes(speakerKey)) {
        this.speakerElem.classList.add(`speaker-${speakerKey}`);
      }
    }

    // Display text
    if (this.textElem) {
      this.textElem.textContent = currentLine.text;
    }

    // Play Voice MP3 if provided
    if (currentLine.voice) {
      audio.playVoice(currentLine.voice);
    } else {
      audio.playNext();
    }
  }

  advanceDialogue() {
    if (!this.isDialoguePlaying) return;
    audio.playNext();
    this.processNextDialogueLine();
  }

  dismissDialogue() {
    this.dialogueQueue = [];
    this.isDialoguePlaying = false;
    if (this.dialogueOverlay) {
      this.dialogueOverlay.classList.remove('visible');
    }
    if (this.currentDialogueResolve) {
      const res = this.currentDialogueResolve;
      this.currentDialogueResolve = null;
      res();
    }
  }

  toggleEvidenceDrawer() {
    if (this.evidenceDrawer) {
      audio.playClick();
      this.evidenceDrawer.classList.toggle('open');
      this.renderEvidenceList();
    }
  }

  closeEvidenceDrawer() {
    if (this.evidenceDrawer) {
      audio.playClick();
      this.evidenceDrawer.classList.remove('open');
    }
  }

  renderEvidenceList() {
    if (!this.evidenceList) return;
    this.evidenceList.innerHTML = '';

    if (gameState.evidence.length === 0) {
      this.evidenceList.innerHTML = '<div style="color: var(--ink-faint); font-family: var(--font-typewriter); font-size: 12px; text-align: center; padding: 20px;">[ NO EVIDENCE RECORDED YET ]</div>';
      return;
    }

    gameState.evidence.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'evidence-card-item';
      card.innerHTML = `
        <div class="evidence-card-title">${item.name}</div>
        <div style="font-size: 11px; color: var(--accent-red); font-family: var(--font-typewriter); margin-bottom: 4px;">${item.category || 'CLUE'}</div>
        <div class="evidence-card-desc">${item.desc}</div>
      `;
      this.evidenceList.appendChild(card);
    });
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'absolute';
    toast.style.top = '64px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'var(--accent-red)';
    toast.style.color = '#fff';
    toast.style.padding = '8px 18px';
    toast.style.fontFamily = 'var(--font-typewriter)';
    toast.style.fontSize = '12px';
    toast.style.fontWeight = 'bold';
    toast.style.border = '2px solid #000';
    toast.style.boxShadow = 'var(--shadow-hard)';
    toast.style.zIndex = '200';
    toast.style.letterSpacing = '1px';
    toast.textContent = message;

    const container = document.getElementById('game-container') || document.body;
    container.appendChild(toast);
    audio.playSFX('discovery-chime');

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

export const ui = new UIManager();
