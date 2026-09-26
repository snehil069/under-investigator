# UNDER INVESTIGATION 🕵️‍♂️🔍

> **"Chase the suspect. Follow the evidence. Crack the case."**  
> A five-stage arcade detective investigation game where every new clue changes the case.

---

## 🎮 Game Concept & Stages

- **Stage 1 — Hit the Suspect:** Fast-paced reflex arcade interaction targeting Leo's facial hotspots.
- **Stage 2 — Break the Silence:** Oscillating tension pressure meter interrogation to unlock 3 crucial secrets.
- **Stage 3 — Find the Clue:** Detailed room search of Apartment 69, Gokuldham unlocking the locker PIN chain and burner phone.
- **Stage 4 — Find the Liar:** Cross-examination of suspect statements against collected security entry evidence.
- **Stage 5 — Solve the Case:** Final deduction, scripted contradiction glitch, evidence reconstruction, and partner confrontation.

---

## 🛠️ Tech Stack

- **Frontend Core:** HTML5, CSS3 (Custom Properties & Keyframe FX), Vanilla JS (ES Modules)
- **Audio Engine:** Howler.js via CDN (Ambience loops, interactive SFX, Voiceover queue)
- **Deployment:** Vercel Static Hosting

---

## 📁 Project Architecture

```
under-investigation/
├── index.html            # Main game container & stage sections
├── README.md             # Project documentation
├── .gitignore            # Git exclusions
├── vercel.json           # Vercel configuration
├── css/
│   ├── base.css          # Noir case-file visual theme, paper styles, dialog box, buttons
│   └── stages.css        # Per-stage layouts & animations
├── js/
│   ├── main.js           # Game boot, scene router, lifecycle hooks
│   ├── state.js          # Central state machine & evidence tracker
│   ├── audio.js          # Howler audio manager (SFX, Ambience, Voiceover)
│   ├── ui.js             # Dialogue queue manager, evidence drawer, notifications
│   ├── stage1.js         # Stage 1: Hit the Suspect
│   ├── stage2.js         # Stage 2: Break the Silence
│   ├── stage3.js         # Stage 3: Apartment 69 Clue Chain
│   ├── stage4.js         # Stage 4: Suspect Statements & Liar Contradiction
│   └── stage5.js         # Stage 5: Final Deduction & Twist Reveal
└── assets/
    ├── img/              # Character portraits, backgrounds, evidence items
    ├── sfx/              # Foley, UI clicks, impact hits, stings
    └── voice/            # Voiceover MP3 lines
```

---

## 🚀 Running Locally

Open `index.html` directly in any modern web browser or serve using a simple static server:

```bash
# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve .
```
