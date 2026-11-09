import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer,LEGACY_OPTIMAL_BUILD_NAMES} from './fixtures/legacy-optimal-player.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {claimExtremeCharacterStage,syncExtremeHonorOwnership} from '../dist/extreme-trials-rewards.js';

const kinds=['atk','matk','hp','clear'];
const jobs=[...LEGACY_OPTIMAL_BUILD_NAMES,'pactWarrior','spiritCommander'];
const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const marker="$('side').addEventListener('click',event=>{\n  const enter=event.target.closest('[data-extreme-enter]');";
const start=source.indexOf(marker);
const end=source.indexOf("\n document.addEventListener('click',event=>{",start);
assert.ok(start>=0&&end>start,'extreme delegated click handler exists');
const handlerSource=source.slice(start,end);

const fixture=job=>LEGACY_OPTIMAL_BUILD_NAMES.includes(job)?legacyOptimalPlayer(job):
 highLevelSpiritPlayer({level:210,job,pairKey:['attack-magic','attack-defense'].sort().join('+'),dawnSigil:0});

test('48職業戰袍：點選、取消、未解鎖拒絕與存檔失敗回復',async()=>{
 const c=await runtime();
 const listeners=[];
 c.document.getElementById=id=>id==='side'?{addEventListener:(name,cb)=>listeners.push(cb)}:null;
 vm.runInContext(handlerSource,c);
 assert.equal(listeners.length,1);
 const click=(type,kind,disabled=false)=>{
  const button={disabled,dataset:{extremeCosmetic:type,extremeKind:kind}};
  listeners[0]({target:{closest:selector=>selector==='[data-extreme-cosmetic]'?button:null}});
 };
 for(const job of jobs)for(const kind of kinds){
  const p=fixture(job);c.api.setup(p);
  click('mantle',kind);
  assert.equal(c.api.state().player.extremeSelectedMantle??null,null,`${job}/${kind} locked`);
  claimExtremeCharacterStage(p,kind,30);syncExtremeHonorOwnership(p);
  p.towerCostume='frost';p.selectedOutfit='SSS';p.cosmeticOutfit='test';
  click('mantle',kind);
  assert.equal(c.api.state().player.extremeSelectedMantle,kind,`${job}/${kind} selected`);
  assert.equal(c.api.state().player.towerCostume,null);
  assert.equal(c.api.state().player.selectedOutfit,null);
  assert.equal(c.api.state().player.cosmeticOutfit,null);
  click('aura',kind);
  assert.equal(c.api.state().player.extremeSelectedAura,kind);
  click('mantle','');
  assert.equal(c.api.state().player.extremeSelectedMantle,null);
  assert.equal(c.api.state().player.extremeSelectedAura,kind,'aura is independent');
  click('mantle',kind);
  c.api.setSaveForTest(()=>false);
  click('mantle','');
  assert.equal(c.api.state().player.extremeSelectedMantle,kind,'failed save reverts selection');
  c.api.setSaveForTest(()=>true);
 }
});

test('四王八款極限背景切換會互斥其他背景，失敗時還原',async()=>{
 const c=await runtime();
 const buttons=['atk','matk','hp','clear'].flatMap(kind=>
  [`${kind}_milestone`,`${kind}_background`].map(id=>({dataset:{extremeBackgroundPick:id}})));
 c.document.getElementById=id=>id==='side'?{querySelectorAll:selector=>
  selector==='[data-extreme-background-pick]'?buttons:[]}:null;
 const start=source.indexOf("for(const b of $('side').querySelectorAll('[data-extreme-background-pick]'))");
 const end=source.indexOf("\nif(tab==='pets')",start);
 assert.ok(start>=0&&end>start);
 vm.runInContext(source.slice(start,end),c);
 for(const button of buttons){
  const p=fixture('knight');
  const kind=button.dataset.extremeBackgroundPick.split('_')[0];
  claimExtremeCharacterStage(p,kind,30);syncExtremeHonorOwnership(p);
  p.cosmeticBackground='gold-test';
  c.api.setup(p);
  button.onclick();
  assert.equal(c.api.state().player.extremeSelectedBackground,button.dataset.extremeBackgroundPick);
  assert.equal(c.api.state().player.cosmeticBackground,null);
  c.api.setSaveForTest(()=>false);
  button.onclick();
  assert.equal(c.api.state().player.extremeSelectedBackground,button.dataset.extremeBackgroundPick);
  c.api.setSaveForTest(()=>true);
  button.onclick();
  assert.equal(c.api.state().player.extremeSelectedBackground,null);
 }
});
