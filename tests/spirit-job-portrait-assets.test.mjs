import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const files=["spiritCommander-second.webp","spiritCommander-reborn-second.webp","pactWarrior-second.webp","spiritist-reborn-first.webp","spiritCommander-third.webp","pactWarrior-third.webp","spiritist-first.webp","pactWarrior-reborn-second.webp"];
for(const name of files){
 const b=readFileSync(new URL('../dist/assets/spirit-jobs/'+name,import.meta.url));
 assert.equal(b.toString('ascii',0,4),'RIFF',name);
 assert.equal(b.toString('ascii',8,12),'WEBP',name);
 assert.equal(b.toString('ascii',12,16),'VP8X',name);
 assert.ok((b[20]&0x10)!==0,name+' must have alpha');
 const width=1+b.readUIntLE(24,3),height=1+b.readUIntLE(27,3);
 assert.deepEqual([width,height],[400,400],name);
}
const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
for(const key of ['spiritist-first','spiritist-reborn-first','pactWarrior','spiritCommander','-reborn-second','-third'])assert.ok(game.includes(key),key);
console.log(JSON.stringify({passed:true,portraits:files.length,dimensions:'400x400',alpha:true}));
