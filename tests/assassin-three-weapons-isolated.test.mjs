import test from 'node:test';
import assert from 'node:assert/strict';

// Standalone formula reproduction; no production game code modified.
const incoming = (attack, def) => Math.max(1, Math.round(attack * 500 / (500 + def)));
const attackInterval = aspd => Math.max(140,Math.round((200-Math.min(193,Math.max(100,aspd)))*20));
const affixRange = (primary, tier, quality=1.72) => {
 const value = (primary==='atk'?12:primary==='def'?5:14) * 2**(tier-1) * quality;
 return [Math.ceil(value*.98), Math.ceil(value*1.02)];
};
const midpoint = pair => (pair[0]+pair[1])/2;
const skillAllowed = (weapons,right,left) => !weapons.length || weapons.some(w => w==='dual' ? right==='dagger'&&left==='dagger' : right===w);

test('current dagger + shield build is not a dual-wield weapon',()=>{
 assert.equal(skillAllowed(['dual','katar'],'dagger',null),false);
 assert.equal(skillAllowed([],'dagger',null),true);
 assert.equal(skillAllowed(['dual','katar'],'dagger','dagger'),true);
 assert.equal(skillAllowed(['dual','katar'],'katar',null),true);
});
test('current high-tier shield gives a dramatic defense gain',()=>{
 const shield = midpoint(affixRange('def',11));
 const noShield = incoming(15000,1000);
 const withShield = incoming(15000,1000+shield);
 const reduction = 1-withShield/noShield;
 assert.ok(reduction>.8 && reduction<.9);
 console.log(JSON.stringify({shieldDef:shield,noShield,withShield,reduction:Math.round(reduction*10000)/100+'%'}));
});
test('three builds have different existing gear and speed tradeoffs',()=>{
 const main = midpoint(affixRange('atk',11));
 const shield = midpoint(affixRange('def',11));
 const builds = [
  {name:'dual-daggers',weaponAttack:main*2,shieldDef:0,aspd:193},
  {name:'katar',weaponAttack:main,shieldDef:0,aspd:190},
  {name:'dagger-shield',weaponAttack:main,shieldDef:shield,aspd:193}
 ];
 assert.ok(builds[0].weaponAttack > builds[1].weaponAttack);
 assert.ok(builds[2].shieldDef > builds[0].shieldDef);
 assert.ok(attackInterval(builds[1].aspd)>attackInterval(builds[0].aspd));
 console.log(JSON.stringify(builds));
});
