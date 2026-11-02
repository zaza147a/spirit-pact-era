import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fusionKey,FUSION_PAIRS,companionRole,fusionSkills,defaultFusionSkills,fusionArt} from '../dist/pet-fusion.js';
import {migratePetSkills} from '../dist/pet-abilities.js';
const roles=['attack','magic','defense','support'];
for(let i=0;i<roles.length;i++)for(let j=i+1;j<roles.length;j++){
 const a=roles[i],b=roles[j];
 test(`fusion ${a}+${b} equals reverse order in all mechanics, not appearance`,()=>{
  const first={fusion:{main:a,sub:b}},reverse={fusion:{main:b,sub:a}};
  assert.equal(fusionKey(a,b),fusionKey(b,a));
  for(const prop of ['role','hp','def','attack'])assert.equal(FUSION_PAIRS[a+'-'+b][prop],FUSION_PAIRS[b+'-'+a][prop]);
  assert.deepEqual(fusionSkills(first),fusionSkills(reverse));
  assert.deepEqual(defaultFusionSkills(first),defaultFusionSkills(reverse));
  assert.equal(companionRole(first),companionRole(reverse));
  assert.notEqual(fusionArt(first),fusionArt(reverse));
 });
 test(`saved reverse-order ${b}+${a} skills migrate by index`,()=>{
  const pet={fusion:{main:b,sub:a},equippedSkills:[`fusion_${b}-${a}_0`,`fusion_${b}-${a}_2`,`fusion_${b}-${a}_5`]};
  migratePetSkills(pet,companionRole(pet));
  assert.deepEqual(pet.equippedSkills,[0,2,5].map(i=>`fusion_${fusionKey(a,b)}_${i}`));
 });
}
const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
test('trial defeat immediately heals and returns home without revival modal, while preventing late enemy turns',()=>{
 assert.match(game,/function exitTrial\(reason='離開試煉'\)[\s\S]*?window\.alert\('挑戰失敗！/);
 assert.match(game,/if\(trialAtTick&&!player\.trialRun\)return/);
 assert.match(game,/delete player\.reviveAt/);
 assert.match(game,/player\.location='skycity'/);
});
test('town revival bypasses cooldown; only local revival checks remaining time',()=>{
 assert.match(game,/if\(mode==='place'&&deathRemaining\(player,gameNow\(\)\)\)/);
 assert.match(game,/\$\('reviveTown'\)\.disabled=false/);
 assert.match(game,/if\(mode==='town'\)delete pet\.reviveAt/);
});
