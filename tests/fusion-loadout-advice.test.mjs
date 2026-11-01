import test from 'node:test';
import assert from 'node:assert/strict';
import {fusionSkillLoadoutNotice} from '../dist/pet-abilities.js';

const fusion=(pair,slots)=>({fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]},equippedSkills:slots.map(i=>`fusion_${pair}_${i}`)});

test('pure defensive/healing fusion loadouts receive actionable advice without forced edits',()=>{
 const pet=fusion('defense-support',[1,4,5]);
 assert.match(fusionSkillLoadoutNotice(pet),/傷害不足/);
 assert.deepEqual(pet.equippedSkills,['fusion_defense-support_1','fusion_defense-support_4','fusion_defense-support_5']);
 assert.match(fusionSkillLoadoutNotice(fusion('defense-support',[1,2,5])),/^$/);
 assert.equal(fusionSkillLoadoutNotice(fusion('attack-magic',[1,2,4])), '');
 assert.match(fusionSkillLoadoutNotice(fusion('defense-support',[])),/尚未配置/);
 assert.equal(fusionSkillLoadoutNotice({equippedSkills:[]}), '');
});
