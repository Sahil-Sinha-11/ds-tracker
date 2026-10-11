# DSA Tracker

A one-page tracker for my October 2026 placement prep: DSA, OS, DBMS, Computer Networks and System Design (SOLID → design patterns → LLD).

- **Today** shows today's tasks plus anything left over from earlier days.
- **Full plan** shows every day of the plan, filterable by subject.
- **Progress** has a bar per subject and per week, and the November revision list (tasks marked Shaky / Redo).
- Tick a task to mark it done. Use ⋯ to set confidence (Easy / Shaky / Redo) and add a note.

The page has a simple sign-in screen. Only a salted hash of the ID and password is stored in the code. Progress is saved in the browser (localStorage). Use **Export / Import** to move it to another device.

To change the plan, edit `tasks.js`.
