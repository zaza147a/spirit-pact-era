import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {bossCardHitBonus} from '../dist/boss-card-runtime.js';

const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const skill=source.slice(source.indexOf('function petAutoAbility('),source.indexOf('function tickDamageOverTime('));
assert.match(skill,/bossHitMeta=\{magical,critical:false,petId:pet\.id,range:'pet',skillId:skill\.id\}/);
assert.match(skill,/const damage=cardHit\(rolled\)/);
assert.match(skill,/cardHit\(hitDamage\(/,'splash hits must use the same card-aware attack');
assert.match(skill,/finally\{bossHitMeta=previous;\}/,'skill metadata must not leak into other attacks');

const cards={archon:{boss:true,map:'dawnrift'}};
const player={job:'spiritCommander',sockets:{rightHand:'archon'}};
for(const hit of [1,2,3]){
 const extra=bossCardHitBonus(player,cards,{now:hit*1000,source:'pet',petId:'only-pet',damage:100,magical:true,skillId:'main'});
 assert.equal(extra,hit===3?150:0);
}
console.log('PASS: commander skill and splash hits carry pet card metadata; exclusive card counts skill hits at 150%');
