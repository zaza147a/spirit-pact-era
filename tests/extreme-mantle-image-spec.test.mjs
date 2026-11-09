import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {EXTREME_MANTLE_V2_READY} from '../dist/extreme-mantle-catalog.js';

// Both extended VP8X and lossless VP8L are valid alpha-capable WebP containers.
function webpSize(file){
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 let cursor=12;
 while(cursor+8<=bytes.length){
  const type=bytes.toString('ascii',cursor,cursor+4);
  const len=bytes.readUInt32LE(cursor+4);
  if(type==='VP8X'){
   assert.ok(bytes[cursor+8]&0x10,`${file} is missing the VP8X alpha flag`);
   const w=1+bytes.readUIntLE(cursor+12,3);
   const h=1+bytes.readUIntLE(cursor+15,3);
   return [w,h];
  }
  if(type==='VP8L'){
   assert.equal(bytes[cursor+8],0x2f,`${file} is missing the VP8L signature`);
   const dimensions=bytes.readUInt32LE(cursor+9);
   assert.ok((dimensions>>>28)&1,`${file} is missing the VP8L alpha flag`);
   return [1+(dimensions&0x3fff),1+((dimensions>>>14)&0x3fff)];
  }
  cursor+=8+len+(len%2);
 }
 throw new Error(`Missing VP8X/VP8L in ${file}`);
}

test('all V2 mantle artworks use the same 1024×1536 canvas',()=>{
 for(const id of EXTREME_MANTLE_V2_READY){
  const dash=id.replace('_','-');
  const file=path.resolve('dist/assets/extreme/mantles-v2',`${dash}.webp`);
  assert.deepEqual(webpSize(file),[1024,1536],id);
 }
});
