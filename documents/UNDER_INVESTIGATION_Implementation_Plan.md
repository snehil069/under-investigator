# UNDER INVESTIGATION — Final Implementation Plan

**Game-A-Thon Build | HTML/CSS/Vanilla JS | Vercel Deploy | Antigravity-Assisted**

---

## 0. The One Rule

> 5 scenes. 1 mechanic each. All feeding one mystery.
> Anything that doesn't serve a stage mechanic is decoration — cut it first.

---

## 1. Tech Stack (Locked)

| Layer | Choice | Why |
| --- | --- | --- |
| Core | HTML + CSS + Vanilla JS (ES modules) | No build step, instant Vercel deploy, zero dependency risk |
| Audio engine | Howler.js (CDN) | Looping ambience, overlapping SFX, per-sound volume |
| Animation | CSS transitions/keyframes + Canvas for Stage 1 targets | No framework needed; glitch effect = CSS keyframes + screen-shake |
| Hosting | Vercel (static) | Free, auto-deploy from GitHub |
| Voiceover | Pre-generated MP3s (ElevenLabs free tier, OpenAI TTS as backup) | No live API calls, no exposed keys, no stage-Wi-Fi dependency |
| Version control | Git + GitHub | One commit per working stage; main branch always playable |

**Explicitly rejected:** React/Vue (overkill), Phaser (learning curve mid-jam), live TTS (latency + exposed keys), build tools (webpack/vite — unnecessary for vanilla).

---

## 2. Project Setup (Do Before the Jam / Hour 0)

### 2.1 Local folder

```javascript
under-investigation/
├── index.html
├── README.md
├── .gitignore
├── css/
│   ├── base.css          (case-file theme: paper, sepia, dark borders, red accents)
│   └── stages.css        (per-stage layouts)
├── js/
│   ├── main.js           (boot + scene router)
│   ├── state.js          (game state machine + evidence tracker)
│   ├── audio.js          (Howler wrapper, per-stage ambience, voice player)
│   ├── ui.js             (dialogue box with audio+text fallback, evidence panel, transitions)
│   ├── stage1.js         (target-hitting)
│   ├── stage2.js         (meter interrogation)
│   ├── stage3.js         (apartment search / clue chain)
│   ├── stage4.js         (suspect statements)
│   └── stage5.js         (deduction + 3 puzzles + reveal)
├── assets/
│   ├── img/
│   ├── sfx/
│   └── voice/
└── vercel.json           (cache headers, optional)
```

### 2.2 .gitignore

```javascript
.DS_Store
node_modules/
.vercel/
*.log
```

### 2.3 GitHub + Vercel wiring

```bash
# create repo on GitHub (public, no README), then:
git init
git add .
git commit -m "Initial commit: project skeleton"
git branch -M main
git remote add origin https://github.com/snehil069/under-investigation.git
git push -u origin main
```

Then vercel.com → Add New Project → Import `under-investigation` → Framework: **Other** → Build command: empty → Deploy.

**Result: every `git push` = auto-deploy in ~30s.**

### 2.4 Git Safety Strategy (Non-Negotiable)

- **Rule:** `main` branch is ALWAYS playable. Antigravity works on `stage-N` branches.
- **Commit + push after every working stage.** Worst case = lose 30 min, not 6 hours.
- **Tag every finished stage:** `git tag stage-1-done && git push origin --tags`

Emergency commands (memorize / keep open):

```bash
git log --oneline                    # find the good commit
git checkout -- js/stage2.js         # restore ONE broken file
git checkout stage-1-done            # time travel to a good state
git stash                            # hide uncommitted mess (recoverable)
```

---

## 3. Game Architecture

### 3.1 Scene Router (main.js)

Simple state machine. `state.js` holds:

```js
const gameState = {
  currentStage: 0,              // 0 = prologue/title
  evidence: [],                 // collected evidence ids
  flags: {},                    // e.g. lockerOpen: true, phoneUnlocked: true
  strikes: 0,
};
```

`main.js` swaps `<section>` blocks per stage. **Build this FIRST. Every stage plugs into it.**

### 3.2 Dialogue System (ui.js)

Every line is an object:

```js
{ speaker: "LEO", voice: "voice/leo_02.mp3", text: "You have the wrong man." }
```

- Plays MP3 via Howler; **text always displays** (silent-demo fallback)
- Click/Space to advance; queue support for multi-line exchanges
- Speaker name styled per character (Vance gets a trusted-blue accent — subtle foreshadowing)

### 3.3 Evidence Tracker (state.js)

Mirrors the GDD evidence table. Each evidence item = `{ id, name, img, foundIn, usedIn }`. Stage 3/4/5 read from this array. The Stage 5 evidence board is literally a rendered view of this array + connections.

---

## 4. Asset Plan

### 4.1 Images (14 must-have, generate before/with Prompt 0)

**Universal style prefix for every prompt:**

> "Retro detective case-file illustration, worn paper and sepia palette, warm cinematic lamplight, corkboard aesthetic, stylized 2D game art, no text, no watermark"

| # | File | Prompt focus |
| --- | --- | --- |
| 1 | `leo_face.png` | front-view male face, exaggerated readable features, plain background — THE gameplay asset |
| 2 | `leo_face_hit.png` | same face, flinch/impact expression |
| 3 | `lab_perimeter.png` | night college laboratory exterior, fence, dark sky — Stage 1 bg |
| 4 | `interrogation.png` | sparse room, single hanging lamp, hard shadows — Stage 2 bg |
| 5 | `apartment.png` | dusty abandoned apartment, visible desk, drawer, shelf, locker — Stage 3 bg |
| 6–9 | `portrait_maya/jhatka/elena/vance.png` | mugshot-style suspect cards on cream paper, name label space |
| 10 | `evidence_note.png` | crumpled handwritten note on aged paper |
| 11 | `evidence_printout.png` | security log printout, rows of timestamps, one row highlighted red |
| 12 | `evidence_phone.png` | black burner phone |
| 13 | `evidence_photo.png` | old photograph of a laboratory |
| 14 | `evidence_board.png` | corkboard with photos, red string, pins |

Nice-to-have: title screen art, `jaga.png`, `case_closed.png`, glitch overlay frame.

**Jigsaw puzzles:** NO generated piece art. Split each puzzle image into a CSS grid with clip-path shapes; click-to-place snapping. (Tell Antigravity: no drag physics, no puzzle library.)

### 4.2 Sound Effects (~25 files)

Download from **Pixabay / Mixkit / Kenney.nl** (CC0 / free license). Search terms:

| Stage | Files |
| --- | --- |
| Global | ui-click, paper-rustle, page-turn, noir-ambient-loop |
| 1 | punch-impact ×3, whoosh, countdown-tick, success-sting, fail-buzzer |
| 2 | room-tone-loop, meter-swing-tick, tension-riser, secret-reveal-sting |
| 3 | object-click, drawer-slide, locker-clunk, keypad-beep, unlock-ding, **explosion**, discovery-chime |
| 4 | suspense-loop, select-click, contradiction-sting, mission-fail-buzzer |
| 5 | buildup-loop, **glitch-static**, puzzle-snap ×3 (rising pitch), weapon-draw-whoosh, **case-closed-sting** |

Download 2× what you need. Keep a `credits.txt` in assets for license safety.

### 4.3 Voiceover (ElevenLabs)

- Free tier (~10k credits) covers ~3 min of audio; game needs ~40 short lines
- 5 voices: Jaga (calm/low), Vance (smooth/trustworthy — critical for the twist), Leo (nervous), Maya (distressed), Narrator (neutral, shared for Jhatka/Elena)
- Generate **per line**, name as `voice/{character}_{nn}.mp3`
- Generate **2–3 takes of all reveal lines** (Vance's "Jaga...", the ending) — pick the best
- Backup: OpenAI `tts-1` (~$0.20 total for the whole game)

---

## 5. Antigravity Prompt Sequence (Copy-Paste Ready)

**Global instruction to pin in every prompt:**

> Work only on the files for the current stage on branch `stage-N`. Do not modify other stages. Do not commit to main. Acceptance criteria are listed at the end — implement exactly those, nothing more.

**PROMPT 0 — Foundation:**

> Read the two attached design docs (storyline + GDD). Build the skeleton: index.html with a scene router (title → stage1→5 → ending), state.js with an evidence tracker array, audio.js using Howler.js (CDN), and a dialogue component that plays an MP3 with text fallback and click-to-advance. Include base.css with the case-file theme (cream paper panels, dark borders, red accents). No game logic yet.
> ACCEPTANCE: I can navigate between 5 placeholder stage sections; the dialogue component plays a test MP3 and shows its text.

**PROMPT 1 — Stage 1:**

> Implement Stage 1 exactly per the doc: Leo's face image with 5 hotspots (head, left eye, right ear, nose, mouth/chin), each needs 3 hits, 20s countdown, targets shift position as time passes, hit counter UI, fail → restart stage, success → post-capture dialogue (Leo/Vance exchange from the doc) then auto-advance to Stage 2.
> ACCEPTANCE: 15 hits required; timer visible and ends game at 0; hotspots move; wrong-suspect-free path works end to end.

**PROMPT 2 — Stage 2:**

> Implement Stage 2: interrogation background, swinging meter (CSS/JS oscillation), player clicks to stop it; stopping in the red zone 3 consecutive times reveals Clue 1, 2, 3 (Apartment 69 / handwritten note / locker phone) with reveal stings; wrong stop resets the streak. Each reveal adds evidence to the tracker. End with the Jaga/Vance transition dialogue.
> ACCEPTANCE: streak logic works (wrong stop → back to 0); exactly 3 clues revealed in order; evidence tracker updated.

**PROMPT 3 — Stage 3:**

> Implement Stage 3: apartment background with 6 clickable hotspots (desk, drawer, locker, photograph, shelf, burner phone area). Fixed puzzle chain: desk → wallet moves → paper shows 4-7-1-2 → keypad input 4712 opens locker → burner phone + security printout (MAYA LIN — ENTERED: 2:08 AM) → photograph back riddle "When did the laboratory lights go out?" → PIN 0200 unlocks phone → remote-wipe explosion effect → 3 contacts revealed (Maya Lin, Dr. Jhatka, Elena Rostova). Everything discoverable, no dead ends; each find adds to evidence panel.
> ACCEPTANCE: full chain solvable in order; wrong PIN shows feedback, not a dead end; all 7 evidence items land in the panel.

**PROMPT 4 — Stage 4:**

> Implement Stage 4: 3 suspect portrait cards with their exact statements from the doc, evidence panel visible alongside. Player selects a suspect. Selecting Maya → contradiction cutscene (printout appears, "I really wasn't there!") → LIAR IDENTIFIED → advance. Selecting anyone else → MISSION FAILED screen → restart Stage 4.
> ACCEPTANCE: all 3 statements displayed verbatim; wrong choice restarts stage; Maya path advances.

**PROMPT 5 — Stage 5:**

> Implement Stage 5 in two parts. (a) Three questions: accomplice (Modi/Leo/Kim → Leo), mastermind (Maya/Jhatka/Elena → Maya), proof (security log/handwritten note/photograph → security log). Then CLOSE CASE button. (b) On click: music stops, screen freezes, CSS glitch + red text "ERROR: CONTRADICTION DETECTED / THE EVIDENCE DOES NOT MATCH THE TRUTH." Then 3 sequential jigsaw puzzles (CSS clip-path pieces, click-to-place): 1) handwritten note → handwriting matches Leo (dialogue: "Things are not what they seem..."); 2) police log → hidden override record revealed (CAMERA SYSTEM OVERRIDE 02:03 AM / POLICE SECURITY / DEVICE: POLICE-07); 3) Elena's face → motive dialogue. Then evidence-board reveal connecting blackout→Vance, POLICE-07→Vance, Leo→Vance, Maya's record→manipulated. Final QTE "DRAW YOUR WEAPON" → success → Vance arrest → CASE CLOSED screen with final summary.
> ACCEPTANCE: full sequence runs without input; glitch triggers; each puzzle completes and plays its dialogue; reveal board shows all 4 connections; ending screen matches the doc.

**PROMPT 6 — Integration + polish:**

> Wire the full flow: Stage 2 clues appear in Stage 3 evidence panel; Stage 3 evidence feeds Stage 4's contradiction; per-stage ambience loops (from sfx folder) start/stop on stage change; transitions between all stages; restart behaviors reset state cleanly. Run a full playthrough and fix any progression blockers.
> ACCEPTANCE: fresh-load full 5-stage playthrough completes with no console errors.

---

## 6. 12-Hour Build Schedule

| Hours | Task |
| --- | --- |
| 0–1 | Generate 14 images + batch all voice lines (run generators in parallel with setup); download SFX; git init + GitHub + Vercel wired |
| 1–2 | PROMPT 0: foundation (router, state, dialogue, audio, theme) → commit + tag `foundation` |
| 2–3.5 | PROMPT 1: Stage 1 → test → merge to main → tag `stage-1-done` → **deploy #1** |
| 3.5–5 | PROMPT 2: Stage 2 → test → merge → tag → deploy |
| 5–7.5 | PROMPT 3: Stage 3 (largest stage — protect this block) |
| 7.5–9 | PROMPT 4: Stage 4 → merge → **deploy a full build URL early** |
| 9–11 | PROMPT 5: Stage 5 (glitch + puzzles + reveal — the showpiece) |
| 11–12 | PROMPT 6: integration, full playthrough, fix blockers, final deploy, prep demo script |

**Checkpoint rule:** never end an hour without a commit + push.

---

## 7. Test Checklist (Run at Each Stage Merge)

- [ ] Fresh page load → title → Stage 1 with no console errors
- [ ] Stage 1: 15 hits exactly; timer fail restarts; success advances
- [ ] Stage 2: streak reset on miss; exactly 3 clues; evidence panel updates
- [ ] Stage 3: full chain solvable from doc info alone; no dead ends; wrong PIN feedback
- [ ] Stage 4: wrong suspect → fail → restart; Maya path advances
- [ ] Stage 5: wrong-answer-forced flow; glitch; 3 puzzles; reveal; ending
- [ ] Restart behavior: any stage restart resets state without leaking into next stage
- [ ] Audio: ambience swaps per stage; dialogue text shows even with audio muted
- [ ] Mobile-ish sanity: clickable targets at least 44px (judges may demo on laptop, but don't assume)

---

## 8. Demo Script (3 minutes, for judges)

1. Stage 1 — hit Leo's face (15 seconds, judges interact immediately)
2. Skip to one Stage 2 clue reveal
3. Stage 3 — show the Maya 2:08 AM printout discovery
4. Stage 4 — pick Maya as the liar
5. Stage 5 — click CLOSE CASE → **glitch** → one puzzle → Vance reveal → CASE CLOSED
6. Land the pitch: *"You caught Leo. You exposed Maya. And the whole time, your own partner was controlling the investigation."*

---

## 9. Risk Register

| Risk | Mitigation |
| --- | --- |
| Antigravity breaks a working stage | Branch-per-stage + tag-per-stage + "do not modify other stages" suffix on every prompt |
| Stage Wi-Fi / audio fails live | All assets local; text fallback on every dialogue line |
| Art generation eats hours | Hard cap: 14 images, then stop; reuse evidence board for ending |
| Stage 3 scope creep | Fixed chain, no inventory system — the GDD already locked this |
| The twist lands flat | Force the wrong answer first; glitch is scripted, not branched; Vance's voice cast as "trustworthy" |
| Deploy fails at hour 12 | Deploy at hour 3.5, 7.5, 9 and 12 — always have a live URL |

---

## 10. Definition of Done

- [ ] All 5 stages playable end-to-end from a fresh load
- [ ] Every clue from earlier stages is necessary and sufficient for the final deduction
- [ ] Contradiction twist triggers reliably
- [ ] Live Vercel URL works on a machine that isn't yours
- [ ] `git log` shows a tagged commit per stage