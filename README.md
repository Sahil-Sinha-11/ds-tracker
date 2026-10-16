# Prep Desk

**Midnight Study Club.** A night-city study desk for my October 2026 placement prep: DSA, OS, DBMS, Computer Networks and System Design (an LLD problem set: OOP basics → class relationships → SOLID → design patterns → full LLD rounds). November is for revision.

- **Home**: a cinematic hero ("Enter your focus state") over a night photograph of Tokyo, with floating geometric figures, today's revision topic and progress, the current study block, today's focus time and a Start focus session button. Below it: today's plan, overall DSA progress, a 21-day consistency grid, topic breakdown, revision queue and recently solved problems.
- **Focus mode** (`#focus`): a Pomodoro timer over a night-city scene. Focus 25 min, short break 5, long break 15 after every 4 focus sessions, all editable. Start, pause, resume, reset, skip, mode switch, ambience toggle, a choice of six scenes, and a task picker tied to the daily blocks (DSA revision, system design, new DSA problems, MTP, the core subject of the week, or anything else) with a specific problem or task. Breaks can start on their own when a focus session ends; focus never does. A chime, an on-page note and (if you allow it) a desktop notification mark each finish. Space starts and pauses.
- **Problems**: all 219 problems from my LeetCode tracker with topic, difficulty, plan date, confidence and bookmarks. Search, filter and sort.
- **Study plan**: every day of 11–31 October, filterable by subject.
- **Revision**: the daily topic rotation (Recursion → Binary Search → Two Pointers → Graphs → Dynamic Programming, then back), per-topic due/overdue counts, an overdue queue, revision-topic corrections and interval settings. Below that, everything marked Shaky or Redo, bookmarks by topic, the November schedule and optional problems.
- **Revision session** (`#session`): the focused 2–5 PM workspace. A 3-hour session timer and a per-question attempt timer that survive page changes and reloads, the queue (remaining / skipped / completed), previous approach, mistakes and notes, confidence 1–5, how it went (on my own / with hints / needed the solution), and Mark reviewed / Needs more practice / Mark forgotten / Skip. Mastered problems get a quick-recall mode.
- **Topics** and **Analytics**: progress by topic, subject, week and difficulty, plus daily completion.

Tick a task or problem to mark it done. The pencil button sets confidence (Confident / Shaky / Redo) and a note. Press `/` to search.

The page has a simple sign-in screen. Only a salted hash of the ID and password is stored in the code. Progress is saved in the browser (localStorage); use **Export / Import** in the profile menu to move it to another device. Light theme by default, with a dark theme toggle in the top bar.

- `tasks.js` is the October plan (DSA tasks link to problems with `pid`; System Design tasks carry an `lld` object with the problem number, concept, difficulty and section).
- `problems.js` is the problem list from the tracker docx (`solved` = done before October, `star` = bookmarked).
- `revision.js` is the revision engine: topic rotation, queue building, adaptive review intervals, session clock and trends. It has no UI code and also runs under Node.

## How revision scheduling works

Topic rotation and review dates are separate. The rotation is calendar based: 16 Oct 2026 is Recursion and each day moves one step (changing today's topic on the Revision page re-anchors it). Each solved problem in today's topic gets a review date from how the last revision went:

| Outcome | Next review |
|---|---|
| Forgot, or needed the full solution | 1 day |
| Significant hints (also "needs more practice") | 2 days |
| On my own but slow (over the time limit, confidence below 4, or looked at notes) | 3 days |
| On my own, confident | 7 days |
| Confident again, and again | 14 days, then 30 |

All of these are editable on the Revision page. Today's queue puts overdue problems first, then due ones, then ones never revised, harder ones first among equals, and stops at what fits in the 3-hour block. Anything planned but not finished is carried forward as overdue. Revision data is stored in the same localStorage key (`rev`, `rcat`, `rcfg`, `rlog`, `sess`, `custom`), so Export / Import carries it too.

## How the focus timer keeps time

The timer stores the moment it will end, not a countdown, so the time left is always "end minus now". It stays right when you switch pages, leave the tab in the background, refresh, or close the site and come back: anything that finished while you were away is settled in order (a focus session, then its break) the next time the page is open. Pausing stores the time left and stops the clock. Focus time is the sum of the stretches the timer actually ran, so paused time and breaks are never counted as focus. Skipping or resetting keeps any real focus time (a minute or more) as a partial session. The timer never ticks anything off as solved.

Everything lives in the same localStorage key under `pomo` (settings, the current timer and a log of focus and break sessions), so Export / Import carries it and older exports still import. `pomodoro.js` is the engine (no UI, runs under Node: `node --test tests/pomodoro.test.js`). If two tabs are open, each picks up the other's saves.

## Visuals

`scene.js` builds the scenery: photo layers, a generated night skyline used when a photo can't load, the reusable figures (torus rings, glass spheres, cube, wire globe, orbits, a JS-projected icosahedron, ribbons, light fields) and canvas particles and rain. `midnight.css` is the theme. GSAP (with ScrollTrigger, from cdnjs) runs the hero entrance, the rotating goal line, scroll parallax and reveals, cursor parallax, Focus Mode transitions and the bars and rings growing to their real values. Each page's tweens live in one `gsap.context` that is reverted before the next render.

Motion stops when it isn't seen: canvases pause off screen and in hidden tabs, the home scene is still on other pages, and Focus Mode tears its scene down when you leave. With reduced motion turned on in the OS, or **Ambient effects: off** in the profile menu or Focus Mode, the figures and photos stay as a still composition and the site works the same.

Theme: midnight (dark) by default, with a light "dawn" theme on the sun/moon toggle.

### Photo credits

Free photos under the [Unsplash License](https://unsplash.com/license), hotlinked from Unsplash with credit shown on screen:

| Scene | Photo | Photographer |
|---|---|---|
| Home, Tokyo Tower | [Tokyo tower illuminated at night](https://unsplash.com/photos/tokyo-tower-illuminated-at-night-with-city-skyline-t1JoTScJs-c) | [T Y](https://unsplash.com/@tyr123) |
| Window (default focus) | [A view of a city at night from a window](https://unsplash.com/photos/a-view-of-a-city-at-night-from-a-window-g5uM0Yjjbww) | [Nguyen Phan Nam Anh](https://unsplash.com/@dying_apricity) |
| Osaka rain (default break) | [Rainy city street with neon signs](https://unsplash.com/photos/rainy-city-street-at-night-with-glowing-neon-signs-G0KVzxBb2xo) | [Cuvii](https://unsplash.com/@cuvii) |
| Night street | [A city street at night in the rain](https://unsplash.com/photos/a-city-street-at-night-in-the-rain-02mWrtCxMSM) | [Joshua Tsu](https://unsplash.com/@joshdatsu) |
| Skyline (sign-in) | [A city skyline at night](https://unsplash.com/photos/a-city-skyline-at-night-B61yI-uO_oI) | [rawkkim](https://unsplash.com/@rawkkim) |
| Shibuya | [Aerial view of a city skyline at night](https://unsplash.com/photos/aerial-view-of-a-city-skyline-at-night-RDlhSZR4SR8) | [Sarmat Batagov](https://unsplash.com/@batag_) |
