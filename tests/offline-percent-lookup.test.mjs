import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {enhancedAffixes,enhancedStat,ENHANCEMENT_RANKS} from '../dist/sky-trials.js';

test('single enhanced percentage lookup equals the full-affixes computation for every rank',()=>{
 for(const enhancement of [null,...ENHANCEMENT_RANKS])for(const id of ['oneStaff','petHead','armor']){
  const gear={id,level:200,enhancement,affixes:{hpPct:16.13,defPct:5.7,fleePct:3.25,atk:137,matk:221}};
  const full=enhancedAffixes(gear);
  for(const key of ['hpPct','defPct','fleePct','critDmg','missing']){
   assert.equal(enhancedStat(gear,key,gear.affixes?.[key]||0),full[key]||0,`${id} ${enhancement} ${key}`);
  }
 }
});

test('offline percent hot path only evaluates requested affix, keeping standard gear power formula',()=>{
 const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(source,/const percent=t=>equipped\.reduce\(\(n,item\)=>n\+enhancedStat\(item,t,item\?\.affixes\?\.\[t\]\|\|0\),0\)\/100/);
 assert.doesNotMatch(source,/const percent=t=>[^\n]*enhancedAffixes\(item\)/);
});
