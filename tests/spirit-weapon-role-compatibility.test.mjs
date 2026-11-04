import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {GEAR_BASE} from '../dist/loot.js';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

for(const [job,weapon,primary] of [['pactWarrior','blade','atk'],['spiritCommander','oneStaff','matk']]){
 assert.equal(SECOND_JOBS[job].weapon,weapon);
 assert.ok(GEAR_BASE[weapon][primary]>0);
 assert.ok(GEAR_BASE[weapon].jobs.includes(job));
 assert.ok(!GEAR_BASE.mace.jobs.includes(job));
 const p=highLevelSpiritPlayer({level:210,job,pairKey:'attack-magic+attack-support'});
 assert.equal(p.gear.rightHand.id,weapon);
 assert.equal(p.gear.leftHand.id,'shield');
 assert.ok(Object.values(p.gear).filter(Boolean).every(g=>g.enhancement==='SSS'));
}
const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const transfer=game.slice(game.indexOf('function transferJob(target){'),game.indexOf('\nfunction ',game.indexOf('function transferJob(target){')+10));
assert.match(transfer,/player\.bag\.push\(player\.gear\.rightHand\)/,'轉職換武器必須保留舊武器');
assert.match(transfer,/if\(player\.sockets\.rightHand\)addCard\(player\.sockets\.rightHand\)/,'轉職換武器必須歸還舊卡片');
assert.match(transfer,/player\.gear\.rightHand=starter/,'新職轉職後必須穿戴指定武器');
console.log('Spirit one-hand sword/staff + shield, stat role and transfer inventory/card preservation contract passed');
