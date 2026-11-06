import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('character-select art preserves portrait aspect and loads its stylesheet',()=>{
 const css=readFileSync(new URL('../dist/entry-portrait-clarity.css',import.meta.url),'utf8');
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(css,/\.slot-select img\.art-entry\s*\{/);
 assert.match(css,/object-fit:contain/);
 assert.match(css,/height:240px/);
 assert.match(css,/\.slot-art-stage\s*\{/);
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/class="slot-art-stage"/);
 assert.match(html,/entry-portrait-clarity\.css\?v=/);
});
