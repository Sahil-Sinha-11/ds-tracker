// Topic-based DSA revision engine for Prep Desk.
// Pure functions over the existing localStorage state (dsa-tracker-v1); index.html owns the UI.
// Two separate ideas live here:
//   - topic rotation: which of the five topics today's 2–5 PM session covers (calendar based);
//   - review scheduling: when each individual problem is due again (adaptive intervals).
(function(root){
  const CATS=[
    {k:"rec",name:"Recursion",topics:["Recursion & Backtracking"]},
    {k:"bs",name:"Binary Search",topics:["Binary Search"]},
    {k:"tp",name:"Two Pointers",topics:["Two Pointer & Sliding Window"]},
    {k:"gr",name:"Graphs",topics:["Graph"]},
    {k:"dp",name:"Dynamic Programming",topics:["Dynamic Programming"]},
  ];
  const CAT=Object.fromEntries(CATS.map(c=>[c.k,c]));
  const DEFAULTS={
    anchor:"2026-10-16",anchorCat:"rec",          // the rotation day that is Recursion
    iv:{forgot:1,hints:2,slow:3,confident:7,ladder:[14,30]},
    slowMin:{Easy:15,Medium:25,Hard:40},          // independent solves slower than this count as "slow"
    estMin:{Easy:12,Medium:20,Hard:30,recall:6},  // planning estimate when there is no history yet
    sessionMin:180,
    blocks:[
      {k:"mtp",label:"MTP research",s:"10:00",e:"12:00",on:true,flex:true},
      {k:"rev",label:"DSA revision",s:"14:00",e:"17:00",on:true},
      {k:"sd",label:"System design",s:"18:00",e:"20:00",on:true},
      {k:"dsa",label:"New DSA problems",s:"20:45",e:"23:45",on:true},
    ],
  };
  const clone=o=>JSON.parse(JSON.stringify(o));
  function cfg(state){
    const c=clone(DEFAULTS),o=(state&&state.rcfg)||{};
    for(const k of ["anchor","anchorCat","sessionMin"])if(o[k]!=null)c[k]=o[k];
    for(const k of ["iv","slowMin","estMin"])if(o[k])Object.assign(c[k],o[k]);
    if(Array.isArray(o.blocks))c.blocks=c.blocks.map(b=>Object.assign(b,o.blocks.find(x=>x.k===b.k)||{}));
    return c;
  }

  /* ---------- dates (local calendar days as YYYY-MM-DD) ---------- */
  const pad=n=>String(n).padStart(2,"0");
  const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  function addDays(d,n){const x=new Date(d+"T00:00");x.setDate(x.getDate()+n);return iso(x);}
  function diffDays(a,b){const u=s=>Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10));return Math.round((u(b)-u(a))/864e5);}

  /* ---------- topic rotation ---------- */
  function topicFor(date,c){
    const i0=CATS.findIndex(x=>x.k===c.anchorCat),n=diffDays(c.anchor,date);
    return CATS[(((i0+n)%5)+5)%5].k;
  }
  // Re-anchor so that `date` gets `cat`; the following days continue the cycle from there.
  const anchorFor=(date,cat)=>({anchor:date,anchorCat:cat});

  /* ---------- category of a problem ---------- */
  // state.rcat[pid] is a manual override ("none" = leave it out); otherwise the tracker topic decides.
  function catOf(p,state){
    const o=state.rcat&&state.rcat[p.id];
    if(o)return o==="none"?null:(CAT[o]?o:null);
    const c=CATS.find(x=>x.topics.includes(p.topic));return c?c.k:null;
  }
  const defaultCat=topic=>{const c=CATS.find(x=>x.topics.includes(topic));return c?c.k:null;};

  /* ---------- scheduling ---------- */
  function status(p,state,date){
    const r=state.rev&&state.rev[p.id];
    if(!r||!r.due)return {kind:"new",r,over:0};
    const d=diffDays(r.due,date);
    return {kind:d>0?"overdue":d===0?"due":"later",r,over:d};
  }
  const median=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;};
  const timed=r=>(r&&r.hist||[]).filter(h=>h.sec>0&&h.mode!=="recall").map(h=>h.sec);
  const mastered=r=>!!r&&(r.streak||0)>=2;
  function estSec(p,state,c){
    const r=state.rev&&state.rev[p.id];
    if(mastered(r))return c.estMin.recall*60;
    const m=median(timed(r));return m||((c.estMin[p.difficulty]||20)*60);
  }
  // How hard this problem has been for you: higher comes first among equals.
  function weight(p,state,bonus){
    const r=state.rev&&state.rev[p.id],h=r&&r.hist||[],last=h[h.length-1];
    let w=0;
    if(last)w+=(5-(last.conf||3))*20+(last.how==="solution"?40:last.how==="hints"?20:0);
    w+=((r&&r.lapses)||0)*15;
    w+={Hard:15,Medium:5}[p.difficulty]||0;
    return w+(bonus?bonus(p):0);
  }
  // Today's queue for one topic: overdue first, then due, then never revised; capped at the 3-hour block.
  function buildQueue(problems,state,date,cat,o={}){
    const c=cfg(state),solved=o.solved||(()=>true);
    const pool=problems.filter(p=>solved(p)&&catOf(p,state)===cat);
    const rank={overdue:0,due:1,new:2};
    const items=pool.map(p=>({p,s:status(p,state,date)}));
    const later=items.filter(x=>x.s.kind==="later").sort((a,b)=>a.s.r.due.localeCompare(b.s.r.due)).map(x=>x.p.id);
    const elig=items.filter(x=>x.s.kind!=="later").sort((a,b)=>rank[a.s.kind]-rank[b.s.kind]||b.s.over-a.s.over||weight(b.p,state,o.bonus)-weight(a.p,state,o.bonus)||a.p.id-b.p.id);
    const cap=(c.sessionMin||180)*60,queue=[],overflow=[];let t=0;
    for(const x of elig){const e=estSec(x.p,state,c);if(!queue.length||t+e<=cap){queue.push(x.p.id);t+=e;}else overflow.push(x.p.id);}
    return {pool:pool.map(p=>p.id),queue,overflow,later,est:t,kinds:Object.fromEntries(items.map(x=>[x.p.id,x.s.kind]))};
  }

  /* ---------- adaptive intervals ---------- */
  // input: {out:"reviewed"|"forgot"|"practice", how:"solo"|"hints"|"solution", conf:1-5, sec, ins:boolean, mode}
  function grade(r,input,c,diff){
    const iv=c.iv,prev=(r&&r.streak)||0;let kind,ivl,streak=0;
    if(input.out==="forgot"||input.how==="solution"){kind="forgot";ivl=iv.forgot;}
    else if(input.how==="hints"){kind="hints";ivl=iv.hints;}
    else{
      const slow=(input.sec>0&&input.sec>(c.slowMin[diff]||25)*60)||(input.conf||0)<4||input.ins===false;
      if(slow){kind="slow";ivl=iv.slow;}
      else{streak=prev+1;kind=streak>=2?"mastered":"confident";ivl=streak===1?iv.confident:iv.ladder[Math.min(streak-2,iv.ladder.length-1)];}
    }
    if(input.out==="practice"){kind="practice";streak=0;ivl=Math.min(ivl,iv.hints);}
    return {kind,ivl,streak};
  }
  function applyReview(state,p,input,date){
    state.rev=state.rev||{};
    const c=cfg(state),r=state.rev[p.id]||(state.rev[p.id]={hist:[],streak:0,lapses:0});
    r.hist=r.hist||[];
    const g=grade(r,input,c,p.difficulty);
    const e={d:date,sec:Math.round(input.sec||0),conf:input.conf||null,how:input.how||null,out:input.out,ins:input.ins!==false,mode:input.mode||"full",ivl:g.ivl,kind:g.kind};
    if(input.recall)e.recall=input.recall;
    r.hist.push(e);if(r.hist.length>60)r.hist.splice(0,r.hist.length-60);
    if(g.kind==="forgot")r.lapses=(r.lapses||0)+1;
    r.streak=g.streak;r.ivl=g.ivl;r.due=addDays(date,g.ivl);r.last=date;delete r.carry;
    return e;
  }

  /* ---------- session clock (wall-clock based, survives navigation and refresh) ---------- */
  function elapsed(s,now){return Math.floor((s.acc||0)+(s.run?(now-s.run)/1000:0));}
  function attempt(s,pid,now){return Math.floor(((s.tacc||{})[pid]||0)+(s.cur===pid&&s.tstart?(now-s.tstart)/1000:0));}
  function closeSeg(s,now){if(s.cur!=null&&s.tstart){s.tacc[s.cur]=((s.tacc[s.cur]||0)+(now-s.tstart)/1000);}s.tstart=null;}
  function pause(s,now){if(!s.run)return;s.acc=(s.acc||0)+(now-s.run)/1000;s.run=null;closeSeg(s,now);}
  function resume(s,now){if(s.run||s.finished)return;s.run=now;if(s.cur!=null)s.tstart=now;}
  function select(s,pid,now){closeSeg(s,now);s.cur=pid;if(s.run&&pid!=null)s.tstart=now;}
  const remaining=s=>s.queue.filter(id=>!(id in s.done)&&!s.skip.includes(id));
  function newSession(date,cat,queue,now){
    return {date,cat,started:now,acc:0,run:now,queue:[...queue],done:{},skip:[],cur:queue[0]??null,tacc:{},tstart:queue.length?now:null,draft:{},finished:false};
  }
  // Ends a session: logs it and carries unfinished problems forward so they come back as overdue.
  function finish(state,s,now){
    pause(s,now);s.finished=true;
    state.rev=state.rev||{};
    const left=s.queue.filter(id=>!(id in s.done));
    for(const id of left){const r=state.rev[id]||(state.rev[id]={hist:[],streak:0,lapses:0});if(!r.due||r.due>s.date)r.due=s.date;r.carry=true;}
    const outs=Object.values(s.done);
    const log={date:s.date,cat:s.cat,sec:elapsed(s,now),planned:s.queue.length,reviewed:outs.length,forgot:outs.filter(x=>x==="forgot").length,practice:outs.filter(x=>x==="practice").length,skipped:s.skip.filter(id=>!(id in s.done)).length,carried:left.length};
    state.rlog=state.rlog||[];state.rlog.push(log);
    return log;
  }

  /* ---------- history and trends ---------- */
  function probStats(r){
    const h=(r&&r.hist)||[],t=h.filter(x=>x.sec>0&&x.mode!=="recall");
    const solo=h.filter(x=>x.how==="solo"&&x.out!=="forgot").length;
    return {n:h.length,last:h[h.length-1]||null,prev:h[h.length-2]||null,med:median(t.map(x=>x.sec)),
      solo:h.length?solo/h.length:null,ins:h.length?h.filter(x=>x.ins).length/h.length:null,
      confFirst:h.length?h[0].conf:null,confLast:h.length?h[h.length-1].conf:null};
  }
  // Compares attempt 1, 2 and 3+ across all problems: are revisions getting faster and more independent?
  function trends(state){
    const buckets=[[],[],[]];
    let firstT=[],lastT=[];
    for(const r of Object.values(state.rev||{})){
      const h=(r.hist||[]);h.forEach((x,i)=>buckets[Math.min(i,2)].push(x));
      const t=h.filter(x=>x.sec>0&&x.mode!=="recall");
      if(t.length>=2){firstT.push(t[0].sec);lastT.push(t[t.length-1].sec);}
    }
    const by=buckets.map(b=>({n:b.length,med:median(b.filter(x=>x.sec>0&&x.mode!=="recall").map(x=>x.sec)),
      solo:b.length?b.filter(x=>x.how==="solo"&&x.out!=="forgot").length/b.length:null,
      ins:b.length?b.filter(x=>x.ins).length/b.length:null}));
    const mf=median(firstT),ml=median(lastT);
    return {by,pairs:firstT.length,medFirst:mf,medLast:ml,change:mf&&ml!=null?(ml-mf)/mf:null};
  }

  const api={CATS,CAT,DEFAULTS,cfg,addDays,diffDays,topicFor,anchorFor,catOf,defaultCat,status,median,mastered,estSec,buildQueue,grade,applyReview,elapsed,attempt,pause,resume,select,remaining,newSession,finish,probStats,trends};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.REV=api;
})(typeof window!=="undefined"?window:globalThis);
