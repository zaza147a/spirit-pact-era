import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const asset=name=>fileURLToPath(new URL(`../dist/assets/tower/${name}`,import.meta.url));

test('first three tower backgrounds exist as standalone WebP assets',()=>{
 for(const name of ['background-dawn.webp','background-flame.webp','background-frost.webp']){
  const bytes=readFileSync(asset(name));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length<450_000,`${name} should be compressed for the web`);
 }
});

test('first nine frozen costumes have independent alpha-capable WebP files',()=>{
 const buffers=['outfit-crusader-frost.webp','outfit-knight-frost.webp','outfit-wizard-frost.webp','outfit-sage-frost.webp','outfit-assassin-frost.webp','outfit-rogue-frost.webp','outfit-priest-frost.webp','outfit-monk-frost.webp','outfit-hunter-frost.webp'].map(name=>readFileSync(asset(name)));
 for(const bytes of buffers){
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length>100_000);
 }
 assert.equal(new Set(buffers.map(b=>b.toString('base64'))).size,9);
});
