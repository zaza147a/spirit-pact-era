import test from 'node:test';
import assert from 'node:assert/strict';
import {petAttackIdentity,ownerAttackIdentity,compactAttackLabel,fusionEquipmentHint} from '../dist/attack-type-ui.js';
import {readFileSync} from 'node:fs';

test('fusion pets display their effective main attack channel',()=>{
 assert.equal(petAttackIdentity('magic').primary,'MATK');
 assert.equal(petAttackIdentity('attack').primary,'ATK');
 assert.equal(petAttackIdentity('support').type,'magic');
 assert.equal(petAttackIdentity('defense').type,'physical');
});
test('spirit before third job chooses attack type by the higher stat',()=>{
 assert.equal(ownerAttackIdentity('spiritist',false,100,200).type,'magic');
 assert.equal(ownerAttackIdentity('pactWarrior',false,200,100).type,'physical');
 assert.equal(ownerAttackIdentity('pactWarrior',false,200,200).type,'physical');
 assert.equal(ownerAttackIdentity('pactWarrior',true,300,200,'magic').type,'magic');
 assert.equal(ownerAttackIdentity('knight',true,100,200).type,'physical');
});
test('compact type labels use damage channel and near/far distance without numeric ATK',()=>{
 assert.equal(compactAttackLabel(petAttackIdentity('attack'),'melee'),'物理・近距');
 assert.equal(compactAttackLabel(petAttackIdentity('magic'),'ranged'),'魔法・遠距');
 assert.equal(compactAttackLabel(ownerAttackIdentity('crusader',true,5,10),'melee'),'物魔・近距');
 const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(source,/pet-role-row/);
 assert.match(source,/compactAttackLabel\(ownerStyle,playerRange\(player.job\)\)/);
 assert.doesNotMatch(source,/\$\{ownerStyle.primary\}/);
});
test('active companion rename is bound by pet identifier and guarded against character rename',()=>{
 const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(source,/dataset.renameTarget='pet'/);
 assert.match(source,/dataset.renameTarget==='pet'/);
 assert.match(source,/data-rename-active-pet/);
 assert.match(source,/stopImmediatePropagation\(\);openPetRename/);
});
test('80 percent fusion equipment carry-over is explicitly described as a temporary stat-affix conversion',()=>{
 assert.match(fusionEquipmentHint('magic',true),/固定ATK與STR詞條.*80%折算為MATK/);
 assert.match(fusionEquipmentHint('magic',true),/不包含夥伴原生ATK/);
 assert.match(fusionEquipmentHint('attack',true),/固定MATK與INT詞條.*80%折算為ATK/);
 assert.equal(fusionEquipmentHint('magic',false),'');
});
test('owner HUD, companion HUD, status screen and detail panel all show main damage type',()=>{
 const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(source,/ownerStyle=ownerAttackIdentity/);
 assert.match(source,/function petAttackBadge/);
 assert.match(source,/renderDualPetHud\(\).*petAttackBadge\(pet,stats\)/s);
 assert.match(source,/function renderActiveCompanion\(\).*fusionEquipmentHint/s);
});
