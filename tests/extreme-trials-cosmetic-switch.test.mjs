import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {EXTREME_MANTLE_CATALOG,EXTREME_MANTLE_V2_READY,extremeMantleArt} from '../dist/extreme-mantle-catalog.js';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');

test('切換天穹、金幣、舊階時裝會撤下極限戰袍，避免舊立繪覆蓋新選擇',()=>{
 assert.match(game,/chooseTowerCostume\(player,[^;]+;\s*if\(player\.towerCostume==='frost'\)player\.extremeSelectedMantle=null/);
 assert.match(game,/if\(outfit&&player\[key\]\)\{player\.towerCostume=null;player\.extremeSelectedMantle=null;\}/);
 assert.match(game,/if\(outfit\)\{player\.towerCostume=null;player\.extremeSelectedMantle=null;\}/);
 assert.match(game,/if\(player\.selectedOutfit\)player\.extremeSelectedMantle=null/);
 assert.match(game,/extremeSelectedMantle:player\.extremeSelectedMantle/);
});

test('四王八張背景、四首領與48件獨立戰袍實體素材皆存在',()=>{
 for(const kind of ['atk','matk','hp','clear']){
  for(const asset of [`boss-${kind}.webp`,`background-${kind}-milestone.webp`,`background-${kind}-collector.webp`])
   assert.ok(existsSync(new URL(`../dist/assets/extreme/${asset}`,import.meta.url)),asset);
 }
 assert.equal(EXTREME_MANTLE_CATALOG.length,48);
 assert.equal(new Set(EXTREME_MANTLE_V2_READY).size,48);
 for(const entry of EXTREME_MANTLE_CATALOG){
  const filename=`${entry.kind}-${entry.job}.webp`;
  const asset=new URL(`../dist/assets/extreme/mantles-v2/${filename}`,import.meta.url);
  assert.ok(existsSync(asset),filename);
  assert.equal(extremeMantleArt(entry.job,entry.kind),`assets/extreme/mantles-v2/${filename}`);
  const bytes=readFileSync(asset);
  assert.equal(bytes.toString('ascii',0,4),'RIFF',filename);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',filename);
  const format=bytes.toString('ascii',12,16);
  if(format==='VP8X'){
   assert.ok((bytes[20]&0x10)!==0,`${filename} must preserve transparency`);
   assert.equal(bytes.readUIntLE(24,3)+1,1024,filename);
   assert.equal(bytes.readUIntLE(27,3)+1,1536,filename);
  }else{
   assert.equal(format,'VP8L',`${filename} must be extended or lossless WebP`);
   assert.equal(bytes[20],0x2f,filename);
   const dimensions=bytes.readUInt32LE(21);
   assert.ok((dimensions>>>28)&1,`${filename} must preserve transparency`);
   assert.equal((dimensions&0x3fff)+1,1024,filename);
   assert.equal(((dimensions>>>14)&0x3fff)+1,1536,filename);
  }
 }
});
