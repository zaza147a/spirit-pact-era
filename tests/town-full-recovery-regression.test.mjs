import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');

test('safe-town arrival restores protagonist HP and SP to maximum',()=>{
 assert.match(game,/function restoreTownPartyFully\(\)[\s\S]*?player\.hp=Math\.max\(1,stat\('hp'\)\);player\.mp=Math\.max\(0,stat\('mp'\)\)/);
});
test('safe-town arrival restores every companion HP and SP, even if awaiting revival',()=>{
 assert.match(game,/function restoreTownPartyFully\(\)[\s\S]*?for\(const pet of player\.pets\|\|\[\]\)\{[\s\S]*?pet\.hp=Math\.max\(1,maxima\.hp\);pet\.sp=Math\.max\(0,maxima\.sp\);[\s\S]*?delete pet\.reviveAt/);
});
test('ordinary town travel uses same full restore as revival and trials',()=>{
 assert.match(game,/function spawn\(\)[\s\S]*?if\(isTown\(player\.location\)\)\{restoreTownPartyFully\(\)/);
 assert.match(game,/function travel\(mapId\)[\s\S]*?player\.location=mapId;[\s\S]*?spawn\(\)/);
});
test('town arrival clears player revival countdown',()=>{
 assert.match(game,/function restoreTownPartyFully\(\)[\s\S]*?delete player\.reviveAt/);
});
