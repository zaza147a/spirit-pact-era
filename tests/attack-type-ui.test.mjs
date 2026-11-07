import test from 'node:test';
import assert from 'node:assert/strict';
import {petAttackIdentity,ownerAttackIdentity,compactAttackLabel,fusionEquipmentHint} from '../dist/attack-type-ui.js';
import {readFileSync} from 'node:fs';
import {bindHeroRename} from '../dist/hero-rename.js';

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
 assert.match(source,/bindHeroRename\(document/);
});
test('spirit professions render the same single-companion card fields as other professions',()=>{
 const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 const spiritHud=source.match(/function renderDualPetHud\(\)\{([\s\S]*?)\n\}/)?.[1];
 assert.ok(spiritHud);
 assert.doesNotMatch(spiritHud,/dual-pet-hud|dual-pet-unit|roster\.map/);
 for(const field of ['ACTIVE COMPANION','pet-form','pet-role-row','夥伴 HP','夥伴 SP','夥伴護盾','evolution-ready','data-rename-active-pet']){
  assert.ok(spiritHud.includes(field),`single-companion field missing: ${field}`);
 }
});
test('rename responds to pointerdown before a rapidly re-rendered button disappears',()=>{
 const handlers={},calls=[];
 const document={addEventListener:(type,handler,capture)=>{assert.equal(capture,true);handlers[type]=handler;}};
 bindHeroRename(document,{character:()=>calls.push('character'),pet:id=>calls.push('pet:'+id),activePet:()=>calls.push('active')});
 const button=(id,data)=>({id,hasAttribute:k=>k==='data-rename-active-pet'&&!!data,dataset:{renameActivePet:data}});
 const event=(target,detail=1)=>({target:{closest:()=>target},button:0,detail,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}});
 const petButton=button('', 'pet-42');
 const down=event(petButton);
 handlers.pointerdown(down);
 assert.deepEqual(calls,['pet:pet-42']);
 assert.equal(down.prevented,true);
 // The original click may never fire because the HUD was rebuilt.
 handlers.pointerdown(event(button('renameCharacterBtn')));
 assert.deepEqual(calls,['pet:pet-42','character']);
 handlers.click(event(petButton));
 assert.equal(calls.length,2,'pointer-generated click must not fire twice');
 handlers.click(event(button('renamePetBtn'),0));
 assert.deepEqual(calls,['pet:pet-42','character','active']);
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
