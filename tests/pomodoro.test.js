// Run with: node --test tests/pomodoro.test.js
const test=require("node:test"),assert=require("node:assert/strict");
const P=require("../pomodoro.js");
const T0=Date.UTC(2026,9,16,8,30); // 2:00 PM IST
const min=60e3;
const mk=(cfg)=>{const s={};const p=P.ensure(s);if(cfg)Object.assign(p.cfg,cfg);P.setCfg(p,{},T0);p.cur=null;P.ensure(s);return s.pomo;};

test("defaults are 25/5/15, long break after four",()=>{
  const p=mk();const c=P.cfg(p);
  assert.deepEqual([c.focus,c.short,c.long,c.every],[25,5,15,4]);
  assert.equal(p.cur.mode,"focus");assert.equal(p.cur.dur,1500);assert.equal(p.cur.status,"idle");
});
test("remaining comes from the end timestamp, not ticks",()=>{
  const p=mk();P.start(p,T0);
  assert.equal(P.remaining(p,T0+10*min),900);
  assert.equal(P.remaining(p,T0+10*min+500),899.5);
});
test("pause and resume never count paused time",()=>{
  const p=mk();P.start(p,T0);P.pause(p,T0+10*min);
  assert.equal(P.remaining(p,T0+40*min),900);           // frozen while paused
  P.start(p,T0+40*min);
  assert.equal(P.remaining(p,T0+45*min),600);
  const ev=P.settle(p,T0+55*min+1);
  assert.equal(ev.length,1);assert.equal(ev[0].entry.sec,1500); // 25 active minutes, not 55
  assert.equal(ev[0].entry.done,true);
});
test("completion moves to a short break that may auto-start, never to focus",()=>{
  const p=mk();P.start(p,T0);const ev=P.settle(p,T0+26*min);
  assert.equal(ev[0].to,"short");assert.ok(ev[0].autoStarted);
  assert.equal(p.cur.mode,"short");assert.equal(p.cur.status,"running");
  assert.equal(P.remaining(p,T0+26*min),240);           // break began when focus ended
  const ev2=P.settle(p,T0+31*min);
  assert.equal(ev2[0].to,"focus");assert.equal(p.cur.status,"idle"); // focus waits for consent
});
test("a closed tab catches up through focus and its break",()=>{
  const p=mk();P.start(p,T0);
  const ev=P.settle(p,T0+3*60*min);
  assert.deepEqual(ev.map(e=>e.to),["short","focus"]);
  assert.equal(p.cur.mode,"focus");assert.equal(p.cur.status,"idle");
  assert.equal(P.dayStats(p).focusSec,1500);assert.equal(P.dayStats(p).breakSec,300);
});
test("without auto breaks the break waits",()=>{
  const p=mk({autoBreak:false});P.start(p,T0);P.settle(p,T0+25*min);
  assert.equal(p.cur.mode,"short");assert.equal(p.cur.status,"idle");
});
test("long break after every fourth completed focus, then the cycle restarts",()=>{
  const p=mk({autoBreak:false});let t=T0;const modes=[];
  for(let i=0;i<5;i++){P.start(p,t);t+=25*min;P.settle(p,t);modes.push(p.cur.mode);P.start(p,t);t+=p.cur.dur*1000;P.settle(p,t);}
  assert.deepEqual(modes,["short","short","short","long","short"]);
  assert.equal(P.dayStats(p).completed,5);
});
test("skip logs real partial focus but no completed session",()=>{
  const p=mk();P.start(p,T0);const ev=P.skip(p,T0+7*min);
  assert.equal(ev.entry.sec,420);assert.equal(ev.entry.done,false);
  assert.equal(p.cur.mode,"short");assert.equal(p.cur.status,"idle");
  assert.equal(P.dayStats(p).completed,0);assert.equal(P.dayStats(p).focusSec,420);
});
test("reset keeps the mode and full duration; tiny partials are not logged",()=>{
  const p=mk();P.start(p,T0);P.reset(p,T0+30e3);
  assert.equal(p.log.length,0);assert.equal(p.cur.status,"idle");assert.equal(p.cur.left,1500);
});
test("changing duration mid-run shifts the end",()=>{
  const p=mk();P.start(p,T0);P.setCfg(p,{focus:30},T0+min);
  assert.equal(P.remaining(p,T0+min),1740);
  const q=mk();P.setCfg(q,{focus:50},T0);assert.equal(q.cur.left,3000);
});
test("tasks travel with the log and never touch solved state",()=>{
  const s={done:{},pdone:{}};const p=P.ensure(s);P.setTask(p,{k:"rev",label:"DSA revision · Recursion",item:{type:"p",id:12}});
  P.start(p,T0);P.settle(p,T0+25*min);
  assert.equal(p.log[0].task.k,"rev");assert.deepEqual(s.done,{});assert.deepEqual(s.pdone,{});
  assert.equal(P.byKind(p).rev,1500);
});
test("old saves without pomo are upgraded in place",()=>{
  const s={done:{1:true}};P.ensure(s);assert.ok(Array.isArray(s.pomo.log));assert.equal(s.done[1],true);
});
