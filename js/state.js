/**
 * UNDER INVESTIGATION — Game State & Evidence Machine (state.js)
 */

export const EvidenceRegistry = {
  NOTE_APARTMENT: {
    id: 'note_apartment',
    name: 'Meeting Point Note',
    category: 'Document',
    desc: 'Instructions pointing to Apartment 69, Gokuldham: "When the power supply cuts, go inside from the secret entrance."',
    foundIn: 'stage2'
  },
  LOCKER_PHONE_INFO: {
    id: 'locker_phone_info',
    name: 'Secret Locker Instruction',
    category: 'Testimony',
    desc: 'Leo was told to contact the mastermind through a phone hidden inside a locker.',
    foundIn: 'stage2'
  },
  LOCKER_PIN: {
    id: 'locker_pin',
    name: 'Locker PIN: 4712',
    category: 'Code',
    desc: 'Found written on a slip hidden under a wallet in Apartment 69.',
    foundIn: 'stage3'
  },
  SECURITY_PRINTOUT: {
    id: 'security_printout',
    name: 'Lab Entry Log (Maya Lin)',
    category: 'Physical Evidence',
    desc: 'Security card printout showing Maya Lin entered at 02:08 AM during the camera blackout window (02:00–02:20 AM).',
    foundIn: 'stage3'
  },
  BURNER_PHONE: {
    id: 'burner_phone',
    name: 'Unlocked Burner Phone',
    category: 'Device',
    desc: 'Unlocked with PIN 0200. Recovered 3 contacts: Maya Lin, Dr. Jhatka, Elena Rostova.',
    foundIn: 'stage3'
  },
  POLICE_OVERRIDE: {
    id: 'police_override',
    name: 'Police Security Override',
    category: 'Digital Forensics',
    desc: 'Camera system override executed at 02:03 AM under authorization POLICE SECURITY, device POLICE-07.',
    foundIn: 'stage5'
  }
};

export class GameStateMachine {
  constructor() {
    this.currentStage = 0; // 0 = Title/Prologue, 1..5 = Stages, 6 = Ending
    this.evidence = [];    // Array of collected evidence objects
    this.flags = {};       // Arbitrary progression flags
    this.strikes = 0;
    this.listeners = new Set();
  }

  // Subscribe to state changes
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(event, payload) {
    for (const fn of this.listeners) {
      fn(event, payload, this);
    }
  }

  setStage(stageNum) {
    const prev = this.currentStage;
    this.currentStage = stageNum;
    this.notify('stage_change', { from: prev, to: stageNum });
  }

  addEvidence(evidenceKeyOrObj) {
    const item = typeof evidenceKeyOrObj === 'string' 
      ? EvidenceRegistry[evidenceKeyOrObj] 
      : evidenceKeyOrObj;

    if (!item) return false;
    
    if (!this.evidence.some(e => e.id === item.id)) {
      this.evidence.push(item);
      this.notify('evidence_added', item);
      return true;
    }
    return false;
  }

  hasEvidence(id) {
    return this.evidence.some(e => e.id === id);
  }

  setFlag(key, value = true) {
    this.flags[key] = value;
    this.notify('flag_set', { key, value });
  }

  getFlag(key) {
    return !!this.flags[key];
  }

  resetStage(stageNum) {
    this.notify('stage_reset', { stage: stageNum });
  }

  resetAll() {
    this.currentStage = 0;
    this.evidence = [];
    this.flags = {};
    this.strikes = 0;
    this.notify('full_reset', null);
  }
}

export const gameState = new GameStateMachine();
