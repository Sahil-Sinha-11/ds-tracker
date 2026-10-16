// Morning Bloom: the visual layer for Prep Desk.
// Photo scenes (hotlinked from Unsplash, with a generated daylight skyline underneath as the fallback),
// optional YouTube backgrounds for Focus Mode, the reusable geometric figures (CSS 3D and SVG), and
// the canvas effects (particles, rain).
// Nothing here touches study data or timing. Every continuous effect stops when its element is
// off screen, when the tab is hidden, when ambience is off, or when the user prefers reduced motion.
(function(root){
  const doc=root.document;
  const reduce=()=>root.matchMedia&&root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const calm=()=>doc.documentElement.classList.contains("calm");

  /* ---------- Photos ----------
     Free photos under the Unsplash License (https://unsplash.com/license), hotlinked as Unsplash asks,
     with credit shown on screen. Bright, airy daylight scenes with calm space for the timer. */
  const PHOTOS={
    mist:{id:"photo-1773813964771-88bea1eb85ac",name:"Morning mist",by:"osamu nakazawa",user:"onaka",slug:"city-skyline-shrouded-in-morning-fog-with-trees-below-rwxhaiv9EzQ",alt:"A city skyline in pale morning fog above trees",pos:"50% 50%"},
    dawn:{id:"photo-1764983250414-ba89c32717ed",name:"Sunrise",by:"Leo_Visions",user:"leo_visions_",slug:"city-skyline-with-tall-modern-buildings-at-sunrise-sXPsWMPCuXk",alt:"A city skyline of tall buildings in soft sunrise light",pos:"50% 50%"},
    desk:{id:"photo-1758315417320-a8bbed64d29b",name:"Window desk",by:"Franco Debartolo",user:"francotheshooter",slug:"bright-home-office-with-desk-chair-and-window-lwLreiMS25k",alt:"A bright, minimal desk and chair beside a window",pos:"50% 50%"},
    highrise:{id:"photo-1780927089229-3673b0ba7d7a",name:"High above",by:"Janet Ganbold",user:"j4net999",slug:"cityscape-with-reflections-viewed-through-modern-glass-windows-EWp8wvGz7pw",alt:"A daylit city seen through tall glass windows",pos:"50% 50%"},
    afterrain:{id:"photo-1765461118486-bd0d9a3136f1",name:"After rain",by:"Philippe Bontemps",user:"philippeb",slug:"reflection-of-building-in-a-puddle-on-cobblestone-street-WrFbquFR4wY",alt:"A building reflected in a rain puddle on a cobblestone street",pos:"50% 60%"},
    pastel:{id:"photo-1759803766777-bfc697c70073",name:"Pastel sky",by:"Jim Luo",user:"jimluo",slug:"pink-wispy-clouds-over-city-skyline-at-dusk-LiyFUoQcXSM",alt:"Soft pink clouds over a calm city skyline",pos:"50% 45%"},
  };
  // Scene names saved by the earlier night theme map to their nearest daylight scene.
  const ALIAS={window:"highrise",tokyo:"dawn",rain:"afterrain",street:"afterrain",skyline:"dawn",shibuya:"pastel"};
  const resolve=k=>PHOTOS[k]?k:PHOTOS[ALIAS[k]]?ALIAS[k]:"mist";
  const SCENE_ORDER=["mist","dawn","desk","highrise","afterrain","pastel"];
  const src=(id,w)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
  const UTM="?utm_source=prep_desk&utm_medium=referral";
  function credit(key){
    const p=PHOTOS[resolve(key)];
    return `Photo: <a href="https://unsplash.com/@${p.user}${UTM}" target="_blank" rel="noopener">${p.by}</a> on <a href="https://unsplash.com/photos/${p.slug}${UTM}" target="_blank" rel="noopener">Unsplash</a>`;
  }
  // A photo layer: generated skyline first (always there), the photograph fades in over it if it loads.
  function photo(key,o={}){
    key=resolve(key);const p=PHOTOS[key];
    const set=[960,1600,2400].map(w=>`${src(p.id,w)} ${w}w`).join(", ");
    return `<div class="scn" data-scene="${key}">${skyline(o.seed||SCENE_ORDER.indexOf(key)+3)}
      <img class="scn-img" alt="${p.alt}" src="${src(p.id,1600)}" srcset="${set}" sizes="100vw" decoding="async" ${o.eager?'fetchpriority="high"':'loading="lazy"'} style="object-position:${p.pos}">
      <div class="scn-grade"></div></div>`;
  }
  // Fade photos in once loaded; drop them on error so the skyline shows.
  function wire(rootEl){
    (rootEl||doc).querySelectorAll("img.scn-img:not([data-w])").forEach(img=>{
      img.dataset.w=1;
      const ok=()=>{img.classList.add("ok");img.closest(".scn")&&img.closest(".scn").classList.add("has-photo");};
      if(img.complete&&img.naturalWidth)ok();
      else{img.addEventListener("load",ok,{once:true});img.addEventListener("error",()=>img.remove(),{once:true});}
    });
  }

  /* ---------- YouTube backgrounds ----------
     Any public video that allows embedding. Muted and looping, behind a veil; sound can be turned on
     from Focus Mode through the player's postMessage API (no extra script). */
  function ytId(u){
    u=String(u||"").trim();if(/^[\w-]{11}$/.test(u))return u;
    const m=u.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i);
    return m?m[1]:null;
  }
  function ytEmbed(id){
    const q=`autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1`;
    return `<div class="fs-video" data-yt="${id}"><iframe src="https://www.youtube-nocookie.com/embed/${id}?${q}" title="Background video" allow="autoplay; encrypted-media" tabindex="-1" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
  }
  function ytCommand(el,func){const f=el&&el.querySelector("iframe");if(f&&f.contentWindow)f.contentWindow.postMessage(JSON.stringify({event:"command",func,args:[]}),"*");}
  // Suggestions offered in Focus Mode. Checked to exist and allow embedding; titles are the channels' own.
  const VIDEOS=[
    {id:"0t7BnC5BKaA",name:"Rain on the window",by:"Velvet Rain"},
    {id:"4CB_0eW7vYA",name:"Cozy café",by:"Pierce"},
    {id:"oo-JTRbhpeA",name:"Morning city timelapse",by:"ExtraCloudinary"},
  ];

  /* ---------- Generated daylight skyline (fallback and sign-in backdrop) ---------- */
  function rng(seed){let a=seed>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  const cache={};
  function skyline(seed){
    if(cache[seed])return cache[seed];
    const R=rng(seed*9973),W=1600,H=900,r=(a,b)=>a+R()*(b-a),id="k"+seed;
    let s=`<svg class="sky" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE2F2"/><stop offset=".45" stop-color="#E4EEF5"/><stop offset=".72" stop-color="#F6EEE6"/><stop offset="1" stop-color="#F8E2D3"/></linearGradient>
      <radialGradient id="${id}h" cx=".78" cy=".72" r=".5"><stop offset="0" stop-color="#FFF6E8" stop-opacity=".95"/><stop offset=".4" stop-color="#F9DCC8" stop-opacity=".45"/><stop offset="1" stop-color="#F7F5EE" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7F5EE" stop-opacity="0"/><stop offset="1" stop-color="#F7F5EE" stop-opacity=".85"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/><rect width="${W}" height="${H}" fill="url(#${id}h)"/>`;
    for(let i=0;i<5;i++)s+=`<ellipse class="mist" cx="${r(0,W)|0}" cy="${r(H*.12,H*.4)|0}" rx="${r(160,320)|0}" ry="${r(18,34)|0}" fill="#FFFFFF" opacity="${r(.35,.6).toFixed(2)}"/>`;
    const layers=[{min:220,max:440,col:"#C9D8E4",op:.75},{min:150,max:360,col:"#A9BFCF",op:.85},{min:80,max:250,col:"#8EA7B6",op:.9}];
    layers.forEach((L,li)=>{
      let x=-30;s+=`<g opacity="${L.op}">`;
      while(x<W+30){
        const w=r(38,130)|0,h=r(L.min,L.max)|0,y=H-h;
        s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${L.col}"/>`;
        if(R()<.3){const sw=w*r(.4,.7)|0,sh=r(18,60)|0;s+=`<rect x="${x+(w-sw)/2|0}" y="${y-sh}" width="${sw}" height="${sh}" fill="${L.col}"/>`;}
        if(li===2&&R()<.5)s+=`<rect x="${x+w*.62|0}" y="${y}" width="${w*.38|0}" height="${h}" fill="#FFFFFF" opacity=".12"/>`;
        x+=w+(r(0,1)<.6?2:r(4,14)|0);
      }
      s+=`</g><rect y="${H*(.42+li*.12)}" width="${W}" height="${H*.6}" fill="url(#${id}f)" opacity=".55"/>`;
    });
    return cache[seed]=s+`</svg>`;
  }

  /* ---------- Geometric figures ----------
     Each figure is .fig (placed, scroll parallax) > .fig-m (cursor parallax) > .fig-f (float) > shape.
     Animations take a negative delay from the clock so re-rendered figures keep their phase. */
  const ph=(sec)=>`animation-delay:${-((Date.now()/1000)%sec).toFixed(2)}s;animation-duration:${sec}s`;
  const place=o=>`left:${o.x};top:${o.y};--sz:${o.size}px`;
  const wrap=(o,inner,cls="")=>`<div class="fig ${cls}" style="${place(o)}" data-depth="${o.depth||.5}"><div class="fig-m"><div class="fig-f" style="${ph(o.float||14)}">${inner}</div></div></div>`;
  const F={
    torus:o=>wrap(o,`<div class="f3d wob" style="--rx:${o.rx??66}deg;--ry:${o.ry??-16}deg;${ph(o.wob||22)}"><div class="torus spin" style="${ph(o.dur||40)}"><i class="tube"></i><i class="arc"></i><i class="arc a2"></i></div></div>`,"f-torus"),
    sphere:o=>wrap(o,`<div class="sph ${o.tone||""}"></div>`,"f-sphere"),
    cube:o=>wrap(o,`<div class="f3d"><div class="cube" style="${ph(o.dur||30)}"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`,"f-cube"),
    gyro:o=>wrap(o,`<div class="f3d"><div class="gyro" style="${ph(o.dur||44)}"><i></i><i></i><i></i><i class="eq"></i><b></b></div></div>`,"f-gyro"),
    orbit:o=>wrap(o,`<div class="f3d" style="--rx:${o.rx??74}deg;--ry:${o.ry??10}deg"><div class="orbit spin" style="${ph(o.dur||26)}"><i class="path"></i><b class="sat"></b></div></div>`,"f-orbit"),
    ico:o=>wrap(o,`<svg class="ico" viewBox="-100 -100 200 200" aria-hidden="true" data-speed="${o.speed||1}"></svg>`,"f-ico"),
    field:o=>`<div class="lf ${o.tone||""}" style="${place(o)};${ph(o.float||30)}"></div>`,
    ribbon:o=>`<svg class="ribbon" style="${o.style||""}" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="rbg${o.id||0}" x1="0" x2="1"><stop offset="0" stop-color="#6E9A78" stop-opacity="0"/><stop offset=".3" stop-color="#6E9A78" stop-opacity=".75"/><stop offset=".62" stop-color="#5F93BA" stop-opacity=".7"/><stop offset=".85" stop-color="#8A74C2" stop-opacity=".5"/><stop offset="1" stop-color="#D98F69" stop-opacity="0"/></linearGradient></defs>
      <path class="rb-band" d="M-20 300 C 240 180, 420 380, 640 250 S 1000 120, 1220 210" stroke="url(#rbg${o.id||0})"/>
      <path class="rb-line" d="M-20 300 C 240 180, 420 380, 640 250 S 1000 120, 1220 210" stroke="url(#rbg${o.id||0})" style="${ph(36)}"/>
      <path class="rb-line l2" d="M-20 322 C 250 210, 430 400, 650 272 S 1010 150, 1220 236" stroke="url(#rbg${o.id||0})" style="${ph(48)}"/></svg>`,
  };

  // The home composition: a pastel ring with a polyhedron floating inside it, glass spheres in sage,
  // sky and peach, a wire globe and a cube at the edges, one wide orbit. Right side, clear of the copy.
  function heroFigures(){
    return `<div class="figs" aria-hidden="true">
      ${F.field({x:"76%",y:"36%",size:600,float:34})}${F.field({x:"90%",y:"72%",size:380,tone:"violet",float:26})}${F.field({x:"58%",y:"78%",size:420,tone:"sage",float:40})}${F.field({x:"94%",y:"10%",size:300,tone:"amber",float:30})}
      ${F.orbit({x:"74%",y:"40%",size:640,depth:.2,dur:34,rx:76,ry:-8})}
      ${F.torus({x:"76%",y:"36%",size:330,depth:.35,dur:52,rx:64,ry:-20})}
      ${F.ico({x:"76%",y:"36%",size:150,depth:.5,speed:.8})}
      ${F.sphere({x:"62%",y:"62%",size:150,depth:.65,float:15})}
      ${F.gyro({x:"58%",y:"20%",size:96,depth:.8,dur:56})}
      ${F.cube({x:"91%",y:"64%",size:62,depth:.9,dur:32})}
      ${F.sphere({x:"92%",y:"17%",size:44,depth:1,tone:"amber",float:11})}
      ${F.sphere({x:"86%",y:"84%",size:64,depth:.75,tone:"violet",float:19})}
      ${F.orbit({x:"62%",y:"62%",size:240,depth:.65,dur:18,rx:70,ry:24})}
      ${F.ribbon({id:1,style:"left:32%;right:-4%;bottom:4%;height:40%"})}
    </div>`;
  }
  // Focus Mode keeps it to two quiet shapes at the edges, never behind the timer.
  function focusFigures(){
    return `<div class="figs quiet" aria-hidden="true">${F.sphere({x:"90%",y:"24%",size:70,depth:.6,float:18,tone:"sky"})}${F.gyro({x:"9%",y:"80%",size:80,depth:.4,dur:64})}</div>`;
  }
  // Small accent for page headers.
  function mini(seed){
    const s=seed%3;
    return `<div class="mini-figs" aria-hidden="true">${F.field({x:"60%",y:"50%",size:260,tone:s===1?"violet":s===2?"sage":"",float:30})}
      ${s===0?F.torus({x:"58%",y:"50%",size:118,dur:40,rx:68,ry:-18})+F.sphere({x:"80%",y:"62%",size:32,tone:"sky",float:10}):
        s===1?F.gyro({x:"60%",y:"50%",size:84,dur:44})+F.sphere({x:"30%",y:"64%",size:26,tone:"amber",float:9}):
        F.orbit({x:"58%",y:"50%",size:150,dur:22,rx:72,ry:-6})+F.cube({x:"58%",y:"50%",size:40,dur:24})}</div>`;
  }

  /* ---------- One requestAnimationFrame loop for every canvas/SVG effect ---------- */
  const Loop={fns:new Set(),raf:0,
    add(f){this.fns.add(f);this.kick();},del(f){this.fns.delete(f);},
    kick(){if(!this.raf&&this.fns.size&&!doc.hidden)this.raf=requestAnimationFrame(t=>{this.raf=0;this.fns.forEach(f=>f(t));this.kick();});}};
  doc.addEventListener("visibilitychange",()=>Loop.kick());

  // Runs `frame` only while the element is on screen and motion is allowed; draws once otherwise.
  function effect(el,frame,setup){
    let on=false,vis=true,live=true;
    const sync=()=>{const want=live&&vis&&!reduce()&&!calm();if(want&&!on){on=true;Loop.add(frame);}else if(!want&&on){on=false;Loop.del(frame);}};
    const io=root.IntersectionObserver?new IntersectionObserver(e=>{vis=e[e.length-1].isIntersecting;sync();}):null;
    if(io)io.observe(el);
    setup&&setup();frame(performance.now());sync();
    return {sync,stop(){live=false;sync();},start(){live=true;sync();},destroy(){live=false;sync();io&&io.disconnect();}};
  }
  function sizeCanvas(cv){const dpr=Math.min(1.5,root.devicePixelRatio||1),r=cv.getBoundingClientRect();cv.width=Math.max(1,r.width*dpr|0);cv.height=Math.max(1,r.height*dpr|0);return dpr;}

  // Slow drifting motes: sage and sky on light backgrounds, a few peach.
  function particles(cv,o={}){
    const ctx=cv.getContext("2d");let P=[],dpr=1,last=0;
    const setup=()=>{dpr=sizeCanvas(cv);const n=Math.min(o.max||70,Math.round(cv.width*cv.height/(dpr*dpr)/14000));
      P=[...Array(n)].map(()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,r:(Math.random()*1.3+.4)*dpr,v:(Math.random()*.12+.03)*dpr,a:Math.random()*Math.PI*2,w:Math.random()*.6+.2,warm:Math.random()<.2,sky:Math.random()<.45}));};
    const frame=t=>{const dt=Math.min(64,t-(last||t));last=t;ctx.clearRect(0,0,cv.width,cv.height);
      for(const p of P){p.y-=p.v*dt/16;p.a+=.004*dt/16;p.x+=Math.sin(p.a)*.15*dpr;if(p.y<-4){p.y=cv.height+4;p.x=Math.random()*cv.width;}
        const al=(.25+.35*Math.sin(p.a*3+p.w*9)**2)*(o.alpha||1);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fillStyle=p.warm?`rgba(217,143,105,${al})`:p.sky?`rgba(95,147,186,${al})`:`rgba(110,154,120,${al})`;ctx.fill();}};
    const e=effect(cv,frame,setup);let rt;const onR=()=>{clearTimeout(rt);rt=setTimeout(()=>{setup();frame(performance.now());},150);};
    root.addEventListener("resize",onR);const d=e.destroy;e.destroy=()=>{d();root.removeEventListener("resize",onR);};return e;
  }
  // Light rain streaks for the rainy scenes.
  function rain(cv,o={}){
    const ctx=cv.getContext("2d");let D=[],dpr=1,last=0;
    const setup=()=>{dpr=sizeCanvas(cv);const n=Math.min(o.max||150,Math.round(cv.width*cv.height/(dpr*dpr)/9000));
      D=[...Array(n)].map(()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,l:(Math.random()*14+8)*dpr,v:(Math.random()*5+7)*dpr,a:Math.random()*.18+.08}));};
    const frame=t=>{const dt=Math.min(64,t-(last||t))/16;last=t;ctx.clearRect(0,0,cv.width,cv.height);ctx.lineWidth=dpr;ctx.lineCap="round";
      for(const d of D){d.y+=d.v*dt;d.x-=d.v*.12*dt;if(d.y>cv.height){d.y=-d.l;d.x=Math.random()*cv.width*1.1;}
        ctx.strokeStyle=`rgba(95,130,160,${d.a})`;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+d.l*.12,d.y-d.l);ctx.stroke();}};
    const e=effect(cv,frame,setup);let rt;const onR=()=>{clearTimeout(rt);rt=setTimeout(setup,150);};
    root.addEventListener("resize",onR);const d=e.destroy;e.destroy=()=>{d();root.removeEventListener("resize",onR);};return e;
  }
  // Rotating wireframe icosahedron, projected in JS (12 vertices, 30 edges), nearer edges brighter.
  const PHI=(1+Math.sqrt(5))/2;
  const V=[[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]].map(v=>{const n=Math.hypot(...v);return v.map(x=>x/n);});
  const E=[];for(let i=0;i<12;i++)for(let j=i+1;j<12;j++){const d=Math.hypot(V[i][0]-V[j][0],V[i][1]-V[j][1],V[i][2]-V[j][2]);if(d<1.1)E.push([i,j]);}
  function ico(svg){
    const sp=+svg.dataset.speed||1;svg.innerHTML=E.map(()=>`<line/>`).join("")+V.map(()=>`<circle r="2"/>`).join("");
    const L=[...svg.querySelectorAll("line")],C=[...svg.querySelectorAll("circle")];let a=.6,b=.3,last=0;
    const frame=t=>{const dt=Math.min(64,t-(last||t));last=t;a+=.00022*dt*sp;b+=.00013*dt*sp;
      const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
      const P=V.map(([x,y,z])=>{const x1=x*ca-z*sa,z1=x*sa+z*ca,y1=y*cb-z1*sb,z2=y*sb+z1*cb,k=1/(1.9-z2*.45);return [x1*80*k,y1*80*k,z2];});
      E.forEach(([i,j],n)=>{const l=L[n],p=P[i],q=P[j];l.setAttribute("x1",p[0].toFixed(1));l.setAttribute("y1",p[1].toFixed(1));l.setAttribute("x2",q[0].toFixed(1));l.setAttribute("y2",q[1].toFixed(1));l.setAttribute("stroke-opacity",(.28+.5*((p[2]+q[2])/2+1)/2).toFixed(2));});
      P.forEach((p,n)=>{C[n].setAttribute("cx",p[0].toFixed(1));C[n].setAttribute("cy",p[1].toFixed(1));C[n].setAttribute("opacity",(.35+.6*(p[2]+1)/2).toFixed(2));});};
    return effect(svg,frame);
  }
  // Start every effect inside an element; returns a function that stops them all.
  function mount(el){
    const fx=[];if(!el)return()=>{};
    el.querySelectorAll("svg.ico").forEach(s=>fx.push(ico(s)));
    el.querySelectorAll("canvas.particles").forEach(c=>fx.push(particles(c,{max:+c.dataset.max||70,alpha:+c.dataset.alpha||1})));
    el.querySelectorAll("canvas.rain").forEach(c=>fx.push(rain(c)));
    wire(el);
    return Object.assign(()=>fx.forEach(f=>f.destroy()),{sync:()=>fx.forEach(f=>f.sync())});
  }

  /* ---------- Sound: a soft two-note chime made in Web Audio (no files) ---------- */
  let actx=null;
  function unlockAudio(){try{actx=actx||new (root.AudioContext||root.webkitAudioContext)();if(actx.state==="suspended")actx.resume();}catch(e){}}
  function chime(kind){
    try{unlockAudio();if(!actx)return;const t=actx.currentTime,notes=kind==="focus"?[659.25,987.77]:[523.25,783.99];
      notes.forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type="sine";o.frequency.value=f;
        g.gain.setValueAtTime(0,t+i*.22);g.gain.linearRampToValueAtTime(.16,t+i*.22+.03);g.gain.exponentialRampToValueAtTime(.0001,t+i*.22+1.6);
        o.connect(g).connect(actx.destination);o.start(t+i*.22);o.stop(t+i*.22+1.7);});}catch(e){}
  }

  root.SCENE={PHOTOS,SCENE_ORDER,ALIAS,resolve,VIDEOS,ytId,ytEmbed,ytCommand,photo,credit,wire,skyline,F,heroFigures,focusFigures,mini,mount,particles,rain,ico,Loop,reduce,unlockAudio,chime};
})(window);
