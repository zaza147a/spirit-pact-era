import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('formal combat UI keeps its effects toggle without the test-lab entry',()=>{
 const source=readFileSync(new URL('../dist/skill-effects.js',import.meta.url),'utf8');
 assert.match(source,/effectsToggle/);
 assert.doesNotMatch(source,/effects-lab-link|技能演出展示/);
 const lab=readFileSync(new URL('../dist/effects-lab.html',import.meta.url),'utf8');
 assert.match(lab,/技能演出試驗場/);
});
