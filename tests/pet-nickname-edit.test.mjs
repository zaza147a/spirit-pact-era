import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runtime} from './runtime31-helper.mjs';

test('active companion and pet management both expose rename controls',()=>{
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/id="renamePetBtn" title="點擊更改夥伴暱稱"/);
 assert.match(game,/data-rename-pet="\$\{p\.id\}"/);
 assert.match(game,/querySelectorAll\('\[data-rename-pet\]'\)/);
 assert.match(game,/function openPetRename\(id\)/);
 assert.match(game,/const petId=\$\('renameModal'\)\.dataset\.petId/);
 assert.match(game,/pet\.nickname=name;pet\.customNickname=true/);
});

test('custom companion nickname survives legal save normalization without altering form',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('暱稱測試','swordsman'));
 const pet=c.makePet('fang');pet.id='nickname-fixture';pet.nickname='我的專屬夥伴';pet.customNickname=true;
 p.pets.push(pet);p.activePetId=pet.id;
 const restored=a.normalize(p);
 const q=restored.pets.find(x=>x.id===pet.id);
 assert.equal(q.nickname,'我的專屬夥伴');
 assert.equal(q.customNickname,true);
 assert.equal(q.species,pet.species);
 assert.equal(a.valid(restored),true);
});
