import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {TOWER_FROST_JOBS,towerFrostUnlocked,normalizeTowerCostume,towerFrostArt,chooseTowerCostume} from '../dist/tower-costumes.js';

test('each of twelve jobs has one exclusive noncombat outfit',()=>{
 assert.equal(TOWER_FROST_JOBS.length,12);
 assert.equal(new Set(TOWER_FROST_JOBS).size,12);
 for(const job of TOWER_FROST_JOBS)assert.match(towerFrostArt(job),new RegExp(`outfit-${job}-frost\\.webp`));
 assert.equal(towerFrostArt('acolyte'),null);
});

test('only a third-job character who cleared floor 30 can wear its frost costume',()=>{
 const player={job:'priest',thirdJob:true,towerProgress:{highest:29},selectedOutfit:'SSS',cosmeticOutfit:'priest-0'};
 assert.equal(towerFrostUnlocked(player),false);
 assert.equal(chooseTowerCostume(player,'frost'),false);
 player.towerProgress.highest=30;
 assert.equal(towerFrostUnlocked(player),true);
 assert.equal(chooseTowerCostume(player,'frost'),true);
 assert.equal(player.towerCostume,'frost');
 assert.equal(player.selectedOutfit,null);
 assert.equal(player.cosmeticOutfit,null);
 assert.equal(chooseTowerCostume(player,null),true);
 assert.equal(player.towerCostume,null);
});

test('imported or obsolete invalid costume selections are sanitized',()=>{
 const old={job:'priest',thirdJob:false,towerProgress:{highest:100},towerCostume:'frost'};
 assert.equal(normalizeTowerCostume(old),null);
 old.thirdJob=true;
 old.towerCostume='invalid';
 assert.equal(normalizeTowerCostume(old),null);
 old.towerCostume='frost';
 assert.equal(normalizeTowerCostume(old),'frost');
 old.towerProgress.highest=0;
 assert.equal(normalizeTowerCostume(old),null);
});

test('selecting normal rank or gold costumes suppresses the tower skin',()=>{
 const character={job:'monk',thirdJob:true,towerProgress:{highest:30},towerCostume:'frost'};
 assert.equal(normalizeTowerCostume(character),'frost');
 character.selectedOutfit='SSS';
 assert.equal(normalizeTowerCostume(character),null);
 character.selectedOutfit=null;
 character.towerCostume='frost';
 character.cosmeticOutfit='monk-0';
 assert.equal(normalizeTowerCostume(character),null);
});

test('game includes wardrobe controls and matching character/home and lobby portraits',()=>{
 const script=readFileSync(fileURLToPath(new URL('../dist/game.js',import.meta.url)),'utf8');
 for(const part of ['renderTowerCostumeGallery()','data-tower-costume','towerFrostArt(character.job)','towerFrostArt(player.job)','chooseTowerCostume(player,']){
  assert.ok(script.includes(part),`missing tower-costume UI link: ${part}`);
 }
 assert.match(script,/if\(outfit&&player\[key\]\)player\.towerCostume=null/);
});
