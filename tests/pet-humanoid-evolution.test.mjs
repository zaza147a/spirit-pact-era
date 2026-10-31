import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceHumanoidEvolution,humanoidStage,humanoidEquipmentRank} from '../dist/pet-humanoid-evolution.js';
const pet=(rank='S')=>({fusion:{main:'attack',sub:'magic'},trueForm:true,gear:Object.fromEntries(['head','body','shoes'].map(slot=>[slot,{uid:slot,enhancement:rank}]))});
test('loyalty true form is mandatory',()=>{const p=pet('SSS');p.trueForm=false;assert.equal(advanceHumanoidEvolution(p).changed,false);assert.equal(humanoidStage(p),0);});
test('evolution only when all three slots are ready',()=>{const p=pet('S');p.gear.shoes.enhancement='A';assert.equal(humanoidEquipmentRank(p),'A');assert.equal(advanceHumanoidEvolution(p).changed,false);});
test('permanent stages advance S, SS, SSS only in order',()=>{const p=pet('S');assert.equal(advanceHumanoidEvolution(p).stage,1);p.gear.head.enhancement='SS';p.gear.body.enhancement='SS';p.gear.shoes.enhancement='SS';assert.equal(advanceHumanoidEvolution(p).stage,2);for(const item of Object.values(p.gear))item.enhancement='SSS';assert.equal(advanceHumanoidEvolution(p).stage,3);p.gear.shoes=null;assert.equal(advanceHumanoidEvolution(p).stage,3);});
test('no jumping stages even with all SSS equipment',()=>{const p=pet('SSS');assert.equal(advanceHumanoidEvolution(p).stage,1);assert.equal(advanceHumanoidEvolution(p).stage,2);assert.equal(advanceHumanoidEvolution(p).stage,3);});
