/* OA practice sequence, 17–31 Oct 2026.
   The 8:45–10:45 PM block: four 30-minute OA questions a night (mock nights are one 90-minute timed paper
   plus a 30-minute review). Ordered from the widest question bank to the companies that hire most from
   your filter (BTech/DD, non-circuital, CGPA ≤ 8, ≥ 10 LPA in the 2025-26 offers list).
   Slot ids are day number × 10 + slot number, so they stay stable if text changes. */
window.OA_PHASES=[
  {k:"amz",name:"Amazon past-year",why:"Biggest, most repeated OA bank. Its patterns (arrays, sliding window, heaps, grid BFS, DP) are what most HackerRank OAs test."},
  {k:"fin",name:"Finance HackerRank",why:"Goldman Sachs, JPMorgan and Wells Fargo use the same medium DSA style as BlackRock and Standard Chartered."},
  {k:"top",name:"Your top recruiters",why:"BlackRock (13 offers) and Standard Chartered (9) hired the most from your filter with a coding OA."},
  {k:"prod",name:"Product companies",why:"Navi, Meesho, Flipkart and Juspay: medium-hard DP, graphs and strings."},
];
window.OA_COMPANIES={
  "Amazon":{find:"Amazon India SDE OA 2025, last 12 months"},
  "Goldman Sachs":{find:"Goldman Sachs analyst OA (HackerRank) 2025"},
  "JPMorgan":{find:"JPMorgan Chase campus OA 2025"},
  "Wells Fargo":{find:"Wells Fargo technology analyst OA 2025"},
  "American Express":{find:"American Express campus OA 2025"},
  "BlackRock":{find:"BlackRock Aladdin Engineering OA 2025 (coding + SQL)"},
  "Standard Chartered":{find:"Standard Chartered development engineer OA 2025"},
  "Navi":{find:"Navi SDE campus OA 2025"},
  "Meesho":{find:"Meesho SDE campus OA 2025"},
  "Flipkart":{find:"Flipkart GRiD / campus OA 2025"},
  "Juspay":{find:"Juspay campus OA 2025"},
};
window.OA_DAYS=[
  {n:1,date:"2026-10-17",phase:"amz",title:"Baseline mock",mock:true,slots:[
    {co:"Amazon",focus:"Timed paper: 2 questions, recent Amazon OA",min:90},
    {co:"Amazon",focus:"Review: upsolve what you missed, note the pattern",min:30}]},
  {n:2,date:"2026-10-18",phase:"amz",title:"Arrays, hashing and sliding window",slots:[
    {co:"Amazon",focus:"Arrays and hashing"},{co:"Amazon",focus:"Sliding window"},
    {co:"Amazon",focus:"Sliding window (variable size)"},{co:"Amazon",focus:"Strings"}]},
  {n:3,date:"2026-10-19",phase:"amz",title:"Heaps, greedy and intervals",slots:[
    {co:"Amazon",focus:"Heaps / top-k"},{co:"Amazon",focus:"Greedy with sorting"},
    {co:"Amazon",focus:"Intervals"},{co:"Amazon",focus:"Strings and counting"}]},
  {n:4,date:"2026-10-20",phase:"amz",title:"Grids, graphs and binary search",slots:[
    {co:"Amazon",focus:"Grid BFS/DFS"},{co:"Amazon",focus:"Graphs: topo sort or union-find"},
    {co:"Amazon",focus:"Binary search on the answer"},{co:"Amazon",focus:"Prefix sums"}]},
  {n:5,date:"2026-10-21",phase:"amz",title:"DP and stacks",slots:[
    {co:"Amazon",focus:"1D DP"},{co:"Amazon",focus:"2D / grid DP"},
    {co:"Amazon",focus:"DP on strings"},{co:"Amazon",focus:"Monotonic stack"}]},
  {n:6,date:"2026-10-22",phase:"fin",title:"Goldman Sachs set",slots:[
    {co:"Goldman Sachs",focus:"Arrays and math"},{co:"Goldman Sachs",focus:"Strings"},
    {co:"Goldman Sachs",focus:"Greedy"},{co:"Goldman Sachs",focus:"DP"}]},
  {n:7,date:"2026-10-23",phase:"fin",title:"JPMorgan set",slots:[
    {co:"JPMorgan",focus:"Arrays"},{co:"JPMorgan",focus:"Hash maps"},
    {co:"JPMorgan",focus:"Graphs"},{co:"JPMorgan",focus:"DP"}]},
  {n:8,date:"2026-10-24",phase:"fin",title:"Goldman Sachs mock",mock:true,slots:[
    {co:"Goldman Sachs",focus:"Timed paper: 2–3 questions, past GS OA",min:90},
    {co:"Goldman Sachs",focus:"Review: upsolve and log mistakes",min:30}]},
  {n:9,date:"2026-10-25",phase:"fin",title:"Wells Fargo and bit tricks",slots:[
    {co:"Wells Fargo",focus:"Easy array (warm-up speed)"},{co:"Wells Fargo",focus:"Medium strings"},
    {co:"Wells Fargo",focus:"Hard graph (paths / Euler-style)"},{co:"Wells Fargo",focus:"Bit manipulation"}]},
  {n:10,date:"2026-10-26",phase:"top",title:"BlackRock set",slots:[
    {co:"BlackRock",focus:"Tree traversals"},{co:"BlackRock",focus:"BST / balanced-tree questions"},
    {co:"BlackRock",focus:"Graphs"},{co:"BlackRock",focus:"SQL MCQs: joins, group by, window functions"}]},
  {n:11,date:"2026-10-27",phase:"top",title:"Standard Chartered set",slots:[
    {co:"Standard Chartered",focus:"Trees"},{co:"Standard Chartered",focus:"Graphs"},
    {co:"Standard Chartered",focus:"Harder tree/graph question"},{co:"American Express",focus:"Arrays / DP"}]},
  {n:12,date:"2026-10-28",phase:"top",title:"BlackRock mock",mock:true,slots:[
    {co:"BlackRock",focus:"Timed paper: 2–3 coding questions",min:90},
    {co:"BlackRock",focus:"SQL MCQs and review",min:30}]},
  {n:13,date:"2026-10-29",phase:"prod",title:"Navi and Meesho",slots:[
    {co:"Navi",focus:"Graphs"},{co:"Navi",focus:"Recursion / DP"},
    {co:"Navi",focus:"Strings (palindrome-style)"},{co:"Meesho",focus:"DP"}]},
  {n:14,date:"2026-10-30",phase:"prod",title:"Flipkart, Meesho and Juspay",slots:[
    {co:"Flipkart",focus:"Arrays / greedy"},{co:"Flipkart",focus:"Trees"},
    {co:"Meesho",focus:"Graphs"},{co:"Juspay",focus:"Hard graph question"}]},
  {n:15,date:"2026-10-31",phase:"amz",title:"Final mock",mock:true,slots:[
    {co:"Amazon",focus:"Timed paper: a second recent Amazon OA",min:90},
    {co:"Amazon",focus:"Review, then plan November redos",min:30}]},
];
window.OA_DAYS.forEach(d=>d.slots.forEach((s,i)=>{s.id=d.n*10+i+1;s.min=s.min||30;}));
