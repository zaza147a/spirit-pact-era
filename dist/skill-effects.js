// Lightweight, presentation-only hit sigils. No Canvas, sprite loading, game-state writes or save changes.
import {visualForSkill} from './skill-effects-presets.js?v=2';

const EFFECTS_STORAGE_KEY='spirit-pact-vfx-enabled';
const symbols={
 bash:'✦',slash:'╱',pierce:'➤',dualBlade:'⚔',bladeStorm:'✣',execute:'⚔',shadowBlade:'☾',ambush:'◆',poisonBlade:'☠',
 holyShield:'🛡',shieldStrike:'🛡',shieldArray:'▣',royalShield:'♜',sanctuary:'✡',royalSanctuary:'✡',judgment:'⚖',royalJudgment:'♛',holyCross:'✝',holyBeam:'✝',
 lance:'➳',snipe:'◎',falconArrow:'🦅',arrowRain:'⇊',
 firebolt:'🔥',flameBurst:'✹',frostbolt:'❄',lightning:'⚡',meteor:'☄',meteorRain:'☄',arcaneStorm:'✧',void:'◉',
 elementFist:'✊',energyPalm:'◈',dragonFist:'🐉',elementStorm:'❖',elementBurst:'✺',quake:'▥',
 starNote:'♫',symphony:'𝄞',finale:'♪',heal:'✚',shield:'⬡',mana:'✧',buff:'✦',
 magic:'✧',holy:'✝',pet:'🐾',resonance:'✶',boss:'⚠',finisher:'✹'
};
const palettes={
 holyShield:'#efcf82',shieldStrike:'#efcf82',shieldArray:'#efcf82',royalShield:'#efcf82',sanctuary:'#e9d48d',royalSanctuary:'#e9d48d',judgment:'#f6dd8a',royalJudgment:'#f6dd8a',holyCross:'#edcf8c',holyBeam:'#edcf8c',
 firebolt:'#ff9d78',flameBurst:'#f9a96d',meteor:'#ffa670',meteorRain:'#ffa670',frostbolt:'#a0dcfa',lightning:'#ccb9ff',arcaneStorm:'#c0a7ff',void:'#ab98ed',
 heal:'#a0e5b6',shield:'#8ccfe3',mana:'#91baff',buff:'#e0cc91',poisonBlade:'#a0d79a',shadowBlade:'#c5b6df',ambush:'#c5b6df',
 lance:'#a7dce5',snipe:'#b4e8df',falconArrow:'#a9dfd8',arrowRain:'#a9dfd8',starNote:'#d6bdff',symphony:'#d6bdff',finale:'#edbaff',
 boss:'#fb929d',resonance:'#f1d39b',pet:'#dfb18d'
};
const active=new Set(),cooldowns=new Map();
let effectsEnabled=true,installed=false,lastGeneric=0,lastStatus='尚未播放';
try{effectsEnabled=localStorage.getItem(EFFECTS_STORAGE_KEY)!=='off';}catch{}

function install(){
 if(installed)return;installed=true;
 const css=document.createElement('link');css.rel='stylesheet';css.href='./skill-effects.css?v=6.5.12';document.head.append(css);
}
function installToggle(){
 const grid=document.querySelector('#battlePanel .actiongrid');
 if(!grid||document.getElementById('effectsToggle'))return;
 install();const button=document.createElement('button');button.id='effectsToggle';button.type='button';button.className='effects-toggle';
 button.title='控制即時戰鬥技能辨識符號；不影響戰鬥數值與存檔';
 const refresh=()=>{button.textContent=effectsEnabled?'✨ 技能特效：開':'○ 技能特效：關';button.setAttribute('aria-pressed',String(effectsEnabled));};
 button.addEventListener('click',()=>{effectsEnabled=!effectsEnabled;try{localStorage.setItem(EFFECTS_STORAGE_KEY,effectsEnabled?'on':'off');}catch{}refresh();if(!effectsEnabled)for(const el of active)el.remove();});
 refresh();grid.append(button);
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installToggle,{once:true});else installToggle();}

function typeFor(effect){
 if(effect.source==='boss')return 'boss';
 if(effect.source==='resonance')return 'resonance';
 if(effect.source==='pet')return effect.kind==='heal'?'heal':effect.kind==='magic'?'magic':'pet';
 if(effect.source==='normal')return effect.range==='ranged'?'snipe':'bash';
 return visualForSkill(effect);
}
function targetElement(id,effect){
 if(effect.source==='boss'||['heal','shield','buff','mana'].includes(effect.kind))return document.querySelector('#battlePanel .actiongrid')||document.querySelector('#battlePanel');
 const list=document.querySelectorAll('#encounter .enemy-target[data-target]');
 for(const target of list)if(target.dataset.target===String(id))return target;
 return id?null:document.querySelector('#encounter .enemy-target.active')||document.querySelector('#encounter');
}
export function queueCombatVfx(effect={}){
 if(typeof document==='undefined'||document.hidden||(!effectsEnabled&&!effect.preview))return;
 // Boss attacks are conveyed by damage and combat messages; no visual overlay.
 if(effect.source==='boss')return;
 const now=performance.now(),ids=[...new Set((effect.targetIds?.length?effect.targetIds:[effect.targetId]).filter(Boolean))];
 const key=`${effect.source}:${effect.skillId||effect.name||''}:${ids.join(',')||'self'}`;
 const gap=effect.preview?90:effect.source==='skill'?effect.finisher?760:460:effect.source==='normal'?1000:750;
 if(now-(cooldowns.get(key)??-Infinity)<gap||(effect.source!=='skill'&&now-lastGeneric<130))return;
 cooldowns.set(key,now);if(effect.source!=='skill')lastGeneric=now;
 if(cooldowns.size>100)cooldowns.clear();
 const type=typeFor(effect),targets=ids.length?ids:[null],positions=[];
 for(const id of targets){
  const rect=targetElement(id,effect)?.getBoundingClientRect();
  if(rect&&rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<innerHeight)positions.push({id,rect});
 }
 if(!positions.length)return;
 install();
 // Each actually hit monster gets its own sigil; never synthesize extra targets.
 const fragment=document.createDocumentFragment(),batch=[];
 for(const {id,rect} of positions){
  const el=document.createElement('span');el.className='skill-vfx skill-vfx--sigil';el.setAttribute('aria-hidden','true');
  el.dataset.targetId=id||'';el.dataset.skillId=effect.skillId||'';el.dataset.visual=type;
  el.title='';el.textContent=symbols[type]||'✦';el.style.left=`${Math.round(rect.left+rect.width/2)}px`;el.style.top=`${Math.round(rect.top+rect.height*.4)}px`;
  el.style.color=palettes[type]||'#d9e9f4';fragment.append(el);active.add(el);batch.push(el);
 }
 document.body.append(fragment);lastStatus='輕量符號：'+(effect.skillId||type);
 setTimeout(()=>{for(const el of batch){el.remove();active.delete(el);}},520);
 // Bounded DOM footprint even when many different skills fire in the same second.
 if(active.size>12){for(const el of active){el.remove();active.delete(el);if(active.size<=9)break;}}
}
export const skillVisualTypes=Object.freeze({slash:'斬擊',pierce:'突刺',magic:'魔法',holy:'聖光',heal:'治療',shield:'護盾',buff:'強化',mana:'魔力',pet:'夥伴',resonance:'共鳴',boss:'首領',finisher:'終結'});
export function getCinematicDiagnostics(){return {status:lastStatus,canvas:false,reducedMotion:false,royalArt:false,royalShieldArt:false,royalSanctuaryArt:false,version:'lightweight-sigils-v1'};}
