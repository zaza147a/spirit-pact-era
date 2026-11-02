import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('the main game links directly to the standalone WIKI without its own codex tab',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(html,/<a class="wiki-nav-link" href="\.\/wiki\/"/);
 assert.doesNotMatch(html,/data-tab="codex"/);
 assert.doesNotMatch(game,/function renderCodex\(/);
});

test('trial boss names retain a visible row above HP and attack warnings',()=>{
 const css=readFileSync(new URL('../dist/sky-trials.css',import.meta.url),'utf8');
 assert.match(css,/#encounter \.enemy-target\.trial-boss>b\{[^}]*grid-row:1!important/);
 assert.match(css,/overflow:visible!important;color:#fce4ae/);
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/class="enemy-target trial-boss"/);
 assert.match(game,/foe\.name/);
});
