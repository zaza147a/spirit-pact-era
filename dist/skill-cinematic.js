// Presentation-only layered canvas effects. Never touches game state.
const royalJudgmentRaster=new URL('./royal-judgment-v20.webp',import.meta.url).href;
const royalTypes=new Set(['holyShield','shieldStrike','shieldArray','royalShield','sanctuary','royalSanctuary','judgment','royalJudgment']);
const bladeTypes=new Set(['slash','bash','dualBlade','bladeStorm','execute','shadowBlade','ambush','poisonBlade','holyCross']);
const projectileTypes=new Set(['pierce','lance','snipe','falconArrow','arrowRain']);
const elementalTypes=new Set(['magic','arcaneStorm','elementStorm','elementBurst','firebolt','flameBurst','meteor','meteorRain','frostbolt','lightning','void']);
const fistTypes=new Set(['elementFist','energyPalm','dragonFist','quake']);
const soundTypes=new Set(['starNote','symphony','finale']);
const auraTypes=new Set(['heal','shield','buff','mana','resonance']);
const jobColors={knight:'#9edbff',crusader:'#ffe7a0',wizard:'#c8a1ff',sage:'#a8facf',assassin:'#ff93b4',rogue:'#ae9cfc',priest:'#fff3c2',monk:'#ffd59c',hunter:'#a6f3d6',performer:'#ffc9f4'};
const accents={holyShield:'#f6d488',shieldStrike:'#f6c56c',shieldArray:'#e7c68c',royalShield:'#ffe2a0',sanctuary:'#c9ecb5',royalSanctuary:'#ffe0a0',judgment:'#fff0b3',royalJudgment:'#ffe9b0',holyCross:'#ffe4a7',holyBeam:'#fff2c1',firebolt:'#ffac72',flameBurst:'#ff995c',meteor:'#ff9655',meteorRain:'#ff9655',lightning:'#b5c5ff',frostbolt:'#a7eaff',arrowRain:'#acf3d3',void:'#ae95fa',shadowBlade:'#c7a3f5'};
const active=[];
// 0.75 in v18, then another 20% relative reduction in v19.
const VFX_SCALE=.60;
const royalShieldPaint=typeof Image!=='undefined'?new Image():null;
const royalSanctuaryPaint=typeof Image!=='undefined'?new Image():null;
if(royalShieldPaint)royalShieldPaint.src=new URL('./royal-shield-v22.webp',import.meta.url).href;
if(royalSanctuaryPaint)royalSanctuaryPaint.src=new URL('./royal-sanctuary-v22.webp',import.meta.url).href;
const royalArt=typeof Image!=='undefined'?new Image():null;
if(royalArt)royalArt.src=new URL('./royal-judgment-vfx.svg',import.meta.url).href;
let royalPaintedSprite=null;
if(typeof Image!=='undefined'){
 const source=new Image();
 source.onload=()=>{
  const sprite=document.createElement('canvas');sprite.width=768;sprite.height=1152;
  const brush=sprite.getContext('2d');
  if(!brush)return;
  brush.drawImage(source,0,0,sprite.width,sprite.height);
  // Soft, non-rectangular silhouette mask: blend the generated cut-in art
  // into the arena rather than pasting its opaque warm background.
  const mask=brush.createRadialGradient(384,535,180,384,535,665);
  mask.addColorStop(0,'rgba(255,255,255,1)');
  mask.addColorStop(.63,'rgba(255,255,255,.98)');
  mask.addColorStop(.82,'rgba(255,255,255,.65)');
  mask.addColorStop(1,'rgba(255,255,255,0)');
  brush.globalCompositeOperation='destination-in';
  brush.fillStyle=mask;brush.fillRect(0,0,768,1152);
  royalPaintedSprite=sprite;
 };
 source.src=royalJudgmentRaster;
}
let canvas,ctx,frame=0;
let viewportWidth=0,viewportHeight=0;
const reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastCinematicStatus='尚未播放';
function clamp(value,min=0,max=1){return Math.min(max,Math.max(min,value));}
function easeOut(t){return 1-(1-clamp(t))**3;}
function bell(t,start,end){return clamp((t-start)*8)*clamp((end-t)*7);}
function skillSignature(value){let hash=2166136261;for(const c of String(value)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
function rgba(rgb,alpha){const n=parseInt(rgb.replace('#',''),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${clamp(alpha)})`;}
function size(){const dpr=Math.min(devicePixelRatio||1,2);const w=innerWidth,h=innerHeight;if(w===viewportWidth&&h===viewportHeight)return;viewportWidth=w;viewportHeight=h;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;ctx.setTransform(dpr,0,0,dpr,0,0);}
function init(){if(canvas)return;canvas=document.createElement('canvas');canvas.className='skill-cinematic-layer';canvas.setAttribute('aria-hidden','true');Object.assign(canvas.style,{position:'fixed',inset:'0',zIndex:'1002',pointerEvents:'none',width:'100%',height:'100%'});document.body.append(canvas);ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});size();addEventListener('resize',size,{passive:true});}
function line(points,color,width=1,alpha=1,blur=0){ctx.save();ctx.globalAlpha=alpha;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.shadowBlur=blur;ctx.shadowColor=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.restore();}
function ellipse(rx,ry,color,width,alpha=1,rotation=0,blur=0){ctx.save();ctx.rotate(rotation);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.beginPath();ctx.ellipse(0,0,Math.max(1,rx),Math.max(1,ry),0,0,Math.PI*2);ctx.stroke();ctx.restore();}
function polygon(sides,rx,ry,color,width,alpha=1,rotation=0){const points=[];for(let i=0;i<=sides;i++){const a=i*Math.PI*2/sides+rotation;points.push([Math.cos(a)*rx,Math.sin(a)*ry]);}line(points,color,width,alpha,9);}
function flare(x,y,r,color,alpha){if(alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(color,.92));g.addColorStop(.16,rgba(color,.72));g.addColorStop(.44,rgba(color,.24));g.addColorStop(1,rgba(color,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();}
function spark(x,y,length,angle,color,alpha){const dx=Math.cos(angle)*length,dy=Math.sin(angle)*length;line([[x-dx*.3,y-dy*.3],[x+dx,y+dy]],color,1.5,alpha,4);}
function particles(event,t,color,option='burst'){
 const count=event.hero?14:6,seed=event.seed;
 ctx.save();
 for(let i=0;i<count;i++){
  const a=i*2.39996+seed,noise=Math.sin(i*15.7+seed)*.5+.5;
  const radius=(20+i%6*7+noise*16)*easeOut(t),life=clamp((1-t)*(i%3===0?1.2:1));
  const upward=option==='rise';
  const x=Math.cos(a)*radius*(upward?.55:1),y=upward?24-t*(70+noise*60):Math.sin(a)*radius*.65;
  flare(x,y,2.5+(i%4),color,life*.75);
  if(i%2===0)spark(x,y,4+life*10,a,color,life*.8);
 }
 ctx.restore();
}
function shield(event,t){
 const variant=event.type,royal=variant==='royalShield',wall=variant==='shieldArray',basic=variant==='shieldStrike';
 const phase=easeOut(clamp(t/(royal?.55:.43))),hold=bell(t,.06,.93);const x=-(royal?135:100)*(1-phase)+9*Math.sin(t*Math.PI),y=-17*(1-phase);
 ctx.save();ctx.translate(x,y);ctx.rotate((1-phase)*-.18);ctx.scale(.68+.36*phase,.68+.36*phase);
 const path=()=>{ctx.beginPath();ctx.moveTo(0,-61);ctx.bezierCurveTo(22,-49,42,-49,43,-35);ctx.lineTo(40,18);ctx.quadraticCurveTo(28,43,0,59);ctx.quadraticCurveTo(-29,43,-40,18);ctx.lineTo(-43,-35);ctx.bezierCurveTo(-42,-48,-21,-51,0,-61);ctx.closePath();};
 if(wall){
  for(let i=-2;i<=2;i++){
   const px=i*32,top=-63+Math.abs(i)*11,bottom=61-Math.abs(i)*9;
   ctx.save();ctx.globalAlpha=hold*(1-Math.abs(i)*.12);ctx.beginPath();ctx.moveTo(px-17,top);ctx.lineTo(px+13,top-7);ctx.lineTo(px+21,bottom-10);ctx.lineTo(px-12,bottom);ctx.closePath();
   const plate=ctx.createLinearGradient(px-15,0,px+21,0);plate.addColorStop(0,'#3d5362aa');plate.addColorStop(.45,i===0?'#fff0ad':'#c0aa82');plate.addColorStop(1,'#526d7b88');ctx.fillStyle=plate;ctx.fill();ctx.strokeStyle='#ffe0a2';ctx.lineWidth=2;ctx.shadowColor='#f5d183';ctx.shadowBlur=11;ctx.stroke();ctx.restore();
  }
  line([[-88,-59],[86,-43]],'#fff2ce',3,hold*.7,11);line([[-71,58],[73,48]],'#dfb66d',2,hold*.58,8);
 }else if(royal){
  // Royal Judgment Shield is a directional burst of fractured sacred armor, not a UI badge.
  ctx.save();ctx.rotate(-.55);ctx.globalAlpha=hold*.74;
  const shards=[[-40,-38,-18,-60,5,-14],[19,-57,39,-21,8,2],[-63,8,-20,-16,-11,40],[17,5,57,-13,39,44],[-14,25,15,2,26,63]];
  for(let i=0;i<shards.length;i++){
   const p=shards[i],slide=(1-phase)*(i-2)*21;
   ctx.save();ctx.translate(slide,-slide*.28);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[2],p[3]);ctx.lineTo(p[4],p[5]);ctx.closePath();
   const gold=ctx.createLinearGradient(p[0],p[1],p[4],p[5]);gold.addColorStop(0,'#f3d79d');gold.addColorStop(.45,i%2?'#a5793b':'#6d6b5c');gold.addColorStop(1,'#c99a59');ctx.fillStyle=gold;ctx.fill();ctx.strokeStyle='#dfbd76';ctx.lineWidth=1.3;ctx.shadowColor='#dfad55';ctx.shadowBlur=6;ctx.stroke();ctx.restore();
  }
  line([[-92,-31],[88,31]],'#dca75b',7,hold*.4,14);
  line([[-93,-36],[89,26]],'#fff0ca',1.8,hold*.83,8);
  for(let i=0;i<4;i++){const xx=-40+i*24;line([[xx,-55],[xx+24,-33]],'#e3bc75',1,hold*.55,4);}
  ctx.restore();
 }else{
  ctx.save();ctx.globalAlpha=hold;ctx.shadowBlur=21;ctx.shadowColor='#ffd36d';path();const metal=ctx.createLinearGradient(-44,-60,48,60);metal.addColorStop(0,'#fff1bc');metal.addColorStop(.23,'#a27633');metal.addColorStop(.47,'#ffe2a0');metal.addColorStop(.72,'#7e582c');metal.addColorStop(1,'#f8cc71');ctx.fillStyle=metal;ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#ffedb4';ctx.lineWidth=4;ctx.stroke();ctx.restore();
  ctx.save();ctx.globalAlpha=hold*.92;ctx.scale(.74,.74);path();ctx.fillStyle=basic?'#6c402a':'#283d47';ctx.fill();ctx.strokeStyle='#fff4c6';ctx.lineWidth=2;ctx.stroke();ctx.restore();
  if(basic){line([[-28,-19],[21,21]],'#fff9df',5,hold,12);line([[-22,10],[20,10]],'#ffd78b',2,hold*.6);}
  else{line([[0,-32],[0,28]],'#fff4bd',7,hold,11);line([[-20,-5],[20,-5]],'#fff7d9',7,hold,11);}
 }
 ctx.restore();
 if(t>.31){const u=clamp((t-.31)/.66);ellipse(24+93*u,13+43*u,'#fff0a5',3,1-u,0,14);ellipse(18+69*u,10+33*u,'#d9a454',1.5,(1-u)*.85);flare(0,0,royal?78:54,'#fff2be',bell(t,.30,.75)*.55);particles(event,u,'#ffdc8c');}
}
function sanctuary(event,t){
 const royal=event.type==='royalSanctuary';
 const intro=easeOut(clamp(t/.28)),out=clamp((1-t)/.19),strength=intro*out;
 ctx.save();ctx.translate(0,19);ctx.rotate(-.07);
 const scale=.35+.67*intro;ctx.scale(scale,scale);
 ctx.globalAlpha=strength;
 ellipse(82,33,'#c6eeb3',2.8,.92,0,10);ellipse(67,25,'#fff6ca',1.5,.9);ellipse(43,17,'#d8f9ce',1.1,.75);
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8+t*.9,x=Math.cos(a)*73,y=Math.sin(a)*29;
  ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);line([[0,-5],[0,5]],'#fff9d9',i%4===0?3:1.3,i%4===0?1:.7,5);ctx.restore();
 }
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2+Math.PI/4,px=Math.cos(a)*58,py=Math.sin(a)*23;
  line([[px-5,py],[px,py-3],[px+5,py],[px,py+3],[px-5,py]],'#eaffd2',1.5,.85,4);
 }
 if(royal){
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3+t*.45,x=Math.cos(a)*52,y=Math.sin(a)*20;
   ctx.save();ctx.translate(x,y);ctx.rotate(a);line([[-7,-4],[0,-13],[7,-4]],'#ffdb93',2.4,strength,9);ctx.restore();
  }
  ctx.save();ctx.rotate(-t*.6);ellipse(97,40,'#ffca69',2.5,strength*.8);ctx.restore();
 }
 ctx.restore();
 const shaft=bell(t,.20,.85);
 if(shaft>0){const g=ctx.createLinearGradient(-34,-125,34,15);g.addColorStop(0,'rgba(246,255,208,0)');g.addColorStop(.35,'rgba(243,255,217,.26)');g.addColorStop(1,'rgba(227,255,178,.02)');ctx.save();ctx.globalAlpha=shaft;ctx.fillStyle=g;ctx.fillRect(-32,-127,64,136);ctx.restore();}
 flare(0,0,43,'#d9f5b1',shaft*.6);particles(event,t,'#d6ffbe','rise');
}
function judgment(event,t){
 const royal=event.type==='royalJudgment';
 const telegraph=clamp(t/.22)*clamp((.53-t)*7);
 ctx.save();ctx.translate(0,15);ellipse(56,23,'#ffe8a0',2.7,telegraph,0,11);ellipse(34,13,'#fff3c5',1,telegraph*.8);ctx.restore();
 const strike=bell(t,.24,.9);
 if(strike){
  const lower=-3,upper=-180*(1-easeOut(clamp((t-.18)/.22)))-125;
  const beam=ctx.createLinearGradient(-35,0,35,0);beam.addColorStop(0,'rgba(255,213,112,0)');beam.addColorStop(.25,'rgba(255,229,145,.54)');beam.addColorStop(.44,'#fff9e1');beam.addColorStop(.52,'#ffffff');beam.addColorStop(.68,'rgba(255,229,145,.58)');beam.addColorStop(1,'rgba(255,213,112,0)');
  ctx.save();ctx.globalAlpha=strike;ctx.fillStyle=beam;ctx.shadowColor='#ffd36c';ctx.shadowBlur=35;ctx.beginPath();ctx.moveTo(-27,upper);ctx.lineTo(27,upper);ctx.lineTo(42,lower);ctx.lineTo(-42,lower);ctx.closePath();ctx.fill();ctx.restore();
  line([[-6,upper-5],[-4,lower]],'#fff',3,strike,18);
  const crossY=upper+55;line([[-42,crossY],[42,crossY]],'#fff2ad',6,strike*.9,19);
  if(royal){
   line([[-55,upper+30],[-15,upper-5],[15,upper-5],[55,upper+30]],'#fff1b5',4,strike,18);
   line([[0,upper-15],[0,upper+112]],'#f6cc75',3,strike*.75,14);
   for(let i=-1;i<=1;i++)line([[i*57,upper+25],[i*65,0]],'#ffe8a0',2.2,strike*.6,14);
  }
 }
 if(t>.33){const u=clamp((t-.33)/.67);ctx.save();ctx.translate(0,17);ellipse(24+110*u,11+50*u,'#ffd16c',4,(1-u)*.95,0,16);ellipse(12+82*u,7+39*u,'#fff3bd',2,(1-u)*.95);ctx.restore();flare(0,0,72,'#fff5b9',bell(t,.32,.72)*.88);particles(event,u,'#ffe1a5');}
}
function blade(event,t){
 const color=event.color,wind=easeOut(clamp(t/.39)),fade=clamp((1-t)/.46),spin=event.type==='bladeStorm',dual=event.type==='dualBlade',dark=['shadowBlade','ambush','poisonBlade','execute'].includes(event.type);
 const count=spin?3:dual?2:event.variant===2?2:1,reverse=event.variant===1?-1:1;
 ctx.save();ctx.rotate(-.75*reverse+(spin?t*2.5:wind*.95)*reverse);
 for(let i=0;i<count;i++){
  ctx.save();ctx.rotate(i*(spin?Math.PI*2/3:.32));ctx.scale(1,spin?.85:1);
  const a=-2.4,b=-2.4+wind*(event.variant===0?2.85:3.3),rad=spin?55:event.variant===2?75:65;
  ctx.save();ctx.globalAlpha=fade*(i? .65:1);ctx.shadowColor=color;ctx.shadowBlur=dark?13:19;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,0,rad,a,b);ctx.lineWidth=dark?9:7;ctx.strokeStyle=dark?'#9271bc':color;ctx.stroke();ctx.lineWidth=2.4;ctx.strokeStyle='#fff5e2';ctx.stroke();ctx.restore();ctx.restore();
 }
 ctx.restore();
 const u=clamp((t-.28)/.72);if(t>.28){flare(0,0,35,color,(1-u)*.55);particles(event,u,color);}
}
function projectile(event,t){
 const color=event.color,arrow=event.type==='arrowRain',flight=easeOut(clamp(t/.58)),fade=clamp((1-t)/.44);
 const count=arrow?7:event.type==='falconArrow'?2:1;
 for(let i=0;i<count;i++){
  const offset=arrow?(i-3)*15:event.type==='falconArrow'?(i?12:-12):0,drop=arrow?-65-((i*31)%44):event.type==='falconArrow'?-13:0;
  const x=(event.dx*.7+offset)*(1-flight),y=(event.dy+drop)*(1-flight);
  line([[x-31,y-10],[x+12,y]],'#fff5dd',arrow?1.3:3,fade,8);
  line([[x-49,y-14],[x+10,y]],color,arrow?2:5,fade*.85,14);
  if(arrow&&t<.5)line([[x+3,y-4],[x+13,y],[x+3,y+4]],color,1,fade);
 }
 if(t>.44){const u=clamp((t-.44)/.56);ellipse(10+37*u,7+20*u,color,2.5,1-u,0,7);particles(event,u,color);}
}
function element(event,t){
 const color=event.color,type=event.type,charge=bell(t,.05,.85);
 if(type==='lightning'){
  if(t>.13){const a=clamp((t-.13)/.55),height=114*(1-easeOut(a));
   for(let branch=0;branch<2;branch++){
    const pts=[];for(let i=0;i<=7;i++){const y=-height-(7-i)*14,x=Math.sin(i*19+event.seed+branch*1.5)*((7-i)*3+4);pts.push([x,y]);}
    line(pts,branch?'#b7baf2':'#fffaff',branch?2.5:4,charge*(1-branch*.4),branch?10:18);
   }
  }
 }else if(type==='frostbolt'){
  ctx.save();ctx.rotate(t*1.9);for(let i=0;i<6;i++){const a=i*Math.PI/3,rad=15+28*easeOut(t);line([[0,0],[Math.cos(a)*rad,Math.sin(a)*rad]],'#e4ffff',2.5,charge,13);line([[Math.cos(a)*rad*.65,Math.sin(a)*rad*.65],[Math.cos(a+.42)*rad*.88,Math.sin(a+.42)*rad*.88]],color,1.8,charge);}ctx.restore();
 }else if(type==='firebolt'||type==='flameBurst'||type==='meteor'||type==='meteorRain'){
  const flames=type==='meteorRain'?6:4;
  for(let i=0;i<flames;i++){
   const a=i*Math.PI*2/flames+event.seed,rad=12+48*easeOut(t),x=Math.cos(a)*rad,y=Math.sin(a)*rad*.6-15*t;
   ctx.save();ctx.translate(x,y);ctx.rotate(a+.6);const grad=ctx.createLinearGradient(0,-29,0,26);grad.addColorStop(0,'#ffffff00');grad.addColorStop(.35,'#ffd683c9');grad.addColorStop(1,'#e8663288');ctx.globalAlpha=charge;ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(0,-24-t*23);ctx.quadraticCurveTo(21,-2,10,19);ctx.quadraticCurveTo(-15,29,-11,9);ctx.closePath();ctx.fill();ctx.restore();
  }
 }else{
  ctx.save();ctx.rotate(t*2.1);for(let i=0;i<3;i++){ctx.rotate(Math.PI*2/3);ellipse(37+t*26,15+t*9,color,2,charge,0,10);}ctx.restore();
 }
 flare(0,0,45+(type==='void'?23:0),color,charge*.57);if(t>.24)particles(event,clamp((t-.24)/.76),color);
}
function fist(event,t){
 const color=event.color,impact=bell(t,.16,.77),u=easeOut(clamp(t/.48));
 const px=event.dx*(1-u)*.7,py=event.dy*(1-u)*.7;
 flare(px,py,28,color,impact*.67);
 const rays=event.variant===0?5:7;
 for(let i=0;i<rays;i++){
  const a=i*Math.PI*2/rays+.25,rad=15+(event.variant===2?81:65)*u;
  line([[Math.cos(a)*rad*.28,Math.sin(a)*rad*.28],[Math.cos(a)*rad,Math.sin(a)*rad]],color,3.2,impact,10);
 }
 if(t>.29){const q=clamp((t-.29)/.71);ellipse(20+73*q,9+37*q,'#fff4d9',3.2,(1-q)*.85,0,12);particles(event,q,color);}
}
function sound(event,t){
 const color=event.type==='finale'?'#ffdfb4':'#ecb9f8',fade=clamp((1-t)/.36);
 for(let i=0;i<(event.type==='finale'?5:3+event.variant);i++){
  const p=clamp((t-i*.12)/.76);if(!p)continue;
  ellipse(11+105*easeOut(p),8+37*easeOut(p),color,2.5,fade*(1-p),-.12,10);
 }
 for(let i=0;i<5;i++){const x=(i-2)*16,y=Math.sin(t*12-i*.75)*16*fade;flare(x,y,6,color,fade*.75);}
}
function aura(event,t){
 const color=event.type==='heal'?'#a3e8bf':event.type==='mana'?'#9acfff':event.type==='buff'?'#e5c98f':event.color,fade=bell(t,.05,.91),variant=event.variant;
 if(event.type==='shield'){
  for(let i=0;i<3;i++){const p=clamp((t-i*.12)/.75);if(!p)continue;polygon(variant===0?6:variant===1?8:5,24+48*p,29+43*p,color,2.3,fade*(1-p),t*.8);}
  for(let i=0;i<6+variant;i++){const a=i*Math.PI*2/(6+variant);spark(Math.cos(a)*54,Math.sin(a)*54,12,a,color,fade*.7);}
 }else if(event.type==='heal'){
  const count=variant===2?3:2;
  for(let i=0;i<count;i++){const p=clamp((t-i*.17)/.75);if(!p)continue;ellipse(18+48*p,10+29*p,color,2.2,fade*(1-p),0,9);}
  line([[0,-24],[0,22]],'#c3ffe3',5,fade,15);line([[-17,0],[17,0]],'#ecfff3',5,fade,15);
  for(let i=0;i<variant+2;i++)flare((i-variant*.5)*17,-t*(43+i*13),6,color,fade*.6);
 }else if(event.type==='mana'){
  for(let i=0;i<3+variant;i++){const a=i*Math.PI*2/(3+variant)+t*3,rx=Math.cos(a)*(28+30*t),ry=Math.sin(a)*(18+27*t);flare(rx,ry,8,color,fade*.7);spark(rx,ry,14,a+Math.PI/2,color,fade);}
  ellipse(34+19*t,22+15*t,'#cadfff',2,fade,t,8);
 }else if(event.type==='resonance'){
  ellipse(32+47*t,12+33*t,color,3,fade,1+t*.6,14);ellipse(32+47*t,12+33*t,'#c7edff',2,fade,-1-t*.6,10);
  polygon(6+variant*2,44+27*t,38+27*t,color,2,fade*.8,t);
 }else{
  for(let i=0;i<2+variant;i++){const p=clamp((t-i*.13)/.75);if(!p)continue;polygon(variant===0?8:variant===1?6:12,27+48*p,18+40*p,color,1.8,fade*(1-p),t*(variant?1.4:-1));}
  for(let i=0;i<5+variant;i++){const a=i*Math.PI*2/(5+variant)+t*2;flare(Math.cos(a)*42,Math.sin(a)*34,5,color,fade*.6);}
 }
 if(event.type==='heal'||event.type==='mana')particles(event,t,color,'rise');else particles(event,t,color);
}
// Third-job skills receive bespoke choreography on top of their weapon/element motion.
// Three stages (main / wide / finish) are deliberately different in each class.
function legendary(event,t){
 const job=event.thirdJob,stage=event.thirdStage;if(!job)return;
 const color=jobColors[job]||event.color,charge=bell(t,.04,.93),impact=easeOut(clamp((t-.17)/.58)),fall=clamp((1-t)/.31);
 ctx.save();ctx.globalAlpha=charge;
 if(job==='knight'){
  if(stage==='Main'){
   for(let i=0;i<7;i++){const a=i*.61-t*3,x=Math.cos(a)*64,y=Math.sin(a)*30;line([[x-16,y-17],[x,y],[x+18,y-15]],color,3,charge*.8,8);}
   line([[-120+135*impact,-26],[31,-9],[107,13]],'#eff9ff',5,charge,20);
  }else if(stage==='Wide'){
   for(let i=-2;i<=2;i++){const x=i*39;line([[x-17,-90+88*impact],[x,44]],color,3,charge,11);line([[x-29,40],[x,68],[x+25,44]],'#bde8ff',2,charge*.8,8);}
   ellipse(25+110*impact,13+52*impact,'#99ecff',4,fall);
  }else{
   ctx.save();ctx.rotate(-.22);line([[-160,-14],[118,-14]],'#e9faff',10,charge,29);line([[112,-25],[148,-14],[112,-3]],color,6,charge,20);ctx.restore();
   for(let i=0;i<4;i++)ellipse(28+i*32*impact,12+i*12*impact,'#e9faff',1.7,fall);
  }
 }else if(job==='wizard'){
  if(stage==='Main'){
   flare(0,-85+82*impact,72,'#ffc27f',charge);for(let i=0;i<9;i++){const a=i*Math.PI*2/9+t*2;line([[Math.cos(a)*32,Math.sin(a)*32-70+82*impact],[Math.cos(a)*78,Math.sin(a)*55-70+82*impact]],'#ffddad',2.6,charge,12);}
  }else if(stage==='Wide'){
   for(let i=0;i<6;i++){const x=(i-2.5)*38,y=-115+((i*43)%70)+128*impact;flare(x,y,19+i%3*7,'#ff9e62',charge*.8);line([[x-40,y-50],[x,y]],'#ffe8b8',4,charge,15);}
  }else{
   ctx.save();ctx.rotate(t*2);for(let i=0;i<3;i++){ctx.rotate(Math.PI*2/3);ellipse(71-34*impact,22-10*impact,'#e2afff',4,charge,0,17);}ctx.restore();
   ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=charge*.96;const dark=ctx.createRadialGradient(0,0,3,0,0,61-27*impact);dark.addColorStop(0,'#03030b');dark.addColorStop(.54,'#130b2a');dark.addColorStop(.8,'#5f3f92a8');dark.addColorStop(1,'#ad8cff00');ctx.fillStyle=dark;ctx.beginPath();ctx.arc(0,0,61-27*impact,0,Math.PI*2);ctx.fill();ctx.restore();ellipse(44-23*impact,44-23*impact,'#f1dcff',3,charge);
  }
 }else if(job==='sage'){
  const colors=['#ffb17c','#a4d9ff','#d1b2ff','#a8f8c2'];
  for(let i=0;i<4;i++){const a=i*Math.PI/2+t*(stage==='Wide'?2.8:.9),radius=stage==='Finish'?76-68*impact:stage==='Wide'?75:50;flare(Math.cos(a)*radius,Math.sin(a)*radius*.65,stage==='Finish'?25:17,colors[i],charge*.9);}
  if(stage==='Main'){line([[-100+100*impact,-18],[18,-12],[61,11]],'#f5fff0',8,charge,22);}
  else if(stage==='Wide'){for(let i=0;i<4;i++){const a=i*Math.PI/2+t*3;ellipse(44,21,colors[i],2.5,charge,a,10);}}
  else{for(let i=0;i<4;i++){const a=i*Math.PI/2;line([[Math.cos(a)*115,Math.sin(a)*115],[0,0]],colors[i],7,charge,20);}flare(0,0,83,'#f4ffff',charge*.75);}
 }else if(job==='assassin'){
  if(stage==='Main'){
   line([[-95+104*impact,-73],[22,32],[70,69]],'#fce4ef',7,charge,18);line([[70,-71],[6,23],[-72,67]],'#ffc5dd',7,charge,18);
  }else if(stage==='Wide'){
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*4;ctx.save();ctx.rotate(a);line([[33,0],[112,0]],'#f8c2d8',5,charge,18);ctx.restore();}
   ellipse(80,80,'#f1a7bf',3,fall,t*2);
  }else{
   ctx.save();ctx.rotate(-.6);line([[-122,-45],[122,45]],'#ffeaf1',10,charge,24);line([[-120,49],[120,-51]],'#fd91bd',8,charge,22);ctx.restore();
   flare(0,0,72,'#fb7baf',charge*.7);
  }
 }else if(job==='rogue'){
  if(stage==='Main'){
   for(let i=0;i<3;i++){const x=-90+74*i+90*impact;line([[x-40,-26],[x+28,21]],'#bcb0fc',6,charge*(1-i*.22),16);}
  }else if(stage==='Wide'){
   for(let i=-2;i<=2;i++){ctx.save();ctx.translate(i*43,0);ctx.rotate(-.7+i*.16);line([[0,-67],[0,71]],'#cab5fc',5,charge*(1-Math.abs(i)*.12),16);ctx.restore();}
  }else{
   ellipse(92,37,'#9378de',4,charge,t*1.5,16);line([[-145,23],[146,-23]],'#f3ddff',7,charge,23);line([[-140,29],[146,-17]],'#633fa3',3,charge*.7,11);
  }
 }else if(job==='priest'){
  if(stage==='Main'){
   for(let i=0;i<8;i++){const a=i*Math.PI/4;line([[Math.cos(a)*23,Math.sin(a)*23],[Math.cos(a)*98,Math.sin(a)*98]],'#fff5ce',3,charge,19);}
   flare(0,0,69,'#fff9e2',charge*.77);
  }else if(stage==='Wide'){
   for(let i=-1;i<=1;i++){const x=i*57;line([[x,-154+138*impact],[x,40]],'#fff2d4',16,charge*.6,24);ellipse(25,9,'#fff4cd',2,charge);}
  }else{
   for(let i=-2;i<=2;i++){const x=i*34;line([[x,-120],[x,67]],'#fff7de',i===0?8:3,charge*(1-Math.abs(i)*.14),23);}
   ctx.save();ctx.rotate(-t*.4);polygon(8,92,92,'#ffe5aa',4,charge);ctx.restore();
  }
 }else if(job==='monk'){
  if(stage==='Main'){
   for(let i=0;i<2;i++){const a=t*5+i*Math.PI;line([[Math.cos(a)*73,Math.sin(a)*48],[Math.cos(a+.8)*42,Math.sin(a+.8)*28],[0,0]],i?'#d9f5e2':'#ffc580',6,charge,18);}
  }else if(stage==='Wide'){
   for(let i=0;i<9;i++){const a=i*Math.PI*2/9;line([[Math.cos(a)*15,Math.sin(a)*10],[Math.cos(a)*(45+95*impact),Math.sin(a)*(20+65*impact)]],color,4,charge*fall,13);}
   ellipse(32+120*impact,16+65*impact,color,5,fall);
  }else{
   const x=-135+135*impact;flare(x,0,72,'#ffecc4',charge*.9);for(let i=0;i<6;i++){const a=i*Math.PI/3;line([[x,0],[x+Math.cos(a)*85,Math.sin(a)*73]],color,4,charge,15);}
  }
 }else if(job==='hunter'){
  if(stage==='Main'){
   line([[-125+112*impact,0],[37,-12],[130,0]],'#e9ffef',6,charge,16);
   for(let i=-1;i<=1;i++){const y=i*17;line([[-75+60*impact,y],[0,y-14],[45,y+4]],'#a3f3d9',2.7,charge,12);}
  }else if(stage==='Wide'){
   for(let i=0;i<10;i++){const x=(i-4.5)*28,y=-165+(i%4)*29+154*impact;line([[x-23,y-32],[x+13,y+22]],'#dafff1',3.5,charge,13);}
  }else{
   for(let i=0;i<4;i++)ellipse(32+i*21,32+i*21,'#a3fff0',2.6,charge,0,10);
   line([[-145,-6],[138,-6]],'#ffffff',10,charge,30);line([[117,-19],[149,-6],[117,7]],'#b5f3d9',4,charge,16);
  }
 }else if(job==='performer'){
  if(stage==='Main'){
   for(let i=-2;i<=2;i++){const x=i*17;line([[x,-84],[x+23,68]],i%2?'#ffcfeb':'#c9d9ff',2.3,charge,10);}
   flare(0,0,45,'#ffc3ee',charge*.6);
  }else if(stage==='Wide'){
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*1.6;ctx.save();ctx.translate(Math.cos(a)*70,Math.sin(a)*43);ctx.rotate(a);ellipse(32,16,i%2?'#ffd3f7':'#a9e3ff',3,charge);ctx.restore();}
  }else{
   for(let i=-3;i<=3;i++){const x=i*31,y=-125+125*impact;line([[x,-140],[x+8,y]],i%2?'#ffd3e8':'#d9f4ff',5,charge,19);}
   ellipse(27+110*impact,12+48*impact,'#ffe8ff',4,fall);
  }
 }
 ctx.restore();
}
function castOrigin(event,t){
 if(!event.primary||!event.hero||!Number.isFinite(event.sourceX)||!Number.isFinite(event.sourceY))return;
 const charge=bell(t,0,.47),launch=bell(t,.16,.55),color=event.color;
 ctx.save();ctx.translate(event.sourceX,event.sourceY);ctx.globalCompositeOperation='screen';
 ellipse(24+15*t,9+7*t,color,2.4,charge,0,9);ellipse(14+18*t,5+10*t,'#fff8d9',1.2,charge*.85);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4+t*1.8,x=Math.cos(a)*32,y=Math.sin(a)*14;
  spark(x,y,7,a,color,charge*.75);
 }
 flare(0,0,42,color,charge*.65);ctx.restore();
 if(launch>0){
  const fromX=event.sourceX,toX=event.x,fromY=event.sourceY,toY=event.y;
  const travel=easeOut(clamp((t-.16)/.36)),mx=fromX+(toX-fromX)*travel,my=fromY+(toY-fromY)*travel;
  const start=.3+.48*travel;
  line([[fromX+(toX-fromX)*start,fromY+(toY-fromY)*start],[mx,my]],color,3,launch*.52,14);
  flare(mx,my,20,color,launch*.5);
 }
}
function generic(event,t){
 const color=event.color,alpha=bell(t,.07,.94);
 if(t<.35){const x=event.dx*(1-easeOut(t/.35)),y=event.dy*(1-easeOut(t/.35));spark(x,y,22,Math.atan2(-event.dy,-event.dx),color,alpha*.85);}
 if(t>.18){const u=clamp((t-.18)/.8);flare(0,0,22+(event.finisher?36:12)*Math.sin(u*Math.PI),color,(1-u)*.55);particles(event,u,color);}
}
function groupStage(event,t){
 if(!event.multi||!event.primary||!event.hero)return;
 const color=event.color,build=bell(t,.06,.91),shock=easeOut(clamp((t-.27)/.65)),fade=clamp((1-t)/.3);
 const span=Math.max(125,event.groupSpan||125),radius=Math.min(245,span*.53+42);
 ctx.save();ctx.translate(event.groupX,event.groupY);ctx.globalCompositeOperation='screen';
 const mobile=Math.min(1,innerWidth/700);ctx.scale(mobile*VFX_SCALE,mobile*VFX_SCALE);
 const wide=event.thirdStage==='Wide'||event.type==='royalSanctuary',finish=event.thirdStage==='Finish'||event.finisher;
 if(wide){
  // One unified attack field that spans the entire target cluster.
  ellipse(radius+40*shock,41+38*shock,color,3.5,build*(1-shock*.75),0,15);
  ellipse(radius*.7+65*shock,28+24*shock,'#fff7d9',1.7,build*(1-shock*.75),0,8);
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3+t*.7,x=Math.cos(a)*(radius+18),y=Math.sin(a)*47;
   line([[x-6,y-9],[x,y],[x+6,y-9]],color,1.5,build*.58,5);
  }
  flare(0,0,Math.min(230,radius+70),color,build*.27);
 }else if(finish){
  const stretch=Math.min(235,radius*1.35);
  ellipse(stretch+68*shock,76+66*shock,color,4.2,fade*.85,0,14);
  ellipse(stretch*.72+57*shock,47+42*shock,'#fff7e3',2.4,fade*.9);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;line([[Math.cos(a)*42,Math.sin(a)*35],[Math.cos(a)*(stretch+65*shock),Math.sin(a)*(85+58*shock)]],color,3,build*fade,12);}
  flare(0,0,Math.min(230,stretch),color,build*.3);
 }else{
  const reach=radius+50*shock;
  line([[-reach,-44],[reach,46]],color,9,build*fade,27);
  line([[-reach,-49],[reach,41]],'#fff5d4',2.5,build*fade,17);
  ellipse(reach,39,'#fff0ca',3,build*fade);
 }
 ctx.restore();
}
// Screen-sized readable silhouettes: each third-job has an unmistakable object
// and attack direction. The old rings remain only as secondary impact detail.
function royalSanctuaryField(event,t,scale){
 // A separate richly worked floor seal connects every hit target. The painted
 // cathedral stays at its original aspect ratio and floats over this floor.
 const span=Math.max(0,event.multi?event.groupSpan||0:0);
 const rx=Math.min(340,Math.max(170,span/(2*scale)+60));
 const ry=63,build=easeOut(clamp((t-.19)/.33));
 const fade=clamp((1-t)/.22);
 ctx.save();ctx.translate(0,49);ctx.scale(.68+.32*build,.68+.32*build);
 ctx.globalAlpha=Math.min(1,build*1.25)*Math.min(1,fade*3)*.9;
 ctx.globalCompositeOperation='screen';
 const glass=ctx.createRadialGradient(0,0,8,0,0,rx);
 glass.addColorStop(0,'rgba(37,110,194,.43)');
 glass.addColorStop(.49,'rgba(24,58,131,.36)');
 glass.addColorStop(.86,'rgba(65,44,124,.31)');
 glass.addColorStop(1,'rgba(33,25,68,0)');
 ctx.fillStyle=glass;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();
 const colors=['#91dfff','#d39aff','#fff0b7','#83d4ca','#ec98c7','#c2b7ff'];
 for(let i=0;i<24;i++){
  const a=i*Math.PI/12,mid=a+Math.PI/24;
  const x0=Math.cos(a)*rx*.66,y0=Math.sin(a)*ry*.66;
  const x1=Math.cos(mid)*rx*.91,y1=Math.sin(mid)*ry*.91;
  const x2=Math.cos(a+Math.PI/12)*rx*.66,y2=Math.sin(a+Math.PI/12)*ry*.66;
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(x1,y1,x2,y2);
  ctx.quadraticCurveTo(Math.cos(mid)*rx*.53,Math.sin(mid)*ry*.53,x0,y0);
  ctx.fillStyle=colors[i%colors.length];ctx.globalAlpha=.12+.17*bell(t,.2,.83);
  ctx.fill();ctx.globalAlpha=.76;
  ctx.lineWidth=1.35;ctx.strokeStyle='#ebce91';ctx.stroke();
 }
 for(const [radius,width,opacity] of [[1,3,.9],[.95,1.5,.75],[.69,2,.7],[.59,1,.7]]){
  ctx.beginPath();ctx.ellipse(0,0,rx*radius,ry*radius,0,0,Math.PI*2);
  ctx.strokeStyle=opacity>.8?'#fff0c3':'#d9ae76';ctx.lineWidth=width;ctx.globalAlpha=opacity;ctx.shadowColor='#f5dca1';ctx.shadowBlur=width*4;ctx.stroke();
 }
 ctx.shadowBlur=0;ctx.globalAlpha=.84;
 for(let i=0;i<12;i++){
  const a=i*Math.PI/6+t*.045,x=Math.cos(a)*rx*.84,y=Math.sin(a)*ry*.84;
  ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
  ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(5,0);ctx.lineTo(0,8);ctx.lineTo(-5,0);ctx.closePath();
  ctx.fillStyle=i%3?'#d2efff':'#fff0b0';ctx.fill();ctx.strokeStyle='#eac07d';ctx.lineWidth=1;ctx.stroke();
  ctx.restore();
 }
 ctx.restore();
}
function royalSanctuaryDescent(event,t,scale){
 const fall=easeOut(clamp((t-.55)/.22)),light=bell(t,.55,.95);
 if(light<=0)return;
 const reach=Math.min(340,Math.max(180,(event.groupSpan||0)/(2*scale)+58));
 const bottom=-235+280*fall;
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=-3;i<=3;i++){
  const px=i*reach/3,edge=18+(3-Math.abs(i))*7;
  const ray=ctx.createLinearGradient(0,-360,0,bottom+50);
  ray.addColorStop(0,'rgba(255,248,211,0)');
  ray.addColorStop(.58,'rgba(255,231,148,.26)');
  ray.addColorStop(1,'rgba(255,252,224,.72)');
  ctx.fillStyle=ray;ctx.globalAlpha=light*(i===0?.9:.65);
  ctx.beginPath();ctx.moveTo(px-edge*.45,-380);ctx.lineTo(px+edge*.45,-380);
  ctx.lineTo(px+edge,bottom);ctx.lineTo(px-edge,bottom);ctx.closePath();ctx.fill();
 }
 ctx.globalAlpha=1;
 flare(0,35,Math.min(220,reach+48),'#fff2c7',light*fall*.35);
 ellipse(reach,58,'#fff9d5',4,light*fall*.8,0,18);
 ctx.restore();
}
function spectacle(event,t){
 if(!event.thirdJob||(!event.primary&&!(event.thirdJob==='crusader'&&event.thirdStage==='Main')))return;
 const job=event.thirdJob,wide=event.multi,finish=event.thirdStage==='Finish';
 const royalArea=job==='crusader'&&event.thirdStage==='Wide';
 const royalShieldHit=job==='crusader'&&event.thirdStage==='Main';
 const x=royalArea?event.groupX:wide&&!royalShieldHit?event.groupX:event.x;
 const y=royalArea?event.groupY:wide&&!royalShieldHit?event.groupY:event.y;
 const strength=bell(t,.08,.94),arrival=easeOut(clamp((t-.1)/.38)),strike=bell(t,.26,.71);
 const breadth=Math.min(420,Math.max(240,(event.groupSpan||0)+135));
 const size=(royalShieldHit?1.02:wide?Math.min(1.18,breadth/320):finish?1.22:1.02)*VFX_SCALE;
 ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.globalCompositeOperation='screen';
 // Painted assets replace the former schematic shield/cathedral silhouettes.
 // Shield: one illustration per actual hit target. Sanctuary: one group-sized
 // cathedral seal, centered over the full set of hit targets.
 if(job==='crusader'&&!finish){
  const sprite=royalArea?royalSanctuaryPaint:royalShieldPaint;
  if(sprite?.complete&&sprite.naturalWidth){
   if(royalArea){
    // A marked first target calls forth the field; the light descends last.
    if(t<.36){
     ctx.save();ctx.translate((event.x-x)/size,(event.y-y)/size+25);
     ellipse(36+35*easeOut(t/.35),16+12*easeOut(t/.35),'#fff3ba',3,bell(t,.02,.36),0,12);
     flare(0,0,54,'#fff0b7',bell(t,.04,.31)*.32);ctx.restore();
    }
    royalSanctuaryField(event,t,size);
    royalSanctuaryDescent(event,t,size);
   }
   const prep=easeOut(clamp((t-.055)/.29));
   const impact=bell(t,.24,.77);
   const fading=clamp((1-t)/.22);
   ctx.save();
   ctx.globalCompositeOperation='source-over';
   ctx.globalAlpha=(.15+.85*prep)*Math.min(1,fading*3)*(royalArea?bell(t,.18,.93):1);
   if(royalArea){
    const rise=1-easeOut(clamp((t-.25)/.38));
    ctx.translate(0,19+35*rise);
    ctx.scale(.78+.19*prep,.78+.19*prep);
    // Preserve the painted image's native aspect ratio; expanding only the
    // width distorted its stained glass and made the details appear blurry.
    const areaHeight=event.multi?490:320;
    const areaWidth=areaHeight*sprite.naturalWidth/sprite.naturalHeight;
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(sprite,-areaWidth/2,-areaHeight*.64,areaWidth,areaHeight);
   }else{
    const rush=1-easeOut(clamp((t-.08)/.38));
    ctx.translate(-130*rush,-20-11*Math.sin(Math.PI*t));
    ctx.rotate(-.16*rush);
    ctx.scale(.77+.23*prep,.77+.23*prep);
    if(event.multi)ctx.drawImage(sprite,-106,-151,212,264);
    else ctx.drawImage(sprite,-139,-178,278,340);
   }
   ctx.restore();
   if(impact>.01){flare(0,21,62,'#ffeec0',impact*.19);ellipse(32+90*prep,15+25*prep,'#ffe9a8',3,impact*.53);}
   ctx.restore();return;
  }
 }
 const color=jobColors[job]||event.color;
 const beam=(a,b,c,d,w,shade=color)=>line([[a,b],[c,d]],shade,w,strength,Math.min(38,w*2));
 const shock=(rx,ry)=>{ctx.save();ctx.translate(0,31);ellipse(rx+70*arrival,ry+27*arrival,color,6,(1-arrival)*strength,0,23);ctx.restore();};
 const shard=(x,y,r,angle,shade)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.45,0);ctx.lineTo(0,r*.55);ctx.lineTo(-r*.34,0);ctx.closePath();ctx.fillStyle=shade;ctx.shadowColor=shade;ctx.shadowBlur=17;ctx.globalAlpha=strength;ctx.fill();ctx.restore();};
 if(job==='crusader'){
  if(finish){
   // The painted winged blade keeps its full height but is 20% slimmer.
   const dive=easeOut(clamp((t-.08)/.39)),fallY=-235+255*dive;
   if(royalPaintedSprite||royalArt?.complete&&royalArt.naturalWidth){
    ctx.save();ctx.translate(0,fallY);ctx.globalAlpha=strength*.92;
    ctx.globalCompositeOperation=royalPaintedSprite?'screen':'source-over';
    ctx.filter='contrast(1.17) saturate(1.13)';
    ctx.shadowColor='#e4b75e';ctx.shadowBlur=4+5*strike;
    ctx.drawImage(royalPaintedSprite||royalArt,-164,-210,328,400);
    ctx.restore();
   }else{
    ctx.save();ctx.translate(0,fallY);ctx.fillStyle='#fff2bb';ctx.fillRect(-18,-360,36,420);ctx.fillRect(-75,-280,150,18);ctx.restore();
   }
   if(t>.35){flare(0,26,92,'#fff0b3',strike*.2);for(let i=0;i<4;i++){const a=i*Math.PI/2+.2;beam(0,27,Math.cos(a)*150*arrival,27+Math.sin(a)*74*arrival,1.4,'#ffe9af');}}
   shock(120,44);
  }else if(wide){
   // Sovereign sanctuary: staggered cathedral pillars, stained-glass
   // petals and an illuminated seal rooted in the ground.
   const build=easeOut(clamp((t-.08)/.34)),release=bell(t,.22,.83);
   ctx.save();ctx.translate(0,16);ctx.scale(.76+.24*build,.76+.24*build);
   ellipse(140,51,'#d1a459',3,strength*.9);
   ellipse(121,43,'#fff0bc',1.7,strength*.95);
   ellipse(92,30,'#6fdfc9',2,strength*.72);
   for(let i=0;i<8;i++){
    const a=i*Math.PI/4-t*.26,px=Math.cos(a)*108,py=Math.sin(a)*37;
    ctx.save();ctx.translate(px,py);ctx.rotate(a+Math.PI/2);
    ctx.beginPath();ctx.moveTo(0,-19);ctx.quadraticCurveTo(16,-4,0,20);ctx.quadraticCurveTo(-16,-4,0,-19);
    const glass=ctx.createLinearGradient(-12,-16,14,20);glass.addColorStop(0,'#f9e5a0');glass.addColorStop(.55,i%2?'#7ac7ba':'#c29f61');glass.addColorStop(1,'#fff5d1');
    ctx.fillStyle=glass;ctx.globalAlpha=strength*.55;ctx.fill();ctx.strokeStyle='#fff2c5';ctx.lineWidth=1.7;ctx.stroke();ctx.restore();
   }
   for(let i=-2;i<=2;i++){
    const x=i*58,delay=Math.abs(i)*.065,p=easeOut(clamp((t-.11-delay)/.32));
    ctx.save();ctx.translate(x,-84*p);ctx.globalAlpha=strength*(.66-Math.abs(i)*.08);
    const stone=ctx.createLinearGradient(-15,0,16,0);stone.addColorStop(0,'#745c3b');stone.addColorStop(.4,'#f6dd9b');stone.addColorStop(1,'#6d7881');
    ctx.fillStyle=stone;ctx.fillRect(-12,-52*p,24,87*p);
    ctx.strokeStyle='#ffe6a2';ctx.lineWidth=2;ctx.strokeRect(-12,-52*p,24,87*p);
    ctx.beginPath();ctx.moveTo(-22,-51*p);ctx.lineTo(0,-74*p);ctx.lineTo(22,-51*p);ctx.closePath();ctx.fillStyle='#dfc68b';ctx.fill();ctx.stroke();
    for(let k=0;k<3;k++)line([[-7,-30*p+k*22],[7,-30*p+k*22]],'#fff4cf',1.1,strength*.8,4);
    ctx.restore();
   }
   ctx.restore();
   for(let i=0;i<6;i++){const a=i*Math.PI/3+t*.3;shard(Math.cos(a)*125,Math.sin(a)*49+16,10,a,'#fff1be');}
   flare(0,-44,42,'#fff5d9',release*.4);shock(132,48);
  }else{
   // Royal guard strike: a forged heraldic shield travels into the target,
   // then breaks into independently animated plated feathers.
   const thrust=easeOut(clamp((t-.08)/.35)),ox=-155*(1-thrust);
   ctx.save();ctx.translate(ox,-16-16*Math.sin(t*Math.PI));ctx.rotate(-.27*(1-thrust));ctx.scale(.85+.2*thrust,.85+.2*thrust);
   for(let side of [-1,1]){
    ctx.save();ctx.scale(side,1);
    for(let i=0;i<5;i++){
     const yy=-57+i*21,spread=(1-thrust)*35;
     ctx.beginPath();ctx.moveTo(16+spread,yy-11);ctx.quadraticCurveTo(66+spread,yy-28,98+spread,yy-3);ctx.quadraticCurveTo(69+spread,yy+8,28+spread,yy+12);ctx.closePath();
     const feather=ctx.createLinearGradient(18,yy-15,103,yy+15);feather.addColorStop(0,'#f9e6b2');feather.addColorStop(.55,i%2?'#947a50':'#c5b19b');feather.addColorStop(1,'#fff3cf');
     ctx.fillStyle=feather;ctx.globalAlpha=strength*(.82-i*.065);ctx.fill();ctx.strokeStyle='#ffe9aa';ctx.lineWidth=1.5;ctx.stroke();
     line([[28+spread,yy],[84+spread,yy-4]],'#fff3d7',1,strength*.63,3);
    }
    ctx.restore();
   }
   ctx.beginPath();ctx.moveTo(0,-82);ctx.bezierCurveTo(53,-66,56,-25,48,24);ctx.quadraticCurveTo(31,68,0,88);ctx.quadraticCurveTo(-31,68,-48,24);ctx.bezierCurveTo(-56,-25,-53,-66,0,-82);ctx.closePath();
   const metal=ctx.createLinearGradient(-52,-82,53,87);metal.addColorStop(0,'#fff7d5');metal.addColorStop(.25,'#c99e56');metal.addColorStop(.51,'#505e69');metal.addColorStop(.73,'#ab803b');metal.addColorStop(1,'#fce4a6');
   ctx.globalAlpha=strength;ctx.fillStyle=metal;ctx.shadowColor='#eac06e';ctx.shadowBlur=18;ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#f8d68d';ctx.stroke();
   ctx.beginPath();ctx.moveTo(0,-65);ctx.lineTo(32,-39);ctx.lineTo(29,25);ctx.lineTo(0,66);ctx.lineTo(-29,25);ctx.lineTo(-32,-39);ctx.closePath();ctx.lineWidth=2;ctx.strokeStyle='#fff0bd';ctx.stroke();
   line([[0,-44],[0,47]],'#fff5cc',8,strength,15);line([[-23,-7],[23,-7]],'#fff5cc',7,strength,15);
   ctx.restore();
   if(t>.3){for(let i=0;i<9;i++){const a=i*Math.PI*2/9;shard(Math.cos(a)*76*arrival,Math.sin(a)*55*arrival,7+i%3*3,a,'#f8d792');}}
   flare(0,10,50,'#fff3d2',strike*.4);shock(91,35);
  }
 }else if(job==='wizard'){
  // Meteor shower with dark blazing cores and diagonal comet tails.
  for(let i=0;i<(wide?7:4);i++){
   const offset=(i-(wide?3:1.5))*61,delay=i*.055,u=easeOut(clamp((t-delay)/.65));
   const mx=offset+115*(1-u),my=-240+270*u-(i%3)*26;
   beam(mx+115,my-127,mx,my,13,'#ffa262');
   flare(mx,my,38+(i%3)*9,'#ff7049',strength*.8);
   shard(mx,my,29,u*2,'#fff4b7');
  }
  shock(126,42);
 }else if(job==='knight'){
  // A sweeping, enormous lance through the battle line.
  const headX=-260+490*arrival;ctx.save();ctx.translate(headX,-37);ctx.rotate(-.14);
  beam(-410,0,-10,0,31,'#7dcaff');beam(-400,-7,-9,-7,7,'#ffffff');
  shard(19,0,77,Math.PI/2,'#e9f8ff');ctx.restore();
  for(let i=0;i<4;i++)beam(-130-i*25,42-i*23,105+i*33,18-i*27,4,'#cff1ff');
 }else if(job==='sage'){
  const colors=['#ff855b','#8ad9ff','#b9a0ff','#86f9ba'];
  for(let i=0;i<4;i++){
   const side=i%2?-1:1,px=side*(90+i*35)*(1-arrival),py=-155+(i%2)*100+150*arrival;
   ctx.save();ctx.translate(px,py);ctx.rotate(i*Math.PI/2+t*2);
   shard(0,0,80-i*8,0,colors[i]);beam(-85,0,85,0,8,colors[i]);ctx.restore();
  }
  flare(0,0,120,'#fffde0',strike*.7);shock(155,56);
 }else if(job==='assassin'){
  // Sharp X-shaped execution trails crossing the full enemy silhouette.
  const p=arrival*240;
  beam(-265+p,-180,80+p,110,26,'#ff7fba');
  beam(265-p,-180,-80-p,110,23,'#f8e6ff');
  beam(-245+p,-175,77+p,108,5,'#ffffff');
  beam(245-p,-175,-77-p,108,5,'#ffffff');
  for(let i=0;i<7;i++)shard((i-3)*47,-110+i*27,21,i*.8,'#ffa5d5');
 }else if(job==='rogue'){
  // Shadow duplications: three huge diagonal purple blades.
  for(let i=0;i<3;i++){
   const shift=(i-1)*108,px=-280+390*easeOut(clamp((t-i*.075)/.48));
   ctx.save();ctx.translate(px+shift,-36+i*27);ctx.rotate(-.7+i*.13);
   beam(-125,0,144,0,26,i===1?'#e7d6ff':'#7853e5');beam(-120,-8,130,-8,4,'#fff4ff');
   shard(148,0,58,Math.PI/2,'#d6c3ff');ctx.restore();
  }
  shock(123,34);
 }else if(job==='priest'){
  // Angelic wing silhouette; vertical holy light as the impact.
  for(let side of [-1,1]){
   ctx.save();ctx.scale(side,1);ctx.globalAlpha=strength;
   for(let i=0;i<7;i++){
    const a=i*.21,rootX=17,rootY=-82;
    beam(rootX,rootY,85+Math.cos(a)*116*arrival,-155+i*34,15-i*.9,'#fff7c6');
   }ctx.restore();
  }
  beam(0,-315+160*arrival,0,64,34,'#fff6cb');
  beam(0,-315+160*arrival,0,64,8,'#ffffff');flare(0,-60,120,'#fff6d5',strike*.72);shock(145,48);
 }else if(job==='monk'){
  // Oversized blazing gauntlet / fist driving into the target.
  ctx.save();ctx.translate(-250+245*arrival,-45);ctx.rotate(-.25);
  for(let i=0;i<4;i++){ctx.save();ctx.translate((i-1.5)*43,-87);ctx.rotate(.17);ctx.fillStyle='#ffdf9a';ctx.shadowColor='#ff9b4f';ctx.shadowBlur=25;ctx.globalAlpha=strength;ctx.fillRect(-17,0,35,86);ctx.restore();}
  ctx.fillStyle='#fff3c6';ctx.globalAlpha=strength;ctx.fillRect(-76,-27,158,113);ctx.restore();
  for(let i=0;i<11;i++){const a=i*Math.PI*2/11;beam(0,0,Math.cos(a)*(90+85*arrival),Math.sin(a)*(40+100*arrival),6,'#ffad69');}
  shock(100,34);
 }else if(job==='hunter'){
  // A giant spectral arrowhead and rain of cutting trajectories.
  beam(-330+310*arrival,-46,200,-46,21,'#9afad5');
  beam(-325+310*arrival,-53,195,-53,4,'#ffffff');
  shard(230,-45,110,Math.PI/2,'#e2fff1');
  for(let i=0;i<8;i++){const q=easeOut(clamp((t-i*.045)/.58));beam((i-4)*55+80,-260+255*q,(i-4)*55+22,60,6,'#b4ffdf');}
 }else if(job==='performer'){
  // Concert-wide ribbon waves, not individual note icons.
  for(let i=0;i<5;i++){
   ctx.save();ctx.strokeStyle=i%2?'#ffb1e8':'#9edfff';ctx.lineWidth=12-i;ctx.globalAlpha=strength*.82;ctx.shadowBlur=27;ctx.shadowColor=ctx.strokeStyle;ctx.beginPath();
   for(let k=0;k<=40;k++){const xx=-255+k*13,yy=-130+i*50+Math.sin(k*.38+t*9+i)*50*arrival;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}
   ctx.stroke();ctx.restore();
  }
  for(let i=0;i<6;i++)flare((i-2.5)*76,-80+Math.sin(t*13+i)*80,19,i%2?'#ffb5e9':'#a8e1ff',strike*.75);
 }
 ctx.restore();
}
function render(now){frame=0;if(!ctx)return;size();ctx.clearRect(0,0,viewportWidth,viewportHeight);
 for(let i=active.length-1;i>=0;i--){const e=active[i],t=(now-e.start)/e.duration;if(t>=1){active.splice(i,1);continue;}
  ctx.save();if(e.clipRect){ctx.beginPath();ctx.rect(e.clipRect.x,e.clipRect.y,e.clipRect.width,e.clipRect.height);ctx.clip();}
  castOrigin(e,t);
  groupStage(e,t);
  spectacle(e,t);
  ctx.save();ctx.translate(e.x,e.y);ctx.globalCompositeOperation='screen';
  const desktop=innerWidth>=650;
  const largeField=e.multi&&(e.thirdStage==='Wide'||e.type==='royalSanctuary');
  const zoom=desktop?(largeField?1.06:e.multi?(e.hero?1.7:1.55):(e.hero?(e.finisher?2.75:2.45):2.05)):(largeField?.82:e.multi?1.18:(e.hero?1.55:1.3));
  ctx.scale(zoom*VFX_SCALE,zoom*VFX_SCALE);
  if(e.thirdJob==='crusader'&&['royalJudgment','royalSanctuary'].includes(e.type)){/* painted illustration and one group seal own the foreground */}else if(['holyShield','shieldStrike','shieldArray','royalShield'].includes(e.type))shield(e,t);else if(['sanctuary','royalSanctuary'].includes(e.type))sanctuary(e,t);else if(['judgment','royalJudgment'].includes(e.type))judgment(e,t);
  else if(bladeTypes.has(e.type))blade(e,t);else if(projectileTypes.has(e.type))projectile(e,t);else if(elementalTypes.has(e.type))element(e,t);
  else if(fistTypes.has(e.type))fist(e,t);else if(soundTypes.has(e.type))sound(e,t);else if(auraTypes.has(e.type))aura(e,t);else generic(e,t);
  if(!e.multi||e.primary){
   if(e.multi&&e.hero){ctx.save();ctx.translate((e.groupX-e.x)/(zoom*VFX_SCALE),(e.groupY-e.y)/(zoom*VFX_SCALE));legendary(e,t);ctx.restore();}
   else legendary(e,t);
  }
  ctx.restore();
  ctx.restore();
 }
 if(active.length)frame=requestAnimationFrame(render);
}
export function playCinematic({type,x,y,groupX=x,groupY=y,groupSpan=0,clipRect=null,sourceX,sourceY,skillId='',name='',finisher=false,multi=false,primary=true,preview=false}){
 if(typeof document==='undefined'||document.hidden){lastCinematicStatus='頁面未顯示';return false;}
 // Explicit play requests and the in-game VFX-on choice take precedence over
 // the OS reduced-motion preference. The game toggle remains the opt-out.
 init();if(!ctx){lastCinematicStatus='Canvas 無法建立';return false;}
 lastCinematicStatus='Canvas 已觸發：'+(skillId||type);
 const third=/^third(Main|Wide|Finish)_(\w+)$/.exec(skillId);const hero=royalTypes.has(type)||!!third,duration=preview?(hero?2750:1750):hero?(finisher?1900:1550):(finisher?1150:820);
 const signature=skillSignature(skillId||name||type);
 active.push({type,x,y,groupX,groupY,groupSpan,clipRect,sourceX,sourceY,primary,skillId,name,signature,variant:signature%3,thirdJob:third?.[2]||'',thirdStage:third?.[1]||'',dx:Math.max(-220,Math.min(220,(sourceX??x-90)-x)),dy:Math.max(-180,Math.min(180,(sourceY??y)-y)),color:jobColors[third?.[2]]||accents[type]||'#a4d9f5',start:performance.now(),duration,finisher,multi,hero,seed:Math.random()*6});
 if(active.length>18)active.splice(0,active.length-18);
 if(!frame)frame=requestAnimationFrame(render);
 return hero||bladeTypes.has(type)||projectileTypes.has(type)||elementalTypes.has(type)||fistTypes.has(type)||soundTypes.has(type)||auraTypes.has(type);
}
export function getCinematicDiagnostics(){return {status:lastCinematicStatus,canvas:!!ctx,reducedMotion,royalArt:!!royalPaintedSprite,royalShieldArt:!!royalShieldPaint?.naturalWidth,royalSanctuaryArt:!!royalSanctuaryPaint?.naturalWidth,version:'royal-painted-v26'};}
