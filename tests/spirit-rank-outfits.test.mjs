import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const jobs=['pactWarrior','spiritCommander'];
const ranks=['S','SS','SSS'];
const game=readFileSync(resolve(root,'dist/game.js'),'utf8');
const outfit=readFileSync(resolve(root,'dist/rank-outfits.js'),'utf8');
const html=readFileSync(resolve(root,'dist/index.html'),'utf8');
const sprite=game.slice(game.indexOf('function spriteHtml('),game.indexOf('function spriteHtml(')+1100);
assert.ok(sprite.indexOf('rankOutfitArt(id,outfit)')>=0,'rank outfit branch missing');
assert.ok(sprite.indexOf('rankOutfitArt(id,outfit)')<sprite.indexOf('if(spiritPortrait)return'),'rank outfit must precede default portrait');
for(const job of jobs){
  assert.ok(outfit.includes(job+':{'),'missing rank outfit metadata: '+job);
  for(const rank of ranks){
    const name=job+'-'+rank+'.webp';
    const b=readFileSync(resolve(root,'dist/assets/rank-outfits',name));
    assert.equal(b.toString('ascii',0,4),'RIFF',name);
    assert.equal(b.toString('ascii',8,12),'WEBP',name);
    assert.equal(b.toString('ascii',12,16),'VP8X',name);
    assert.ok((b[20]&0x10)!==0,name+' must have alpha');
    const width=1+b.readUIntLE(24,3),height=1+b.readUIntLE(27,3);
    assert.deepEqual([width,height],[512,768],name);
  }
}
assert.ok(html.includes('6.5.0-spirit-20261104'),'index.html cache-bust missing');
console.log('Spirit rank outfits: 6 WEBP files, alpha, 512x768, metadata and rendering priority PASS');
