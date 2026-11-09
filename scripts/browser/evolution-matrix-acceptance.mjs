import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium,webkit} from 'playwright';
import {petArt} from '../../dist/pet-evolution.js';
import {fusionArt} from '../../dist/pet-fusion.js';
import {trueFormArt} from '../../dist/pet-true-form.js';

const root=resolve('dist'),out=resolve('browser-qa/evolution-matrix');
await mkdir(out,{recursive:true});
const mime={'.png':'image/png','.webp':'image/webp','.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 try{const route=decodeURIComponent(new URL(req.url,'http://local').pathname);
  const path=resolve(root,'.'+(route==='/'?'/index.html':route));
  if(!path.startsWith(root+'/'))throw Error('invalid path');
  const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end('not found');}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const base='http://127.0.0.1:'+server.address().port;
const engine=process.env.BROWSER_ENGINE||'chromium';
const browser=await ({chromium,webkit})[engine].launch({headless:true});
const roles={attack:'fang',magic:'wisp',defense:'shell',support:'sprout'};
const rarities=['common','rare','uncommon','legendary','mythic'];
const pairs=Object.keys(roles).flatMap(a=>Object.keys(roles).filter(b=>a!==b).map(b=>a+'-'+b));
const cases=[];
for(const [role,species] of Object.entries(roles))
 for(const rarity of rarities)
  for(let stage=0;stage<5;stage++)
   cases.push({id:'basic-'+role+'-'+rarity+'-'+stage,kind:'basic',src:petArt({species,rarity,evolution:stage}),role,rarity,stage});
for(const pair of pairs){
 const [main,sub]=pair.split('-');
 const pet={species:roles[main],rarity:'mythic',evolution:4,fusion:{main,sub},ascended:true,level:200};
 cases.push({id:'fusion-'+pair,kind:'fusion',src:fusionArt(pet),pair});
 for(const rank of [null,'S','SS','SSS']){
  const stage=rank===null?0:['S','SS','SSS'].indexOf(rank)+1;
  const x={...pet,trueForm:true,humanoidStage:stage,gear:{head:{enhancement:rank},body:{enhancement:rank},shoes:{enhancement:rank}}};
  const src=trueFormArt(x);
  cases.push({id:'trueform-'+pair+'-'+(rank||'juvenile'),kind:'trueform',src,pair,rank:rank||'juvenile'});
 }
}
const errors=[],results=[];
try{
 const context=await browser.newContext({viewport:{width:1050,height:800},reducedMotion:'no-preference'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
 const linked=await page.evaluate(()=>{
  const el=document.querySelector('link[href*="evolution-motion.css"]');
  return {href:el?.getAttribute('href'),old:!!document.getElementById('evolutionWarpOld'),next:!!document.getElementById('evolutionWarpNew')};
 });
 assert.ok(linked.href?.includes('6.5.4'),'incorrect css cache version: '+JSON.stringify(linked));
 assert.ok(linked.old&&linked.next,'missing actual SVG distortion filters');
 // Validate every distinct real image with the browser decoder, not just filesystem existence.
 for(const item of cases){
  const check=await page.evaluate(async src=>{
   const image=new Image();image.src=src;
   try{await image.decode();return {ok:image.naturalWidth>0&&image.naturalHeight>0,width:image.naturalWidth,height:image.naturalHeight};}
   catch(e){return {ok:false,error:String(e)};}
  },item.src);
  results.push({...item,...check});if(!check.ok)errors.push(item.id+' could not decode '+item.src+' '+check.error);
 }
 // Exercise every legal stage transition with actual art and the real evolution modal CSS.
 // Base: 4 families x 5 rarities x 4 transitions = 80; fusion: 12;
 // true form: 12 ordered pairs x (juvenile, S, SS, SSS) = 48.
 const samples=[];
 for(const [role,species] of Object.entries(roles))
  for(const rarity of rarities)
   for(let stage=1;stage<5;stage++)
    samples.push({name:'basic-'+role+'-'+rarity+'-'+stage,
      before:petArt({species,rarity,evolution:stage-1}),
      after:petArt({species,rarity,evolution:stage})});
 for(const pair of pairs){
  const [main,sub]=pair.split('-');
  const pet={species:roles[main],rarity:'mythic',evolution:4,fusion:{main,sub},ascended:true,level:200};
  const baseArt=petArt({...pet,fusion:null});
  const fusedArt=fusionArt(pet);
  samples.push({name:'fusion-'+pair,before:baseArt,after:fusedArt});
  let prev=fusedArt;
  for(let stage=0;stage<4;stage++){
   const next=trueFormArt({...pet,trueForm:true,humanoidStage:stage});
   samples.push({name:'trueform-'+pair+'-'+(['juvenile','S','SS','SSS'][stage]),before:prev,after:next});
   prev=next;
  }
 }
 assert.equal(samples.length,140,'full evolution transition matrix must be exhaustive');
 for(const item of samples){
  await page.evaluate(({before,after})=>{
   const scene=document.querySelector('#evolutionScene');scene.className='evolution-scene preview';
   document.querySelector('#evolutionModal').style.display='grid';
   document.querySelector('#evolutionBefore').src=before;
   document.querySelector('#evolutionAfter').src=after;
  },item);
  const frames=[];
  for(const ms of [0,800,1600,2400,3200,3990]){
   const v=await page.evaluate(ms=>{
    const scene=document.querySelector('#evolutionScene');
    if(!scene.classList.contains('evolving'))scene.className='evolution-scene evolving';
    const get=id=>{
     const image=document.getElementById(id);
     for(const a of image.getAnimations()){a.pause();a.currentTime=ms;}
     const style=getComputedStyle(image);
     return {opacity:Number(style.opacity),filter:style.filter,animation:style.animationName,naturalWidth:image.naturalWidth};
    };
    return {before:get('evolutionBefore'),after:get('evolutionAfter')};
   },ms);
   frames.push({ms,...v});
  }
  assert.equal(frames[0].before.animation,'form-out');
  assert.equal(frames[0].after.animation,'form-in');
  assert.ok(frames[0].before.opacity>.95&&frames[0].after.opacity<.05,item.name+' start');
  assert.ok(frames[3].before.opacity>.15&&frames[3].after.opacity>.2,item.name+' middle overlap');
  assert.ok(frames.at(-1).before.opacity<.05&&frames.at(-1).after.opacity>.95,item.name+' end');
  assert.ok(frames[2].before.filter.includes('evolutionWarpOld'),item.name+' old distortion');
  assert.ok(frames[2].after.filter.includes('evolutionWarpNew'),item.name+' new distortion');
  if(item.name.startsWith('fusion-') || item.name.startsWith('trueform-')&&item.name.endsWith('-SSS') || item.name.startsWith('basic-')&&item.name.includes('-mythic-3')) await page.locator('#evolutionScene').screenshot({path:resolve(out,item.name+'-mid.png')});
  await page.evaluate(()=>document.querySelector('#evolutionScene').className='evolution-scene complete');
  const finish=await page.evaluate(()=>{
   const x=document.getElementById('evolutionAfter');for(const a of x.getAnimations()){a.finish();}
   return {opacity:getComputedStyle(x).opacity,filter:getComputedStyle(x).filter};
  });
  assert.equal(finish.opacity,'1',item.name+' finished image should be visible');
  assert.ok(!finish.filter.includes('blur(3px)'),item.name+' should be clear');
 }
 // Accessibility-specific CSS dispatch is verified in a separate reduced-motion browser context.
 const quiet=await browser.newContext({viewport:{width:1050,height:800},reducedMotion:'reduce'});
 const q=await quiet.newPage();await q.goto(base+'/index.html');
 const quietMode=await q.evaluate(()=>{
  document.querySelector('#evolutionModal').style.display='grid';
  document.querySelector('#evolutionScene').className='evolution-scene evolving';
  return {old:getComputedStyle(document.getElementById('evolutionBefore')).animationName,
   next:getComputedStyle(document.getElementById('evolutionAfter')).animationName};
 });
 assert.equal(quietMode.old,'quiet-out');assert.equal(quietMode.next,'quiet-in');
 await quiet.close();await context.close();
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS EVOLUTION MATRIX '+JSON.stringify({engine,images:cases.length,base:100,fusion:12,trueform:48,animatedSamples:samples.length,quietMode,linked}));
}finally{
 await writeFile(resolve(out,'report-'+engine+'.json'),JSON.stringify({engine,results,errors},null,2));
 await browser.close();server.close();
}
