# Prep Desk

A calm study desk for my October 2026 placement prep: DSA, OS, DBMS, Computer Networks and System Design (SOLID → design patterns → LLD). November is for revision.

- **Dashboard**: today's plan, overall DSA progress, a 21-day consistency grid, topic breakdown, revision queue and recently solved problems.
- **Problems**: all 219 problems from my LeetCode tracker with topic, difficulty, plan date, confidence and bookmarks. Search, filter and sort.
- **Study plan**: every day of 11–31 October, filterable by subject.
- **Revision**: everything marked Shaky or Redo, bookmarks by topic, the November schedule and optional problems.
- **Topics** and **Analytics**: progress by topic, subject, week and difficulty, plus daily completion.

Tick a task or problem to mark it done. The pencil button sets confidence (Confident / Shaky / Redo) and a note. Press `/` to search.

The page has a simple sign-in screen. Only a salted hash of the ID and password is stored in the code. Progress is saved in the browser (localStorage); use **Export / Import** in the profile menu to move it to another device. Light theme by default, with a dark theme toggle in the top bar.

- `tasks.js` is the October plan (DSA tasks link to problems with `pid`).
- `problems.js` is the problem list from the tracker docx (`solved` = done before October, `star` = bookmarked).
