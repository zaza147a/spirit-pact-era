import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
const dir=process.argv[2],parts=readdirSync(dir).filter(f=>/^matrix-.*\.json$/.test(f)).map(f=>JSON.parse(readFileSync(dir+'/'+f)));
assert.equal(parts.length,10);
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.ok(parts.every(p=>p.sourceCommit===sourceCommit&&p.engineUnchanged&&p.engineHash===parts[0].engineHash));
const rows=parts.flatMap(p=>p.rows),keys=new Set();assert.equal(rows.length,2400);
for(const r of rows){assert.ok(SECOND_JOBS[r.job]&&FUSION_PAIRS[r.pair]);assert.equal(r.choice.length,3);assert.equal(new Set(r.choice).size,3);assert.ok(r.choice.every(i=>Number.isInteger(i)&&i>=0&&i<6));const k=r.job+'/'+r.pair+'/'+r.choice.join(',');assert.ok(!keys.has(k));keys.add(k);}
const median=a=>a.length?a.sort((a,b)=>a-b)[Math.floor(a.length/2)]:null;
const summary=Object.keys(SECOND_JOBS).map(job=>({job,byPair:Object.keys(FUSION_PAIRS).map(pair=>{const rs=rows.filter(r=>r.job===job&&r.pair===pair),wins=rs.filter(r=>r.won);assert.equal(rs.length,20);return {pair,n:20,wins:wins.length,medianWinSeconds:median(wins.map(r=>r.seconds)),maxWinSeconds:wins.length?Math.max(...wins.map(r=>r.seconds)):null,choicesWithFailures:rs.filter(r=>!r.won).map(r=>r.choice)};})}));
const wins=rows.filter(r=>r.won),report={sourceCommit,engineHash:parts[0].engineHash,engineUnchanged:true,conditions:parts[0].conditions,count:2400,wins:wins.length,alive:rows.filter(r=>r.alive).length,medianWinSeconds:median(wins.map(r=>r.seconds)),summary,rows};
writeFileSync('docs/five-boss-full-skill-current.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:2400,wins:report.wins,alive:report.alive,medianWinSeconds:report.medianWinSeconds,profilesWithoutWins:summary.flatMap(s=>s.byPair.filter(p=>!p.wins).map(p=>s.job+'/'+p.pair))},null,2));
