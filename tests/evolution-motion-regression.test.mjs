import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../dist/evolution-motion.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');

test('evolution scene loads cache-busted silhouette morph and uses four-second game timer',()=>{
 assert.match(html,/evolution-motion\.css\?v=6\.5\.3/);
 assert.match(html,/id="evolutionBefore"/);assert.match(html,/id="evolutionAfter"/);
 assert.match(game,/className='evolution-scene evolving'/);
 assert.match(game,/\},4000\)/);
 assert.match(css,/\.evolution-scene\.evolving #evolutionBefore\{animation:form-out 4s/);
 assert.match(css,/\.evolution-scene\.evolving #evolutionAfter\{animation:form-in 4s/);
});
test('new animation reconstructs shape rather than just cross-fading',()=>{
 for(const name of ['form-out','form-in']){
  const body=css.match(new RegExp('@keyframes '+name+'\\{([\\s\\S]*?)\\n\\}'))?.[1];
  assert.ok(body,'missing '+name);
  assert.ok((body.match(/clip-path:polygon\(/g)||[]).length>=5,name+' needs progressive silhouette changes');
  assert.ok((body.match(/skew\(/g)||[]).length>=3,name+' needs nonuniform shape warping');
  assert.match(body,/blur\((?:9|12|14)px\)/);
 }
 assert.match(css,/@keyframes form-in\{[\s\S]*?100%\{opacity:1;filter:brightness\(1\) invert\(0\) blur\(0\)/);
 assert.match(css,/\.evolution-scene\.complete #evolutionAfter\{opacity:1/);
});
test('reduced-motion users get a safe dissolve',()=>{
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/animation:quiet-out 4s/);
 assert.match(css,/animation:quiet-in 4s/);
});
