// Midnight Study Club: the visual layer for Prep Desk.
// Photo scenes (hotlinked from Unsplash, with a generated night skyline underneath as the fallback),
// the reusable geometric figures (CSS 3D and SVG), and the canvas effects (particles, rain).
// Nothing here touches study data or timing. Every continuous effect stops when its element is
// off screen, when the tab is hidden, when ambience is off, or when the user prefers reduced motion.
(function(root){
  const doc=root.document;
  const reduce=()=>root.matchMedia&&root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const calm=()=>doc.documentElement.classList.contains("calm");

  /* ---------- Photos ----------
     Free photos under the Unsplash License (https://unsplash.com/license), hotlinked as Unsplash asks,
     with credit shown on screen. One colour grade in CSS keeps them looking like one set. */
  const PHOTOS={
    tokyo:{id:"photo-1759970752518-b0ffa38c130b",name:"Tokyo Tower",by:"T Y",user:"tyr123",slug:"tokyo-tower-illuminated-at-night-with-city-skyline-t1JoTScJs-c",alt:"Tokyo Tower lit up above the city at night",pos:"50% 42%"},
    window:{id:"photo-1722864727900-99dcec99eea4",name:"Window",by:"Nguyen Phan Nam Anh",user:"dying_apricity",slug:"a-view-of-a-city-at-night-from-a-window-g5uM0Yjjbww",alt:"A city at night seen from a window",pos:"50% 50%"},
    rain:{id:"photo-1760165276068-22913e126b24",name:"Osaka rain",by:"Cuvii",user:"cuvii",slug:"rainy-city-street-at-night-with-glowing-neon-signs-G0KVzxBb2xo",alt:"Neon signs reflected on a rain-soaked street in Osaka",pos:"50% 55%",rain:true},
    street:{id:"photo-1739372679232-41a7cac24b48",name:"Night street",by:"Joshua Tsu",user:"joshdatsu",slug:"a-city-street-at-night-in-the-rain-02mWrtCxMSM",alt:"A city street at night in the rain",pos:"50% 50%",rain:true},
    skyline:{id:"photo-1663124339125-b2501a634972",name:"Skyline",by:"rawkkim",user:"rawkkim",slug:"a-city-skyline-at-night-B61yI-uO_oI",alt:"A city skyline lit up at night",pos:"50% 50%"},
    shibuya:{id:"photo-1764418658652-3b8d6304b115",name:"Shibuya",by:"Sarmat Batagov",user:"batag_",slug:"aerial-view-of-a-city-skyline-at-night-RDlhSZR4SR8",alt:"Shibuya Crossing in Tokyo at night, from above",pos:"50% 50%"},
  };
  const SCENE_ORDER=["window","tokyo","rain","street","skyline","shibuya"];
  const src=(id,w)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
  const UTM="?utm_source=prep_desk&utm_medium=referral";
  function credit(key){
    const p=PHOTOS[key];if(!p)return "";
    return `Photo: <a href="https://unsplash.com/@${p.user}${UTM}" target="_blank" rel="noopener">${p.by}</a> on <a href="https://unsplash.com/photos/${p.slug}${UTM}" target="_blank" rel="noopener">Unsplash</a>`;
  }
  // A photo layer: generated skyline first (always there), the photograph fades in over it if it loads.
  function photo(key,o={}){
    const p=PHOTOS[key]||PHOTOS.window;
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

  /* ---------- Generated night skyline (fallback and login backdrop) ---------- */
  function rng(seed){let a=seed>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  const cache={};
  function skyline(seed){
    if(cache[seed])return cache[seed];
    const R=rng(seed*9973),W=1600,H=900,r=(a,b)=>a+R()*(b-a),id="k"+seed;
    let s=`<svg class="sky" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050d"/><stop offset=".42" stop-color="#091130"/><stop offset=".7" stop-color="#171b48"/><stop offset=".86" stop-color="#352953"/><stop offset="1" stop-color="#4a3346"/></linearGradient>
      <radialGradient id="${id}h" cx=".5" cy="1" r=".75"><stop offset="0" stop-color="#ffb35c" stop-opacity=".32"/><stop offset=".45" stop-color="#7a6cf5" stop-opacity=".12"/><stop offset="1" stop-color="#05070f" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2150" stop-opacity="0"/><stop offset="1" stop-color="#1b2150" stop-opacity=".55"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/><rect width="${W}" height="${H}" fill="url(#${id}h)"/>`;
    for(let i=0;i<70;i++)s+=`<circle cx="${r(0,W)|0}" cy="${r(0,H*.45)|0}" r="${r(.4,1.3).toFixed(1)}" fill="#cfdaff" opacity="${r(.15,.6).toFixed(2)}"/>`;
    const layers=[{min:200,max:430,col:"#121b42",lit:.05,op:.85},{min:140,max:360,col:"#0b1130",lit:.12,op:1},{min:70,max:250,col:"#05070f",lit:.17,op:1}];
    let flick=0,budget=520;
    layers.forEach((L,li)=>{
      let x=-30;s+=`<g opacity="${L.op}">`;
      while(x<W+30){
        const w=r(38,130)|0,h=r(L.min,L.max)|0,y=H-h;
        s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${L.col}"/>`;
        if(R()<.3){const sw=w*r(.4,.7)|0,sh=r(18,60)|0;s+=`<rect x="${x+(w-sw)/2|0}" y="${y-sh}" width="${sw}" height="${sh}" fill="${L.col}"/>`;}
        if(R()<.22){const ax=x+w/2|0,ah=r(24,70)|0;s+=`<rect x="${ax-1}" y="${y-ah}" width="2" height="${ah}" fill="${L.col}"/><circle class="blk" cx="${ax}" cy="${y-ah}" r="2.2" fill="#ff5d6c" style="animation-delay:${-r(0,3).toFixed(2)}s"/>`;}
        if(L.lit&&budget>0){
          const cols=Math.floor((w-12)/11),rows=Math.floor((h-18)/15);
          for(let c=0;c<cols;c++)for(let q=0;q<rows;q++){
            if(R()>L.lit||budget<=0)continue;budget--;
            const warm=R()<.84,fl=li===2&&flick<9&&R()<.06;if(fl)flick++;
            s+=`<rect ${fl?`class="flk" style="animation-delay:${-r(0,9).toFixed(1)}s" `:""}x="${x+7+c*11}" y="${y+10+q*15}" width="5" height="7" fill="${warm?"#ffbf6e":"#a9c4ff"}" opacity="${r(.35,.95).toFixed(2)}"/>`;
          }
        }
        x+=w+(r(0,1)<.6?2:r(4,14)|0);
      }
      s+=`</g>`;
      if(li===0)s+=`<rect y="${H*.45}" width="${W}" height="${H*.55}" fill="url(#${id}f)"/>`;
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
    ribbon:o=>`<svg class="ribbon" style="${o.style||""}" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="rbg${o.id||0}" x1="0" x2="1"><stop offset="0" stop-color="#5b8def" stop-opacity="0"/><stop offset=".35" stop-color="#8fb0ff" stop-opacity=".7"/><stop offset=".7" stop-color="#a58bff" stop-opacity=".55"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></linearGradient></defs>
      <path class="rb-band" d="M-20 300 C 240 180, 420 380, 640 250 S 1000 120, 1220 210" stroke="url(#rbg${o.id||0})"/>
      <path class="rb-line" d="M-20 300 C 240 180, 420 380, 640 250 S 1000 120, 1220 210" stroke="url(#rbg${o.id||0})" style="${ph(36)}"/>
      <path class="rb-line l2" d="M-20 322 C 250 210, 430 400, 650 272 S 1010 150, 1220 236" stroke="url(#rbg${o.id||0})" style="${ph(48)}"/></svg>`,
  };

  // The home composition: a ring with a polyhedron floating inside it, a glass sphere below, a wire
  // globe and a cube at the edges, one wide orbit through all of it. Right side, clear of the copy.
  function heroFigures(){
    return `<div class="figs" aria-hidden="true">
      ${F.field({x:"74%",y:"34%",size:620,tone:"indigo",float:34})}${F.field({x:"88%",y:"70%",size:380,tone:"violet",float:26})}${F.field({x:"20%",y:"92%",size:520,tone:"amber",float:40})}
      ${F.orbit({x:"74%",y:"40%",size:640,depth:.2,dur:30,rx:76,ry:-8})}
      ${F.torus({x:"76%",y:"36%",size:330,depth:.35,dur:46,rx:64,ry:-20})}
      ${F.ico({x:"76%",y:"36%",size:150,depth:.5,speed:1})}
      ${F.sphere({x:"62%",y:"62%",size:150,depth:.65,float:12})}
      ${F.gyro({x:"58%",y:"20%",size:96,depth:.8,dur:50})}
      ${F.cube({x:"91%",y:"64%",size:64,depth:.9,dur:26})}
      ${F.sphere({x:"92%",y:"17%",size:40,depth:1,tone:"amber",float:9})}
      ${F.orbit({x:"62%",y:"62%",size:240,depth:.65,dur:14,rx:70,ry:24})}
      ${F.ribbon({id:1,style:"left:30%;right:-4%;bottom:6%;height:42%"})}
    </div>`;
  }
  // Focus Mode keeps it to a quiet ring behind the timer and one sphere far off.
  function focusFigures(){
    return `<div class="figs quiet" aria-hidden="true">${F.sphere({x:"88%",y:"22%",size:70,depth:.6,float:16,tone:"violet"})}${F.gyro({x:"10%",y:"78%",size:80,depth:.4,dur:60})}</div>`;
  }
  // Small accent for page headers.
  function mini(seed){
    const s=seed%3;
    return `<div class="mini-figs" aria-hidden="true">${F.field({x:"60%",y:"50%",size:260,tone:s===1?"violet":"indigo",float:30})}
      ${s===0?F.torus({x:"58%",y:"50%",size:118,dur:40,rx:68,ry:-18})+F.sphere({x:"80%",y:"62%",size:32,float:10}):
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

  // Slow drifting light particles: mostly cool blue, a few warm.
  function particles(cv,o={}){
    const ctx=cv.getContext("2d");let P=[],dpr=1,last=0;
    const setup=()=>{dpr=sizeCanvas(cv);const n=Math.min(o.max||70,Math.round(cv.width*cv.height/(dpr*dpr)/14000));
      P=[...Array(n)].map(()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,r:(Math.random()*1.3+.4)*dpr,v:(Math.random()*.12+.03)*dpr,a:Math.random()*Math.PI*2,w:Math.random()*.6+.2,warm:Math.random()<.18}));};
    const frame=t=>{const dt=Math.min(64,t-(last||t));last=t;ctx.clearRect(0,0,cv.width,cv.height);
      for(const p of P){p.y-=p.v*dt/16;p.a+=.004*dt/16;p.x+=Math.sin(p.a)*.15*dpr;if(p.y<-4){p.y=cv.height+4;p.x=Math.random()*cv.width;}
        const al=(.25+.35*Math.sin(p.a*3+p.w*9)**2)*(o.alpha||1);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fillStyle=p.warm?`rgba(255,190,110,${al})`:`rgba(170,195,255,${al})`;ctx.fill();}};
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
        ctx.strokeStyle=`rgba(190,210,255,${d.a})`;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+d.l*.12,d.y-d.l);ctx.stroke();}};
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

  root.SCENE={PHOTOS,SCENE_ORDER,photo,credit,wire,skyline,F,heroFigures,focusFigures,mini,mount,particles,rain,ico,Loop,reduce,unlockAudio,chime};
})(window);
