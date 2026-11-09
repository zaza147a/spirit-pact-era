import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

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
});
