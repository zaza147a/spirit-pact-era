import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TRUE_FORMS,trueFormArt,trueFormName} from '../dist/pet-true-form.js';
import {petArt,petForm} from '../dist/pet-evolution.js';

test('all 36 fusion humanoid stages resolve to independent real WebP sprites and names',()=>{
 const fingerprints=new Set();
 const manifest=JSON.parse(readFileSync(new URL('../dist/assets/true-forms/stages-manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.assets.length,36);
 for(const key of Object.keys(TRUE_FORMS)){
  const [main,sub]=key.split('-');
  for(const [stage,folder,label] of [[1,'S','成長期人形'],[2,'SS','成熟期人形'],[3,'SSS','高階人形']]){
   const pet={trueForm:true,fusion:{main,sub},humanoidStage:stage};
   const expected=`assets/true-forms/${folder}/${key}.webp`;
   assert.equal(trueFormArt(pet),expected,key+'/'+folder);
   assert.equal(petArt(pet),expected,key+'/'+folder+' game art');
   assert.equal(trueFormName(pet),`${TRUE_FORMS[key]}・${label}`);
   assert.equal(petForm(pet),trueFormName(pet));
   const bytes=readFileSync(new URL('../dist/'+expected,import.meta.url));
   assert.equal(bytes.toString('ascii',0,4),'RIFF');
   assert.equal(bytes.toString('ascii',8,12),'WEBP');
   assert.ok(bytes.length>10000,key+'/'+folder+' needs a real raster image');
   const digest=createHash('sha256').update(bytes).digest('hex');
   const listing=manifest.assets.find(a=>a.id===key&&a.stage===folder);
   assert.equal(listing?.path,expected);
   assert.equal(listing?.sha256,digest,'manifest must track the actual stage file');
   assert.ok(!fingerprints.has(digest),key+'/'+folder+' must not reuse another stage image');
   fingerprints.add(digest);
  }
  const juvenile={trueForm:true,fusion:{main,sub}};
  assert.equal(trueFormArt(juvenile),`assets/true-forms/juvenile/${key}.webp`,'old saves retain child stage');
  assert.equal(trueFormName(juvenile),TRUE_FORMS[key]);
 }
 assert.equal(fingerprints.size,36);
});
