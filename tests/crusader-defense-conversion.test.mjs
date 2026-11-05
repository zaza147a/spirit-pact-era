import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';

test('crusader shield damage caps offensive DEF contribution at four times ATK',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(comparisonPlayer({level:210,job:'crusader'}));
 a.setup(p,{id:'world_191',hp:1e15,maxHp:1e15,atk:1,def:1,hit:1,flee:0,aspd:150});
 const atk=a.stat('atk'),def=a.stat('def'),effectiveDef=Math.min(def,atk*4);
 const holy=a.offensiveSource({source:'holyShield',kind:'physical'}),shield=a.offensiveSource({source:'shield',kind:'physical'});
 const sourceHoly=.85*atk+.15*effectiveDef,sourceShield=.8*atk+.2*effectiveDef;
 assert.ok(holy>0&&shield>0);
 assert.ok(Math.abs(holy/shield-sourceHoly/sourceShield)<1e-9);
 assert.equal(a.stat('def'),def,'defense stat stays intact');
});

test('non-shield physical source is unchanged by DEF conversion cap',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(comparisonPlayer({level:210,job:'crusader'}));
 a.setup(p,{id:'world_191',hp:1e15,maxHp:1e15,atk:1,def:1,hit:1,flee:0,aspd:150});
 assert.ok(a.offensiveSource({source:'holyShield',kind:'physical'})!==a.offensiveSource({source:'shield',kind:'physical'}));
 assert.equal(a.offensiveSource({kind:'physical'}),a.offensiveSource(null));
});
