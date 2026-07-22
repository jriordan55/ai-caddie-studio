# AI Caddie · copy-paste prompts

Paste one of these into **Claude**, **Cursor**, **ChatGPT**, or any coding AI chat.
Fill in the bracketed bits. The AI should produce a working result without you designing anything.

---

## Prompt A · Instant AI Caddie (web app)

```text
Build me a mobile-first web app called "AI Caddie" that works like a production on-course golf caddie.

GOAL
A single deployable folder (or GitHub Pages site) that looks polished and professional, dark fairway-green theme, fonts Sora + Oswald from Google Fonts. Brand name: AI Caddie.

TABS (bottom nav)
1) Play — type a yardage, get best club + 2 alternates from MY bag (stock carry). Include tip text. No "Full stats" button.
2) Live — browser Geolocation GPS. Course + hole picker. Front / Middle / Back distances to green. Optional satellite drop-a-pin (Leaflet + Esri World Imagery). Club call to middle or pin. If elevation grids are available, show plays-like (about 1 yd per 3 ft).
3) Bag — list clubs by stock carry; tap for full stats (carry, total, window, stdev, consistency, ball/club speed, smash, apex, spin, axis, offline, spread) and vs PGA / scratch / 10 HCP table.
4) Compare — bars vs PGA / Scratch / 10 HCP with filter chips: Carry, Total, Ball mph, Club mph, Smash, Spin, Apex.
5) Insights — KPIs, gapping, consistency, miss tendencies, short on-course notes.
6) Guide — how each tab works + what each metric means.

COPY RULES
Never use em dashes or en dashes in user-facing descriptions. Prefer periods and commas. Ranges say "10 to 15" not "10–15".

MY BAG DATA
Use this as the source of truth (parse it; do not invent distances).

Minimum: average carry (yards) per club is enough for Play club calls.
Optional averages if known: total, smash, spin, apex, ball speed, club speed.
A full launch-monitor CSV (shot by shot) is more accurate for Compare and Insights. Without it, estimate missing fields and note in Guide that they are estimates.

<<<PASTE YOUR LAUNCH MONITOR CSV OR CLUB LIST HERE>>>
Example if you only know carry:
Driver 250
3W 215
Hybrid 200
5i 190
6i 180
7i 172
8i 156
9i 145
PW 127
AW 118
SW 92
60 75

Optional richer list (carry / total):
Driver 250 / 270
7i 172 / 183

Include PGA / scratch / 10-handicap benchmark carries (and estimated speeds/spin/apex for scratch and 10 HCP scaled from PGA).

MY COURSES FOR GPS
<<<LIST COURSE NAMES + CITY/STATE, OR PASTE greens JSON>>>
If only names are given: fetch OpenStreetMap golf=hole and golf=green for each course (Overpass), compute front/middle/back relative to approach direction, embed as GPS_COURSES. If OSM is incomplete, say so and still ship Play/Bag/Compare/Insights.

OUTPUT
- index.html (and any small JS/CSS files needed)
- README with: how to open locally, how to publish to GitHub Pages, how to Add to Home Screen on iPhone
```


---

## Prompt B · Instant PDF yardage book

```text
Generate a printable golf yardage book PDF for this course using the OpenYardage / openyardage-web approach (OSM features + elevation contours + hole strategy notes).

COURSE
Name: <<<COURSE NAME>>>
Location: <<<CITY, STATE / COUNTRY>>>
Tees: <<<e.g. Blue / second farthest>>>

REQUIREMENTS
- 18 holes (or however many the course has), one hole per page style booklet + cover
- Real OSM features only (fairways, greens, bunkers, water, tees). Nothing synthetic.
- Correct hole selection when OSM has duplicates (prefer tip inside green, scorecard par/yardage match)
- Green contour inset from elevation/lidar when available; skip mismatched grids
- Strategy notes for tee / approach / green that are specific (where to aim, what to avoid). No fluff like "go for birdie". No dashes in the notes.
- Scorecard yardages/pars/handicaps for the chosen tees if you can source them; otherwise note the source gap
- Output a PDF plus a short README of how you built it

If you need the existing toolchain, use or recreate scripts similar to:
- fetch OSM by bbox or course area
- fetch elevation grid
- fetch per-green elevation
- render hole pages and assemble PDF with Playwright

Deliver the PDF path when done and a 3-bullet summary of any data quality issues (missing fairways, bad greens, etc.).
```

---

## Prompt C · Both (caddie app + yardage book)

```text
I want two deliverables for my golf game:

1) AI CADDIE web app (GitHub Pages ready) using Prompt A requirements below.
2) Yardage book PDF for my course using Prompt B requirements below.

Do the yardage book first if course data helps GPS greens. Then embed those greens into the AI Caddie Live GPS tab.

MY BAG
<<<PASTE CSV OR CLUB LIST>>>

MY COURSE
<<<NAME, CITY/STATE, TEE SET>>>

Follow these detailed specs:

--- AI CADDIE SPEC ---
(paste Prompt A from the AI Caddie Studio prompts, with my bag filled in)

--- YARDAGE BOOK SPEC ---
(paste Prompt B with my course filled in)

Ship:
- /caddie site files
- /output yardage book PDF
- README with phone install steps for the caddie and print tips for the PDF
```

---

## Prompt D · Fill an existing Studio

Use this if you already opened https://jriordan55.github.io/ai-caddie-studio/ and want an AI to prepare files for upload.

```text
Convert my bag and course into files for AI Caddie Studio
(https://jriordan55.github.io/ai-caddie-studio/).

Return:
1) A club table with at least average carry per club (enough for Setup), OR a launch-monitor CSV if I have shot data (more accurate for spin/smash/consistency). Optional: total, smash, spin, apex averages if I know them.
2) A GPS courses JSON array: [{ slug, name, tee, center:{lat,lon}, holes:[{ n, par, yds, ge, tee:{lat,lon}, f:{lat,lon}, m:{lat,lon}, b:{lat,lon} }] }]
   Build greens from OpenStreetMap for: <<<COURSE NAME, CITY>>>
3) Exact click-path in Studio Setup to import them.

MY DATA
<<<BAG + COURSE>>>
```

---

## Tips for best results

- Paste real launch monitor CSV when you have it. Invented distances make weak club calls.
- Name the tee set for yardage books (Blue, White, etc.).
- In Cursor, open an empty folder and paste Prompt A or C as the task.
- In Claude, enable code execution / computer use if available for PDF generation.
- Your private build at https://jriordan55.github.io/ai-caddie/ stays separate. Studio and these prompts are for everyone else.
