# UNDER INVESTIGATION — Complete Asset Manifest (v2)
# Theme LOCKED by generated art: "GRITTY COMIC NOIR"
# ( Leo's face defines the style — everything else must match HIM )

## ✅ DONE: LEO (10 expressions generated)

Expression map (use these across the game):
- MANIC GRIN (top-left)      -> Stage 1 DEFAULT gameplay face
- STRAINED SMIRK (top-right) -> Stage 1 mid-hits / dialogue "I was paid to help"
- ANGRY SNARL (bottom-left)  -> Stage 1 HIT feedback state
- BRUISED DARK (bottom-right)-> POST-CAPTURE state (Stage 1 dialogue + Stage 2 interrogation)
- Remaining 6 expressions    -> catalog them; use for: arrested ending, scream on
  phone explosion (Stage 3), defeated "I never saw his face" line

File them as: leo_grin.png, leo_smirk.png, leo_snarl.png, leo_beaten.png, leo_XX.png
Stage 1 swaps expression per hit count: 0-4 hits = grin, 5-9 = smirk, 10-14 = snarl,
captured = beaten. (Tell Antigravity this exact mapping in PROMPT 1.)

## NEW THEME BLOCK — paste at the START of every remaining image prompt:
"gritty comic-book illustration, heavy black ink outlines, dramatic cel
shading, dark moody background, graphic-noir style, exaggerated readable
features, muted color base with one or two saturated accent colors,
sweaty textured skin, stylized 2D game art"

## NEGATIVE PROMPT (append to every image prompt):
"soft pastel, watercolor, 3D render, photorealistic, anime, cute, bright
cheerful colors, text, letters, watermark, logo, clean vector flat style"

## STYLE REFERENCE RULE
When generating any character: attach leo_grin.png as an image reference /
style reference so faces share the same linework and shading.

---

## REMAINING IMAGES (17)

| # | File | Ratio | Subject prompt (append to THEME block) |
|---|---|---|---|
| 1 | lab_perimeter.png | 16:9 | Night exterior of a college research laboratory, brick building, iron fence, single cold streetlamp, long shadows, fog, distant running figure silhouette, blue-black night palette |
| 2 | interrogation.png | 16:9 | Sparse police interrogation room, one harsh hanging bulb over metal table, two chairs, concrete walls, dramatic top light, hard black shadows, greenish accent |
| 3 | apartment.png | 16:9 | Dusty abandoned apartment interior, wooden desk, tall metal locker, bookshelf, overturned chair, newspapers on floor, striped shadows from window blinds, olive-green accents |
| 4 | portrait_maya.png | 3:4 | Portrait of a young woman lab assistant, glasses, white lab coat, worried innocent expression, cream skin, dark background, framed like a case-file mugshot card |
| 5 | portrait_jhatka.png | 3:4 | Portrait of an elderly male scientist, white coat, thick mustache, stern proud expression, case-file mugshot card framing |
| 6 | portrait_elena.png | 3:4 | Portrait of a stern female researcher, hair in a bun, trench coat, guarded suspicious expression, case-file mugshot card framing |
| 7 | portrait_vance.png | 3:4 | Portrait of a handsome confident male detective in his 40s, fedora, sharp suit, charming trustworthy smile with a hint of menace, case-file mugshot card framing — his face must read as ALLY |
| 8 | jaga.png | 3:4 | Portrait of a determined young male lead detective, sharp focused eyes, rolled-up shirt sleeves, loosened tie, case-file mugshot card framing |
| 9 | evidence_note.png | 4:3 | Crumpled handwritten note on stained paper, dark unreadable ink scrawl, coffee ring stain, dramatic spotlight on a wooden desk |
| 10 | evidence_printout.png | 4:3 | Typewritten security log on perforated paper, rows of timestamp entries, ONE row circled in red, paperclip, harsh desk-lamp light |
| 11 | evidence_phone.png | 1:1 | Old battered burner phone, cracked screen, worn plastic, sitting on dusty shelf, dramatic side light with heavy shadow |
| 12 | evidence_photo.png | 4:3 | Faded photograph of a laboratory interior, white border, slight curl, lit by a desk lamp in darkness |
| 13 | evidence_board.png | 16:9 | Detective corkboard covered with photos, red string connecting pins, index cards, newspaper clippings, one warm lamp lighting it from the side |
| 14 | title_screen.png | 16:9 | Open case-file folder on wooden desk, harsh lamp glow, magnifying glass, revolver, top-down cinematic, red accent |
| 15 | case_closed.png | 16:9 | Closed case-file folder tied with red string on wooden desk, single warm lamp, final-shot cinematic feel |
| 16 | glitch_frame.png | 16:9 | Analog TV static, scanlines, distorted signal, black and white with red chromatic aberration streaks — can be CSS instead, lowest priority |
| 17 | secret_entrance.png | 16:9 | Hidden door behind a bookshelf in a dark laboratory corridor, sliver of light from inside, blue-black shadows — for the prologue/Stage 3 flavor (optional) |

---

## SOUND EFFECTS (unchanged — 31 files, Pixabay / Mixkit / Kenney.nl)

### Global
ui-click, paper-rustle, page-turn, noir-ambient-loop

### Stage 1
punch-impact-1, punch-impact-2, punch-impact-3, whoosh, countdown-tick, success-sting, fail-buzzer

### Stage 2
room-tone-loop, meter-swing-tick, tension-riser, secret-reveal-sting

### Stage 3
object-click, drawer-slide, locker-metal-clunk, keypad-beep, unlock-ding, explosion, discovery-chime

### Stage 4
suspense-loop, select-click, contradiction-sting, mission-fail-buzzer

### Stage 5
buildup-loop, glitch-static, puzzle-snap-1, puzzle-snap-2, puzzle-snap-3, weapon-draw-whoosh, case-closed-sting

---

## VOICEOVER (unchanged — ElevenLabs, 5 voices)

| Character | Voice direction | # lines (approx) |
|---|---|---|
| Narrator | Neutral noir narrator, slow, smoky | 6 |
| Jaga | Calm, low, methodical investigator | 18 |
| Vance | Smooth, warm, authoritative — MUST sound trustworthy | 10 |
| Leo | Nervous, shaky, cornered | 9 |
| Maya | Young, distressed, pleading | 5 |

Rules: per-line mp3s (voice/jaga_01.mp3 ...), 2-3 takes of Vance's reveal
lines, text fallback on every line, backup = OpenAI tts-1.
