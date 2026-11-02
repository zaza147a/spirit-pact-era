import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('desktop player and companion portraits grow without increasing status-card height',()=>{
 const css=readFileSync(new URL('../dist/compact-v5.css',import.meta.url),'utf8');
 assert.match(css,/\.character \.hero \.art-hero\{transform:scale\(1\.16\);transform-origin:left center\}/);
 assert.match(css,/max-height:850px\)\{[\s\S]*?\.character \.hero \.art-hero\{transform:scale\(1\.10\)\}/);
 assert.doesNotMatch(css,/min-height:1(?:1|2|3)\dpx[^\n]*Enlarge player/);
});

test('all three costume ranks use larger but contained portrait geometry',()=>{
 const css=readFileSync(new URL('../dist/compact-v5.css',import.meta.url),'utf8');
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/\['S','SS','SSS'\]\.includes\(outfit\)/);
 assert.match(game,/art-\$\{size\} rank-outfit/);
 assert.match(css,/img\.art-hero\.rank-outfit\{transform:scale\(1\.34\);transform-origin:left center;object-fit:contain\}/);
 assert.match(css,/img\.art-hero\.rank-outfit\{transform:scale\(1\.22\)\}/);
});

test('tall desktop uses actual larger portrait columns and bounded card heights',()=>{
 const css=readFileSync(new URL('../dist/compact-v5.css',import.meta.url),'utf8');
 assert.match(css,/@media\(min-width:1200px\) and\(min-height:860px\)\{/);
 assert.match(css,/\.character \.hero:has\(\.art-hero\)\{min-height:112px;padding:8px 8px 8px 105px\}/);
 assert.match(css,/\.character \.hero \.art-hero\{left:3px;top:3px;width:96px;max-width:96px;height:106px;transform:none;object-fit:contain\}/);
 assert.match(css,/\.character #companion \.hero \.art-hero\{width:100px;max-width:100px;height:108px\}/);
 assert.match(css,/\.character \.hero img\.art-hero\.rank-outfit\{transform:scale\(1\.18\)/);
});
