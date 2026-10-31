// Audit only: original gameplay semantics versus actually wired events.
// This does not mark gameplay mechanics as implemented solely because the numbers differ.
import {readFileSync,writeFileSync} from 'node:fs';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';
const source=readFileSync('docs/original-60-resonance-acceptance.md','utf8');
const lines=source.split('\n').filter(line=>line.startsWith('| '));
const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const keys=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const table=lines.findIndex(line=>line.startsWith('| 三轉職業 |'));
if(table<0)throw Error('Original requirements table not found');
const original=lines.slice(table+1,table+11).map(line=>line.split('|').slice(1,-1).map(x=>x.trim()));
if(original.length!==10||original.some(row=>row.length!==7))throw Error('Original 60 requirements malformed');
const signals=[
 [/閃避/,'dodge'],[/承傷|被攻擊|受傷/,'damageTaken'],[/盾碎/,'shieldBreak'],[/格擋|盾反|反擊/,'block'],[/治療溢量/,'overheal'],[/治療|祈禱|治癒/,'heal'],[/自詠/,'autoSpell'],[/暴擊/,'crit'],[/技能刷新/,'skillRefresh'],[/獵鷹|鷹擊/,'falconHit'],[/演奏|樂曲/,'performance'],[/連擊|連段/,'combo'],[/集氣/,'charge'],[/擊殺|處刑|殘血/,'execute'],[/施法/,'cast'],[/護壁|守護/,'shield'],[/技能|龍槍|聖盾|魔力拳|極意拳|箭雨|狙擊|音波|星隕|聖光|閃襲|影殺|掠刃|突刺/,'skillHit']
];
const rows=[];
for(let i=0;i<10;i++)for(let j=0;j<6;j++){
 const job=jobs[i],pair=keys[j],requirement=original[i][j+1],rule=THIRD_FUSION_RULES[job]?.[pair];
 if(!rule)throw Error('Missing '+job+'/'+pair);
 const required=signals.filter(([re])=>re.test(requirement)).map(([,kind])=>kind);
 const active=rule.events||[];
 const demonstrated=required.length>0&&required.some(kind=>active.includes(kind));
 rows.push({job,pair,originalRequirement:requirement,requiredSignals:required,actualTriggers:active,hasExplicitRequiredTrigger:demonstrated,status:demonstrated?'requires_behavioral_test':'original_trigger_not_evidenced'});
}
const counts=Object.fromEntries([...new Set(rows.map(x=>x.status))].map(k=>[k,rows.filter(x=>x.status===k).length]));
const report={source:'Original VNext 60-grid, not generated balance criteria',warning:'Heuristic static trigger comparison only: missing signal is not proof the overall mechanic is impossible, and matching signal does not prove correct behavior.',counts,rows};
writeFileSync('docs/original-60-trigger-audit.json',JSON.stringify(report,null,2));
console.log('ORIGINAL 60 CONTRAST',JSON.stringify(counts));
console.log('Missing explicit event examples:',rows.filter(x=>!x.hasExplicitRequiredTrigger).slice(0,10).map(x=>x.job+'/'+x.pair+': '+x.originalRequirement).join('\n'));
