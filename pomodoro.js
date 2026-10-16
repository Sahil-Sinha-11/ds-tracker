// Pomodoro engine for Prep Desk's Focus Mode.
// Pure functions over state.pomo inside the existing localStorage state (dsa-tracker-v1); index.html owns the UI.
// The clock never counts ticks. A running timer stores the timestamp it ends at, so the remaining time is
// always end - now: it stays right across page changes, background tabs, refreshes and closed browsers.
// Active focus time is the sum of running segments, so paused time is never counted.
(function(root){
  const DEFAULTS={
    focus:25,short:5,long:15,every:4,   // minutes; a long break after every 4 completed focus sessions
    autoBreak:true,                    // breaks may start by themselves; focus sessions never do
    sound:true,ambient:true,
    scene:"mist",breakScene:"pastel",  // daylight photo scenes (see scene.js)
    video:"",veil:30,                  // optional YouTube background and how much cream veil sits over the backdrop (%)
  };
  const MODES={focus:"Focus",short:"Short break",long:"Long break"};
  const MIN_LOG=60;                    // partial sessions shorter than this are not logged

  const pad=n=>String(n).padStart(2,"0");
  const dayOf=ms=>{const d=new Date(ms);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;};
  const cfg=p=>Object.assign({},DEFAULTS,(p&&p.cfg)||{});
  const durOf=(mode,c)=>Math.max(60,Math.round((mode==="focus"?c.focus:mode==="short"?c.short:c.long)*60));
  const fresh=(mode,c,task,cycle)=>({mode,status:"idle",dur:durOf(mode,c),left:durOf(mode,c),end:null,started:null,segs:[],task:task||null,cycle:cycle||0});

  // Make sure state.pomo exists and is well formed (older saves and imports have none).
  function ensure(state){
    let p=state.pomo;
    if(!p||typeof p!=="object")p=state.pomo={};
    if(!p.cfg||typeof p.cfg!=="object")p.cfg={};
    if(!Array.isArray(p.log))p.log=[];
    if(!p.cur||!MODES[p.cur.mode])p.cur=fresh("focus",cfg(p),null,0);
    if(!Array.isArray(p.cur.segs))p.cur.segs=[];
    return p;
  }

  const running=p=>p.cur.status==="running";
  function remaining(p,now){const c=p.cur;return c.status==="running"?Math.max(0,(c.end-now)/1000):c.left;}
  // Seconds actually spent running, up to `until` (paused gaps never count).
  function active(p,until){
    return p.cur.segs.reduce((a,s)=>a+Math.max(0,Math.min(s.e??until,until)-s.s),0)/1000;
  }
  const progress=(p,now)=>{const c=p.cur;return c.dur?Math.min(1,Math.max(0,1-remaining(p,now)/c.dur)):0;};

  function start(p,now){
    const c=p.cur;if(c.status==="running")return false;
    if(c.left<=0)c.left=c.dur;
    c.status="running";c.end=now+c.left*1000;c.started=c.started||now;c.segs.push({s:now});
    return true;
  }
  function pause(p,now){
    const c=p.cur;if(c.status!=="running")return false;
    c.left=Math.max(0,(c.end-now)/1000);c.end=null;c.status="paused";
    const s=c.segs[c.segs.length-1];if(s&&s.e==null)s.e=now;
    return true;
  }

  function record(p,at,done){
    const c=p.cur,sec=Math.round(active(p,at));
    if(!done&&sec<MIN_LOG)return null;
    const e={mode:c.mode,d:dayOf(c.started||at),s:c.started||at,e:at,sec,planned:c.dur,done:!!done};
    if(c.task)e.task=Object.assign({},c.task);
    p.log.push(e);
    return e;
  }
  // The session that follows `mode`, given how many focus sessions are complete in this set.
  function nextMode(mode,cycle,c){return mode==="focus"?(cycle>=c.every?"long":"short"):"focus";}

  // Move on from the current timer. `completed` is true only when it ran to zero.
  function advance(p,at,completed){
    const c=cfg(p),cur=p.cur,ev={from:cur.mode,completed,at,entry:record(p,at,completed)};
    let cycle=cur.cycle;
    if(cur.mode==="focus"&&completed)cycle+=1;
    const mode=nextMode(cur.mode,cycle,c);
    if(cur.mode==="long")cycle=0;
    else if(cur.mode==="focus"&&mode==="long")cycle=c.every; // stays full until the long break ends
    p.cur=fresh(mode,c,cur.task,cycle);
    ev.to=mode;
    // Breaks can start on their own, from the moment the focus session ended. Focus never auto-starts.
    if(completed&&mode!=="focus"&&c.autoBreak){start(p,at);ev.autoStarted=true;}
    return ev;
  }

  // Bring the timer up to `now`: completes any timer whose end has passed (possibly several, if the
  // page was closed through a focus session and its break). Returns what happened, oldest first.
  function settle(p,now){
    const out=[];let guard=0;
    while(p.cur.status==="running"&&now>=p.cur.end&&guard++<8){
      const end=p.cur.end,s=p.cur.segs[p.cur.segs.length-1];if(s&&s.e==null)s.e=end;
      out.push(advance(p,end,true));
    }
    return out;
  }

  function skip(p,now){
    const c=p.cur;
    if(c.status==="running"){const s=c.segs[c.segs.length-1];if(s&&s.e==null)s.e=now;}
    const ev=advance(p,now,false);ev.skipped=true;return ev;
  }
  // Back to the full duration of the same mode. Real focus time already spent is still logged.
  function reset(p,now){
    const c=p.cur;
    if(c.status==="running"){const s=c.segs[c.segs.length-1];if(s&&s.e==null)s.e=now;}
    const entry=record(p,now,false),k=cfg(p);
    p.cur=fresh(c.mode,k,c.task,c.cycle);
    return entry;
  }
  // Switch mode by hand (only offered while nothing is running).
  function setMode(p,mode,now){
    if(!MODES[mode])return;const c=p.cur;
    if(c.status!=="idle")reset(p,now);
    p.cur=fresh(mode,cfg(p),p.cur.task,p.cur.cycle);
  }
  function setTask(p,task){p.cur.task=task||null;}

  // Change durations. A timer that hasn't started takes the new length; one that is running or paused
  // keeps the time already spent and gains or loses the difference.
  function setCfg(p,patch,now){
    const before=cfg(p);Object.assign(p.cfg,patch);const after=cfg(p),c=p.cur;
    const nd=durOf(c.mode,after),od=durOf(c.mode,before);
    if(nd===od)return;
    if(c.status==="idle"){c.dur=nd;c.left=nd;return;}
    const delta=nd-c.dur;c.dur=nd;
    if(c.status==="running")c.end+=delta*1000;else c.left=Math.max(0,c.left+delta);
    if(c.status==="paused"&&c.left<=0)c.left=1;
  }

  // Totals for one day (or for every day when date is omitted).
  function dayStats(p,date){
    const L=p.log.filter(e=>!date||e.d===date);
    const F=L.filter(e=>e.mode==="focus");
    return {focusSec:F.reduce((a,e)=>a+e.sec,0),breakSec:L.filter(e=>e.mode!=="focus").reduce((a,e)=>a+e.sec,0),
      completed:F.filter(e=>e.done).length,partial:F.filter(e=>!e.done).length,entries:L};
  }
  function byKind(p,dates){
    const m={};p.log.forEach(e=>{if(e.mode!=="focus"||(dates&&!dates.includes(e.d)))return;const k=e.task&&e.task.k||"other";m[k]=(m[k]||0)+e.sec;});
    return m;
  }

  const api={DEFAULTS,MODES,MIN_LOG,cfg,ensure,durOf,remaining,active,progress,running,start,pause,settle,skip,reset,setMode,setTask,setCfg,nextMode,dayStats,byKind,dayOf};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.POMO=api;
})(typeof window!=="undefined"?window:globalThis);
