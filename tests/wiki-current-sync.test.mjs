import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HOMECOMING_ROUTES} from '../dist/homecoming-data.js';
import {EXTREME_TRIALS} from '../dist/extreme-trials.js';
import {JOB_SKILLS} from '../dist/job-skills.js';
import {jobSkillSpec} from '../dist/player-scaling.js';
import {trainingRate} from '../dist/companion-training.js';

const html=readFileSync(new URL('../wiki/index.html',import.meta.url),'utf8');

test('WIKI contains all contemporary system tabs and reads authoritative game modules',()=>{
 for(const tab of ['monsters','cards','gear','pet','resonance','evolution','jobs','homecoming','extreme','rules','changelog'])assert.ok(html.includes(`data-tab="${tab}"`),tab);
 for(const module of ['homecoming-data.js','homecoming-adventures.js','extreme-trials.js','extreme-trials-rewards.js','companion-training.js','job-skills.js'])assert.ok(html.includes(`../${module}`),module);
 assert.equal(HOMECOMING_ROUTES.length,12);
 assert.equal(Object.keys(EXTREME_TRIALS).length,4);
});
test('third-job skill preview uses selected character level, not an implicit Lv151 default',()=>{
 assert.ok(html.includes('jobSkillSpec(s,rank,job,{level:Number($(\'skillLevel\').value)||200})'));
 assert.ok(html.includes('list.map(s=>skillRow(s,job))'));
 const skill=JOB_SKILLS.wizard.find(s=>s.thirdGrowth);
 assert.ok(skill);
 assert.notEqual(jobSkillSpec(skill,10,'wizard',{level:151}).percent,jobSkillSpec(skill,10,'wizard',{level:200}).percent);
});
test('recent release note dates are descending and loyalty rules are consistent',()=>{
 const days=[...html.matchAll(/\{date:'(2026-11-\d\d)',items:/g)].map(x=>x[1]);
 assert.deepEqual(days,[...days].sort().reverse());
 assert.ok(days.includes('2026-11-10'));
 for(const [level,expected] of [[150,2],[180,1.5],[199,1]])assert.equal(trainingRate(level),expected);
 assert.ok(html.includes('裁界者核心'));
});
test('game and WIKI display one version and summarize latest published mechanics',()=>{
 const game=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 for(const page of [game,html])assert.ok(page.includes('V7.1.11'));
 assert.match(game,/game\.js\?v=7\.1\.11-wiki-changelog-20261110/);
 for(const summary of ['批次兌換首領核心','十二種正反融合型態','君王同化、萬靈協戰'])assert.ok(html.includes(summary),summary);
});
