import assert from 'node:assert/strict';
import {commanderPetSkillForm} from '../dist/commander-pet-skill-forms.js';

const pet={fusion:{main:'attack',sub:'magic'},equippedSkills:['main','wide','finish']};
const player={job:'spiritCommander'};
for(const [index,name,count,primary,secondary] of [[0,'主攻',3,1.20,1.20],[1,'範圍',4,.95,.95],[2,'終結',2,1.80,.40]]){
 const form=commanderPetSkillForm(player,pet,{id:pet.equippedSkills[index],kind:'magic'});
 assert.equal(form.name,name);
 assert.equal(form.targets,count);
 assert.equal(form.primary,primary);
 assert.equal(form.secondary,secondary);
 if(index<2)assert.equal(form.secondary,form.primary,'main/area must not have secondary-target falloff');
 else assert.ok(form.secondary<form.primary,'finisher must have secondary-target falloff');
}
assert.equal(commanderPetSkillForm(player,pet,{id:'wide',kind:'heal'}).name,'範圍');
assert.equal(commanderPetSkillForm({job:'pactWarrior'},pet,{id:'main',kind:'magic'}),null);
assert.equal(commanderPetSkillForm(player,{...pet,fusion:null},{id:'main',kind:'magic'}),null);
const reordered={...pet,equippedSkills:['finish','main','wide']};
assert.equal(commanderPetSkillForm(player,reordered,{id:'main',kind:'strike'}).name,'範圍');
console.log('PASS: Commander fusion pet skill slots reshape main/wide/finisher independently');
