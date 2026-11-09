import test from 'node:test';
import assert from 'node:assert/strict';
import {rollGear,GEAR_BASE,gearTier} from '../dist/loot.js';
import {initializeWeaponCompensation,compensationWeaponOptions,compensationNormalKeys,compensationSpecialKeys,claimWeaponCompensation,compensationCanCorrect,claimWeaponCompensationCorrection} from '../dist/weapon-compensation.js';

const choice=id=>({regular:compensationNormalKeys(id).slice(0,5),special:compensationSpecialKeys('mythic')[0]});
test('legacy 190/200 weapon produces one durable reward eligibility',()=>{
 const p={job:'assassin',gear:{rightHand:rollGear('katar',200,'mythic')},bag:[]};
 p.gear.rightHand.enhancement='SS';
 assert.equal(initializeWeaponCompensation(p).state,'pending');
 assert.deepEqual(p.weaponCompensation.proof,{level:200,rarity:'mythic',enhancement:'SS'});
 const options=compensationWeaponOptions(p.job);
 assert.ok(options.some(w=>w.id==='dualDagger'));
 assert.ok(options.some(w=>w.id==='katar'));
 const received=claimWeaponCompensation(p,{id:'dualDagger',main:choice('rifle'),offhand:choice('offDagger')});
 assert.equal(received.length,2);
 assert.deepEqual(received.map(g=>g.id),['rifle','offDagger']);
 assert.ok(received.every(g=>g.enhancement==='SS'&&g.level===200&&g.rarity==='mythic'));
 assert.equal(received[0].tier,gearTier(200));
 assert.equal(p.weaponCompensation.state,'claimed');
 assert.throws(()=>claimWeaponCompensation(p,{id:'katar',main:choice('katar')}),/沒有可領取/);
});
test('ineligible legacy character stays ineligible even when later gaining 200 equipment',()=>{
 const p={job:'hunter',gear:{rightHand:rollGear('shortBow',180,'legendary')},bag:[]};
 assert.equal(initializeWeaponCompensation(p).state,'ineligible');
 p.bag.push(rollGear('longBow',200,'mythic'));
 assert.equal(initializeWeaponCompensation(p).state,'ineligible');
});
test('rejects cross-class, duplicates, illegal specials, and non-mythic special',()=>{
 const p={job:'wizard',gear:{rightHand:rollGear('twoStaff',190,'mythic')},bag:[]};
 initializeWeaponCompensation(p);
 assert.throws(()=>claimWeaponCompensation(p,{id:'katar',main:choice('katar')}),/其他職業/);
 assert.throws(()=>claimWeaponCompensation(p,{id:'oneStaff',main:{regular:['matk','hit','INT','INT','DEX'],special:'crit'}}),/詞條/);
 assert.throws(()=>claimWeaponCompensation(p,{id:'oneStaff',main:{...choice('oneStaff'),special:'ignoreDef'}}),/特殊詞條/);
 const low={job:'knight',gear:{rightHand:rollGear('twoSword',190,'legendary')},bag:[]};
 initializeWeaponCompensation(low);
 assert.throws(()=>claimWeaponCompensation(low,{id:'twoSpear',main:{regular:compensationNormalKeys('twoSpear').slice(0,5),special:'crit'}}),/不可使用/);
});
test('class weapon choices are based on actual equip legality',()=>{
 for(const job of ['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer']){
  const opts=compensationWeaponOptions(job);
  assert.ok(opts.length>0,job);
  for(const o of opts.filter(o=>o.id!=='dualDagger'))assert.ok(GEAR_BASE[o.id].jobs.includes(job));
 }
 assert.deepEqual(compensationWeaponOptions('monk').map(w=>w.id),['knuckles']);
 assert.ok(!compensationWeaponOptions('rogue').some(w=>w.id==='katar'));
});
test('selected STR/VIT/LUK and ASPD special are granted exactly, then corrected once with a second weapon',()=>{
 const p={job:'crusader',gear:{rightHand:rollGear('oneSpear',200,'mythic')},bag:[]};
 initializeWeaponCompensation(p);
 const wanted={id:'oneSpear',main:{regular:['atk','hit','STR','VIT','LUK'],special:'aspdPct'}};
 const first=claimWeaponCompensation(p,wanted)[0];
 assert.deepEqual(Object.keys(first.affixes),['atk','hit','STR','VIT','LUK','aspdPct']);
 assert.ok(!('crit' in first.affixes));
 assert.ok(!('AGI' in first.affixes));
 assert.ok(!('INT' in first.affixes));
 assert.ok(compensationCanCorrect(p));
 const replacement=claimWeaponCompensationCorrection(p,wanted)[0];
 assert.notEqual(replacement.uid,first.uid);
 assert.deepEqual(replacement.affixes,first.affixes);
 assert.equal(p.bag.length,2);
 assert.equal(p.bag[0],first);
 assert.equal(p.weaponCompensation.reward[0],first.uid);
 assert.equal(p.weaponCompensation.correctionReward[0],replacement.uid);
 assert.equal(compensationCanCorrect(p),false);
 assert.throws(()=>claimWeaponCompensationCorrection(p,wanted),/沒有可領取/);
});
test('invalid compensation selection leaves inventory and eligibility intact',()=>{
 const p={job:'crusader',gear:{rightHand:rollGear('oneSpear',200,'mythic')},bag:[]};
 initializeWeaponCompensation(p);
 const before=structuredClone(p.weaponCompensation);
 assert.throws(()=>claimWeaponCompensation(p,{id:'oneSpear',main:{regular:['atk','hit','STR','STR','LUK'],special:'aspdPct'}}),/詞條/);
 assert.deepEqual(p.bag,[]);
 assert.deepEqual(p.weaponCompensation,before);
});
