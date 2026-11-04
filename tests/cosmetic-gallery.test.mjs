import test from 'node:test';
import assert from 'node:assert/strict';
import {COSMETIC_JOBS,COSMETIC_BACKGROUNDS,COSMETIC_OUTFIT_PRICES,cosmeticOutfitArt,cosmeticBackgroundArt,readCosmeticCollection,normalizeCosmeticSelection,buyCosmetic,cosmeticWealth} from '../dist/cosmetic-gallery.js';

const fresh=()=>({job:'assassin',thirdJob:true,outfitUnlocks:['S','SS','SSS'],gold:400_000_000,bag:[{id:'gold_bar',qty:40}]});
const empty=()=>({outfits:[],backgrounds:[]});
test('every job has three unique, separately addressed SSS illustrations',()=>{
 assert.equal(Object.keys(COSMETIC_JOBS).length,12);
 assert.equal(new Set(Object.values(COSMETIC_JOBS).flat()).size,36);
 assert.equal(COSMETIC_OUTFIT_PRICES.length,3);
 for(const [job,names] of Object.entries(COSMETIC_JOBS))for(let i=0;i<3;i++){
  assert.ok(names[i]);assert.match(cosmeticOutfitArt(job,i),new RegExp(`fixed-${job}-${i}\\.webp$`));
 }
 assert.equal(COSMETIC_BACKGROUNDS.length,8);
 for(const bg of COSMETIC_BACKGROUNDS)assert.match(cosmeticBackgroundArt(bg.id),/\.webp$/);
});
test('gold-bar change and shared unlock are exact',()=>{
 const p=fresh(),before=cosmeticWealth(p);
 const result=buyCosmetic(p,empty(),'outfit','assassin-1');
 assert.equal(result.error,undefined);
 assert.equal(before-cosmeticWealth(p),1_500_000_000);
 assert.deepEqual(result.collection.outfits,['assassin-1']);
 assert.ok(p.gold>=0&&p.gold<1_000_000_000);
 assert.equal(buyCosmetic(p,result.collection,'outfit','assassin-1').error,'已收藏');
});
test('only the relevant SSS class can buy outfit; backgrounds can be bought by anyone',()=>{
 const p=fresh();p.thirdJob=false;
 assert.match(buyCosmetic(p,empty(),'outfit','assassin-0').error,/三轉/);
 assert.match(buyCosmetic(p,empty(),'outfit','knight-0').error,/三轉/);
 assert.equal(buyCosmetic(p,empty(),'background','gold').price,250_000_000);
});
test('selection is sanitized against ownership, class and rank',()=>{
 const p=fresh();p.cosmeticOutfit='assassin-1';p.cosmeticBackground='gold';p.cosmeticBrightness=999;
 normalizeCosmeticSelection(p,{outfits:['assassin-1'],backgrounds:['gold']});
 assert.equal(p.cosmeticOutfit,'assassin-1');assert.equal(p.cosmeticBrightness,100);
 p.job='wizard';normalizeCosmeticSelection(p,{outfits:['assassin-1'],backgrounds:['gold']});assert.equal(p.cosmeticOutfit,null);
});
test('collection parser refuses bogus identifiers and duplicate unlocks',()=>{
 const storage={getItem:()=>JSON.stringify({outfits:['assassin-1','assassin-1','missing-1','assassin-3'],backgrounds:['gold','gold','unknown']})};
 assert.deepEqual(readCosmeticCollection(storage),{outfits:['assassin-1'],backgrounds:['gold']});
});

test('two new third jobs have three gold costumes each',()=>{
 for(const job of ['pactWarrior','spiritCommander']){
  assert.equal(COSMETIC_JOBS[job].length,3);
  for(let i=0;i<3;i++)assert.equal(cosmeticOutfitArt(job,i),`assets/cosmetics/fixed-${job}-${i}.webp`);
 }
});
