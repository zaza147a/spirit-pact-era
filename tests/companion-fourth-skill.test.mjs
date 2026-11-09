import test from 'node:test';
import assert from 'node:assert/strict';
import {FOURTH_SKILLS,fourthPair,fourthUnlocked,newFourthState,advanceFourthCharge,chargeFourth,consumeFourth,fourthOffense} from '../dist/companion-fourth-skill.js';
const pet={trueForm:true,humanoidStage:3,fusion:{main:'attack',sub:'defense'}};
const owner={job:'knight',dawnSigil:8,homecoming:{completedRoutes:{'attack-defense':true}}};
test('fourth slot requires completed route, SSS human form and sigil 8',()=>{
 assert.equal(fourthUnlocked(owner,pet),true);
 for(const p of [{...owner,homecoming:{}},{...owner,dawnSigil:7},{...owner,dawnSigil:undefined},{...owner,dawnSigil:NaN}])assert.equal(fourthUnlocked(p,pet),false);
 for(const p of [{...pet,trueForm:false},{...pet,humanoidStage:2},{...pet,fusion:null}])assert.equal(fourthUnlocked(owner,p),false);
});
test('reverse fusion shares unlock and skill, duplicate routes do not stack',()=>{
 const reverse={...pet,fusion:{main:'defense',sub:'attack'}};
 assert.equal(fourthPair(reverse),fourthPair(pet));assert.ok(fourthUnlocked(owner,reverse));
 assert.ok(fourthUnlocked({...owner,homecoming:{completedRoutes:{'defense-attack':true}}},pet));
 assert.equal(Object.keys(FOURTH_SKILLS).length,6);
});
test('both spirit jobs unlock the fourth slot after completing homecoming',()=>{
 for(const job of ['pactWarrior','spiritCommander'])assert.equal(fourthUnlocked({...owner,job},pet),true);
});
test('idle/dead time and delayed frames cannot bank unlimited charge',()=>{
 const s=newFourthState(0);advanceFourthCharge(s,20000,false);assert.equal(s.energy,0);
 advanceFourthCharge(s,120000,true);assert.equal(s.energy,4);
 advanceFourthCharge(s,119000,true);assert.equal(s.energy,4);
});
test('duplicate same-frame events and arbitrary events cannot produce extra charge',()=>{
 const s=newFourthState(0);assert.ok(chargeFourth(s,'attack-defense','charge',1000));
 assert.equal(chargeFourth(s,'attack-defense','charge',1000),false);
 assert.equal(chargeFourth(s,'attack-defense','pet',1400),false);assert.equal(s.energy,14);
 for(let n=0;n<100;n++)chargeFourth(s,'attack-defense','charge',2000+n*300);assert.equal(s.energy,100);
});
test('cast requires energy, cooldown and SP and consumes one charge',()=>{
 const s=newFourthState(0);assert.equal(consumeFourth(s,'attack-defense',1000,100),null);
 s.energy=100;assert.equal(consumeFourth(s,'attack-defense',NaN,100),null);assert.equal(consumeFourth(s,'attack-defense',1000,19),null);assert.equal(s.energy,100);
 assert.ok(consumeFourth(s,'attack-defense',1000,20));assert.equal(s.energy,0);assert.equal(s.casts,1);
 s.energy=100;assert.equal(consumeFourth(s,'attack-defense',2000,100),null);
 assert.equal(consumeFourth(s,'attack-defense',6000,100,false),null);assert.ok(consumeFourth(s,'attack-defense',6000,100));
});
test('guardian offense has a finite bound and invalid stat fields cannot amplify it',()=>{
 assert.equal(fourthOffense({def:1e12,mdef:1e12,atk:100,healPower:100},'defense-support'),240);
 assert.equal(fourthOffense({},'defense-support'),0);
});
