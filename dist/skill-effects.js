// Presentation-only VFX: no combat timers, damage, inventory or save writes.
import {visualForSkill} from './skill-effects-presets.js?v=2';
import {playCinematic,getCinematicDiagnostics} from './skill-cinematic.js?v=26';
const MAX_ACTIVE=24;
const EFFECTS_STORAGE_KEY='spirit-pact-vfx-enabled';
let effectsEnabled=true;
try{effectsEnabled=localStorage.getItem(EFFECTS_STORAGE_KEY)!=='off';}catch{}
const lanes={slash:'近戰斬擊',pierce:'遠程彈道',magic:'魔法彈道',holy:'聖光盾擊',heal:'治癒',shield:'護盾',buff:'強化',mana:'魔力',pet:'靈獸協攻',resonance:'共鳴',boss:'首領攻擊',finisher:'終結技'};
let lastFrame=0;
const targetCooldowns=new Map();
function chooseType(effect){
 if(effect.source==='boss')return 'boss';
 if(effect.source==='resonance')return 'resonance';
 if(effect.source==='pet')return effect.kind==='heal'?'heal':effect.kind==='magic'?'magic':'pet';
 if(effect.source==='normal')return effect.range==='ranged'?'snipe':'bash';
 return visualForSkill(effect);
}
function locate(effect){
 if(effect.source==='boss'||['heal','shield','buff','mana'].includes(effect.kind))return document.querySelector('#battlePanel .actiongrid')||document.querySelector('#battlePanel');
 const id=String(effect.targetId||'');
 const target=[...document.querySelectorAll('#encounter .enemy-target[data-target]')].find(el=>el.dataset.target===id);
 return target||(id?null:document.querySelector('#encounter .enemy-target.active')||document.querySelector('#encounter'));
}
let stylesheetInstalled=false;
function install(){if(stylesheetInstalled)return;stylesheetInstalled=true;const link=document.createElement('link');link.rel='stylesheet';link.href='./skill-effects.css?v=8';document.head.append(link);}
function installToggle(){
 const grid=document.querySelector('#battlePanel .actiongrid');if(!grid||document.getElementById('effectsToggle'))return;
 install();const button=document.createElement('button');button.id='effectsToggle';button.type='button';button.className='effects-toggle';button.title='控制即時戰鬥技能特效；不影響戰鬥數值與存檔';
 const refresh=()=>{button.textContent=effectsEnabled?'✨ 技能特效：開':'○ 技能特效：關';button.setAttribute('aria-pressed',String(effectsEnabled));};
 button.addEventListener('click',()=>{effectsEnabled=!effectsEnabled;try{localStorage.setItem(EFFECTS_STORAGE_KEY,effectsEnabled?'on':'off');}catch{}refresh();if(!effectsEnabled)document.querySelectorAll('.skill-vfx').forEach(el=>el.remove());});
 refresh();grid.append(button);
 const preview=document.createElement('a');preview.href='./effects-lab.html';preview.target='_blank';preview.rel='noopener';preview.className='effects-lab-link';preview.textContent='◈ 技能演出展示';preview.title='在獨立試驗場觀看各職業技能；不影響角色與存檔';grid.append(preview);
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installToggle,{once:true});else installToggle();}
export function queueCombatVfx(effect={}){
 // A deliberate preview action always plays; the in-game preference only governs combat.
 if(typeof document==='undefined'||typeof requestAnimationFrame!=='function'||document.hidden||(!effectsEnabled&&!effect.preview))return;
 const now=performance.now(),ids=[...new Set((effect.targetIds?.length?effect.targetIds:[effect.targetId]).filter(Boolean))],targetKey=`${effect.source}:${effect.skillId||''}:${ids.join(',')||'self'}`;
 const interval=effect.finisher?180:effect.source==='resonance'||effect.source==='boss'?450:effect.source==='skill'?220:effect.source==='pet'?480:540;
 // Never drop named job skills just because a pet or normal hit happened in the same frame.
 if((effect.source!=='skill'&&now-lastFrame<70)||now-(targetCooldowns.get(targetKey)||0)<interval)return;
 lastFrame=now;targetCooldowns.set(targetKey,now);
 if(targetCooldowns.size>80)targetCooldowns.clear();
 const locations=(ids.length?ids:[null]).map(targetId=>{const element=locate({...effect,targetId});return {targetId,rect:element?.getBoundingClientRect()};});
 const sourceElement=effect.source==='pet'?document.querySelector('#companion'):effect.source==='boss'?document.querySelector('#encounter .enemy-target.map-boss'):document.querySelector('#character');
 const sourceRect=sourceElement?.getBoundingClientRect();
 const encounterRect=document.querySelector('#encounter')?.getBoundingClientRect();
 requestAnimationFrame(()=>{
  install();const type=chooseType(effect),multi=locations.length>1;
  const visibleLocations=locations.filter(({rect})=>rect&&rect.width&&rect.height&&rect.bottom>=0&&rect.top<=innerHeight);
  const centers=visibleLocations.map(({rect})=>({x:rect.left+rect.width/2,y:rect.top+rect.height*.43}));
  const groupX=centers.reduce((sum,p)=>sum+p.x,0)/Math.max(1,centers.length),groupY=centers.reduce((sum,p)=>sum+p.y,0)/Math.max(1,centers.length);
  const groupSpan=centers.length?Math.max(...centers.map(p=>p.x))-Math.min(...centers.map(p=>p.x)):0;
  if(effect.skillId==='thirdWide_crusader'){
   // Presentation-only lift, restored automatically without changing combat.
   const duration=effect.preview?2750:1550;
   for(const {targetId} of visibleLocations){
    const target=[...document.querySelectorAll('#encounter .enemy-target[data-target]')].find(el=>el.dataset.target===String(targetId));
    target?.animate?.([
     {offset:0,transform:'translateY(0px)',filter:'brightness(1)'},
     {offset:.19,transform:'translateY(0px)',filter:'brightness(1)'},
     {offset:.46,transform:'translateY(-24px)',filter:'brightness(1.25)'},
     {offset:.64,transform:'translateY(-32px)',filter:'brightness(1.5)'},
     {offset:.81,transform:'translateY(-31px)',filter:'brightness(1.8)'},
     {offset:.94,transform:'translateY(0px)',filter:'brightness(1.15)'},
     {offset:1,transform:'translateY(0px)',filter:'brightness(1)'}
    ],{duration,easing:'ease-in-out',fill:'none'});
   }
  }
  const active=[...document.querySelectorAll('.skill-vfx')],needed=Math.max(0,active.length+locations.length-MAX_ACTIVE);
  for(const oldest of active.slice(0,needed))oldest.remove();
  for(const [index,{targetId,rect}] of locations.entries()){
   if(!rect||!rect.width||!rect.height||rect.bottom<0||rect.top>innerHeight)continue;
   const el=document.createElement('div');el.className=`skill-vfx skill-vfx--${type}${effect.critical?' skill-vfx--critical':''}${multi?' skill-vfx--aoe':''}${effect.finisher?' skill-vfx--finisher':''}`;
   el.setAttribute('aria-hidden','true');el.dataset.targetId=targetId||'';el.dataset.skillId=effect.skillId||'';el.dataset.visual=type;el.style.setProperty('--vfx-x',`${rect.left+rect.width/2}px`);el.style.setProperty('--vfx-y',`${rect.top+rect.height*.43}px`);
   const startX=sourceRect?sourceRect.right-rect.left-rect.width/2:-150,startY=sourceRect?sourceRect.top+sourceRect.height/2-rect.top-rect.height*.43:0;
   el.style.setProperty('--vfx-from-x',`${Math.min(-25,startX)}px`);el.style.setProperty('--vfx-from-y',`${startY}px`);
   const rendered=playCinematic({type,x:rect.left+rect.width/2,y:rect.top+rect.height*.43,groupX,groupY,groupSpan,clipRect:encounterRect,sourceX:sourceRect?.right,sourceY:sourceRect?sourceRect.top+sourceRect.height/2:undefined,skillId:effect.skillId,name:effect.name,finisher:effect.finisher,multi,primary:index===0,preview:!!effect.preview});
   if(rendered)continue;
   for(const part of ['trail','impact','sparks']){const node=document.createElement('i');node.className=`skill-vfx__${part}`;el.append(node);}
   document.body.append(el);el.addEventListener('animationend',event=>{if(event.target===el)el.remove();});setTimeout(()=>el.remove(),2000);
  }
 });
}
export const skillVisualTypes=Object.freeze({...lanes});
export {getCinematicDiagnostics};
