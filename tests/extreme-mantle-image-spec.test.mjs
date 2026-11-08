import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {EXTREME_MANTLE_V2_READY} from '../dist/extreme-mantle-catalog.js';

// RIFF/WebP VP8X extended header contains the canvas width and height, minus 1.
function webpSize(file){
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 let cursor=12;
 while(cursor+8<=bytes.length){
  const type=bytes.toString('ascii',cursor,cursor+4);
  const len=bytes.readUInt32LE(cursor+4);
  if(type==='VP8X'){
   const w=1+bytes.readUIntLE(cursor+12,3);
   const h=1+bytes.readUIntLE(cursor+15,3);
   return [w,h];
  }
  cursor+=8+len+(len%2);
 }
 throw new Error(`Missing VP8X in ${file}`);
}

test('all V2 mantle artworks use the same 1024×1536 canvas',()=>{
 for(const id of EXTREME_MANTLE_V2_READY){
  const dash=id.replace('_','-');
  const file=path.resolve('dist/assets/extreme/mantles-v2',`${dash}.webp`);
  assert.deepEqual(webpSize(file),[1024,1536],id);
 }
});
