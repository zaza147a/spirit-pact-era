import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../dist/evolution-motion.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');

test('four-second evolution has current cache version and actual scene controls',()=>{
 assert.match(html,/evolution-motion\.css\?v=6\.5\.4/);
 assert.match(html,/id="evolutionBefore"/);
 assert.match(html,/id="evolutionAfter"/);
 assert.match(game,/className='evolution-scene evolving'/);
 assert.match(game,/\},4000\)/);
 assert.match(css,/\.evolution-scene\.evolving #evolutionBefore\{animation:form-out 4s/);
 assert.match(css,/\.evolution-scene\.evolving #evolutionAfter\{animation:form-in 4s/);
});
test('fluid displacement filters are linked, animated, and keep artwork color',()=>{
 for(const name of ['Old','New']){
   assert.match(html,new RegExp('id="evolutionWarp'+name+'"'));
 }
 assert.equal((html.match(/<feDisplacementMap /g)||[]).length,2);
 assert.equal((html.match(/<feTurbulence /g)||[]).length,2);
 for(const name of ['form-out','form-in']){
   const body=css.match(new RegExp('@keyframes '+name+'\\{([\\s\\S]*?)\\n\\}'))?.[1];
   assert.ok(body,'missing '+name);
   assert.ok((body.match(/url\(#evolutionWarp/g)||[]).length>=3,name+' should use displacement');
   assert.ok((body.match(/blur\(/g)||[]).length>=5,name+' needs progressive blur');
   assert.doesNotMatch(body,/clip-path:polygon|brightness\(0\) invert\(1\)/);
 }
 assert.match(css,/@keyframes form-in\{[\s\S]*?100%\{opacity:1;filter:blur\(0\)/);
});
test('accessibility: reduced motion dissolves without displacement',()=>{
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/animation:quiet-out 4s/);
 assert.match(css,/animation:quiet-in 4s/);
});
