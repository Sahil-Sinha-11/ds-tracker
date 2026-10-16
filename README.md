# Prep Desk

A calm study desk for my October 2026 placement prep: DSA, OS, DBMS, Computer Networks and System Design (an LLD problem set: OOP basics → class relationships → SOLID → design patterns → full LLD rounds). November is for revision.

- **Dashboard**: today's plan, overall DSA progress, a 21-day consistency grid, topic breakdown, revision queue and recently solved problems.
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
