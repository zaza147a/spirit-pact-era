import {readFileSync,writeFileSync} from 'node:fs';
import {ORIGINAL_60_MECHANICS,ORIGINAL_SIX_KEYS} from '../dist/original-60-mechanics.js';
import {ORIGINAL_EVENT_PACTS,THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';
import {SECOND_JOBS} from '../dist/jobs.js';
const code=readFileSync('dist/game.js','utf8'),rows=[];
for(const job of Object.keys(SECOND_JOBS))for(const pair of ORIGINAL_SIX_KEYS){
 const key=job+'/'+pair,desired=ORIGINAL_60_MECHANICS[key],actual=THIRD_FUSION_RULES[job][pair];
 if(!desired||!actual?.originalEvent)throw Error('Missing source-based pact '+key);
 const effects=Array.isArray(actual.originalEvent.payload)?actual.originalEvent.payload:[actual.originalEvent.payload];
 const supported=effects.every(effect=>code.includes("kind==='"+effect+"'"));
 const dedicated=!!ORIGINAL_EVENT_PACTS[key];
 const event=actual.events[0];
 const emittedByRuntime=event.startsWith('third')||code.includes("emitEvent('"+event+"'")||code.includes('emitEvent(effectEvent)')&&['heal','shield','buff','skill'].includes(event);
 rows.push({job,pair,originalText:desired.description,expectedTrigger:desired.event,actualTrigger:event,actions:effects,configured:supported&&emittedByRuntime,implementedBy:dedicated?'dedicated':'composed',behaviorallyVerified:false,
  missingProof:['real in-combat event preconditions','no-proc controls','repeated hits and cooldown','damage/benefit source attribution','playstyle tuning']});
}
const summary={total:rows.length,dedicated:rows.filter(r=>r.implementedBy==='dedicated').length,composed:rows.filter(r=>r.implementedBy==='composed').length,configured:rows.filter(r=>r.configured).length,behaviorallyVerified:0,warning:'Configuration and code-presence audit only; does not prove original 60 playstyle semantics'};
writeFileSync('docs/original-60-trigger-audit.json',JSON.stringify({summary,rows},null,2));
console.log('ORIGINAL 60 VNext IMPLEMENTATION AUDIT',JSON.stringify(summary));
if(summary.total!==60)throw Error('Source 60 pact matrix is incomplete');
