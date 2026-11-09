import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer,LEGACY_OPTIMAL_BUILD_NAMES} from './fixtures/legacy-optimal-player.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {claimExtremeCharacterStage,syncExtremeHonorOwnership} from '../dist/extreme-trials-rewards.js';
import {renderExtremePanel} from '../dist/extreme-trials-ui.js';

const jobs=[...LEGACY_OPTIMAL_BUILD_NAMES,'pactWarrior','spiritCommander'];
const kinds=['atk','matk','hp','clear'];
const fixture=job=>LEGACY_OPTIMAL_BUILD_NAMES.includes(job)?legacyOptimalPlayer(job):
 highLevelSpiritPlayer({level:210,job,pairKey:['attack-magic','attack-defense'].sort().join('+'),dawnSigil:0});

test('12職×四王的48張戰袍按25階開啟，光環背景仍須30階',async()=>{
 const c=await runtime();
 c.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
 for(const job of jobs)for(const kind of kinds)for(const floor of [24,25,29,30]){
  const p=fixture(job);
  claimExtremeCharacterStage(p,kind,floor);
  syncExtremeHonorOwnership(p);
  c.api.setup(p);
  const html=c.api.renderOutfits();
  const mantle=`data-extreme-cosmetic="mantle" data-extreme-kind="${kind}"`;
  const aura=`data-extreme-cosmetic="aura" data-extreme-kind="${kind}"`;
  const mantleButton=html.slice(html.indexOf(mantle),html.indexOf('</button>',html.indexOf(mantle)));
  const auraButton=html.slice(html.indexOf(aura),html.indexOf('</button>',html.indexOf(aura)));
  assert.ok(html.includes(`assets/extreme/mantles-v2/${kind}-${job}.webp`),`${job}/${kind} preview`);
  assert.equal(/disabled/.test(mantleButton),floor<25,`${job}/${kind}/f${floor} mantle`);
  assert.equal(/disabled/.test(auraButton),floor<30,`${job}/${kind}/f${floor} aura`);
  assert.equal(p.extremeBackgrounds.includes(`${kind}_milestone`),floor>=30);
  assert.equal(p.extremeBackgrounds.includes(`${kind}_background`),floor>=30);
  const panel=renderExtremePanel(p);
  assert.equal(panel.includes(`第 30 階自動解鎖</small><span>✓ 已解鎖`),floor>=30);
  assert.doesNotMatch(panel,/data-extreme-buy|極限徽記|極限商店/);

  p.extremeSelectedMantle=kind;p.extremeSelectedAura=kind;
  p.extremeSelectedBackground=`${kind}_background`;
  const drawn={art:null,aura:false};
  const portrait={className:'art-sprite',replaceWith:element=>{drawn.art=element.src;}};
  const hero={querySelector:()=>portrait,style:{},classList:{add:()=>{},toggle:(name,enabled)=>{
   if(name===`extreme-aura-${kind}`)drawn.aura=enabled;
  }}};
  const character={querySelector:()=>hero,dataset:{}};
  c.document.getElementById=id=>id==='character'?character:null;
  c.document.createElement=()=>({});
  vm.runInContext('applyCosmeticHero()',c);
  assert.equal(drawn.art,floor>=25?`assets/extreme/mantles-v2/${kind}-${job}.webp`:null);
  assert.equal(drawn.aura,floor>=30);
  assert.equal(hero.style.backgroundImage?.includes(`background-${kind}-collector.webp`)||false,floor>=30);
 }
});

test('首頁選角的48套戰袍、光環與典藏背景和角色欄使用同一解鎖結果',async()=>{
 const c=await runtime();
 for(const job of jobs)for(const kind of kinds){
  const p=fixture(job);claimExtremeCharacterStage(p,kind,30);syncExtremeHonorOwnership(p);
  p.extremeSelectedMantle=kind;p.extremeSelectedAura=kind;p.extremeSelectedBackground=`${kind}_background`;
  const drawn={art:null,aura:false,background:null};
  const oldArt={replaceWith:img=>{drawn.art=img.src;}};
  const stage={style:{},classList:{add:()=>{}},querySelector:()=>oldArt};
  const name={classList:{add:()=>{}},insertAdjacentElement:()=>{}};
  const slot={querySelector:key=>key==='h2'?name:stage,classList:{add:key=>{
   if(key===`extreme-entry-aura-${kind}`)drawn.aura=true;
  }}};
  const grid={querySelector:()=>slot};
  c.document.getElementById=id=>id==='slotGrid'?grid:null;
  c.document.createElement=()=>({});
  c.slotPlayer=p;
  vm.runInContext('decorateTowerHonorEntry([{index:0,player:slotPlayer}])',c);
  drawn.background=stage.style.backgroundImage;
  assert.equal(drawn.art,`assets/extreme/mantles-v2/${kind}-${job}.webp`);
  assert.equal(drawn.aura,true);
  assert.match(drawn.background,new RegExp(`background-${kind}-collector\\.webp`));
 }
});
