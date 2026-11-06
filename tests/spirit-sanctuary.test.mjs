import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makePet,petStats} from '../dist/catalog.js';
import {normalizePetLevel,normalizeLoyalty} from '../dist/pet-ascension.js';
import {continentFor} from '../dist/frontier.js';
import {mapRules,cardDropChance} from '../dist/map-rules.js';
import {encounterLimit} from '../dist/encounter-rules.js';
import {SPIRIT_SANCTUARY_MAP,SPIRIT_SANCTUARY_MONSTERS,spiritSanctuaryUnlocked,announceSpiritSanctuary,visitSpiritSanctuary,spiritSanctuaryTracker,blessSanctuaryPet} from '../dist/spirit-sanctuary.js';

const player=(done=false)=>({job:'knight',homecoming:{routes:{'attack-magic':{phase:done?'claimed':'ready'}}}});

test('first claimed homecoming unlocks the Dawn sanctuary exactly once and persists visit',()=>{
 const p=player();assert.equal(spiritSanctuaryUnlocked(p),false);
 assert.equal(announceSpiritSanctuary(p),false);
 p.homecoming.routes['attack-magic'].phase='claimed';
 assert.equal(spiritSanctuaryUnlocked(p),true);
 assert.equal(announceSpiritSanctuary(p),true);
 assert.equal(announceSpiritSanctuary(p),false);
 assert.match(spiritSanctuaryTracker(p),/契靈之地/);
 const restored=structuredClone(p);assert.equal(announceSpiritSanctuary(restored),false);
 assert.equal(visitSpiritSanctuary(restored),true);
 assert.equal(restored.spiritSanctuary.visited,true);
 assert.equal(spiritSanctuaryTracker(restored),'');
});

test('sanctuary is a capture-only zone on Dawn without bosses or cards',()=>{
 assert.equal(continentFor(SPIRIT_SANCTUARY_MAP),'dawn');
 assert.deepEqual(mapRules(SPIRIT_SANCTUARY_MAP),{
  capture:true,bosses:false,cards:false,
  summary:'契靈之地 · Lv.100 神話夥伴、忠誠100 · 可直接捕捉 · 無首領與卡片'
 });
 assert.equal(encounterLimit(SPIRIT_SANCTUARY_MAP),1);
 assert.equal(cardDropChance(SPIRIT_SANCTUARY_MAP,{boss:false}),0);
 assert.equal(SPIRIT_SANCTUARY_MONSTERS.length,4);
 assert.deepEqual(new Set(SPIRIT_SANCTUARY_MONSTERS.map(m=>m.id)),new Set(['fang','wisp','shell','sprout']));
 for(const m of SPIRIT_SANCTUARY_MONSTERS){assert.equal(m.level,100);assert.equal(m.xp,0);assert.equal(m.boss,undefined);}
});

test('captured sanctuary pet stays legitimate Lv100 mythic and loyalty100 after normalization',()=>{
 for(const m of SPIRIT_SANCTUARY_MONSTERS){
  const pet=blessSanctuaryPet(makePet(m.id));
  normalizePetLevel(pet);normalizeLoyalty(pet);
  assert.equal(pet.level,100);assert.equal(pet.rarity,'mythic');assert.equal(pet.ascended,true);
  assert.equal(pet.evolution,4);assert.equal(pet.loyalty,100);assert.equal(pet.loyaltyVersion,2);
  assert.ok(petStats(pet).hp>0);
 }
});

test('game connects quest, map, manual and automatic capture, and sanctuary blessing',()=>{
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 for(const token of ['spiritSanctuaryTracker(player)','announceSpiritSanctuary(player)','visitSpiritSanctuary(player)','blessSanctuaryPet(pet)','SPIRIT_SANCTUARY_MONSTERS','spiritSanctuaryUnlocked(player)'])assert.ok(game.includes(token),token);
 assert.match(game,/function autoCapturePet\(now\).*isCaptureSanctuary\(player.location\)/);
 assert.match(game,/if\(!isCaptureSanctuary\(player.location\)\)return toast/);
});
