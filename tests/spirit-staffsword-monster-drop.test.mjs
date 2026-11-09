import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GEAR_BASE,rollGear} from '../dist/loot.js';

const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const dropLine=source.split('\n').find(line=>line.includes('const gearDrop=equipmentDrop('));
assert.ok(dropLine,'monster equipment drop handler exists');
const pools=[...dropLine.matchAll(/slotChoices=level<10\?(\[[^\]]+\]):level<20\?(\[[^\]]+\]):(\[[^\]]+\])/g)];
assert.equal(pools.length,1,'all three level-based monster drop pools are present');
for(const pool of pools[0].slice(1))assert.ok(pool.includes("'staffSword'"),'staffSword is available at every monster level');
assert.ok(dropLine.includes('enemy.boss?bossRarity():null'),'boss rarity logic remains unchanged');
assert.deepEqual(GEAR_BASE.staffSword.jobs,['spiritist','pactWarrior','spiritCommander']);
for(const level of [1,19,100,200]){
 const gear=rollGear('staffSword',level,level===200?'mythic':null,()=>.5);
 assert.equal(gear.id,'staffSword');
 assert.equal(gear.level,level);
 assert.ok(gear.affixes.atk>0&&gear.affixes.matk>0);
}
console.log('StaffSword available in all monster drop pools, including bosses; legal gear generated');
