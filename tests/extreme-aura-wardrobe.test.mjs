import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../dist/cosmetic-gallery.css',import.meta.url),'utf8');
const ground=readFileSync(new URL('../dist/extreme-trials.css',import.meta.url),'utf8');
const gold=readFileSync(new URL('../dist/gold-collection-effects.css',import.meta.url),'utf8');

test('角色外觀提供人物與寵物獨立光環開關，背景頁不重複',()=>{
 const outfits=game.slice(game.indexOf('function renderOutfits()'),game.indexOf('function renderCosmeticGallery()'));
 const backgrounds=game.slice(game.indexOf('function renderBackgroundGallery()'),game.indexOf('const TOWER_BACKGROUND_STYLES'));
 assert.match(outfits,/data-cosmetic-aura/);
 assert.match(outfits,/data-pet-cosmetic-aura/);
 assert.doesNotMatch(backgrounds,/data-cosmetic-aura/);
 assert.match(game,/player\.petCosmeticAura=event\.target\.checked;save\(\);render\(\)/);
});

test('角色與寵物皆遵從可關閉的光環狀態',()=>{
 assert.match(game,/dataset\.cosmeticAura=player\.cosmeticAura!==false\?'on':'off'/);
 assert.match(game,/companionAuraRoot\?\.dataset\)companionAuraRoot\.dataset\.cosmeticAura=player\.petCosmeticAura!==false\?'on':'off'/);
 assert.match(game,/顯示夥伴光環/);
 assert.match(css,/#companion\[data-cosmetic-aura="off"\]>.hero::before/);
 assert.match(css,/#character\[data-cosmetic-aura="off"\]>.hero::before/);
 assert.match(ground,/#gameShell #character\[data-cosmetic-aura="off"\]>.hero\[class\*="extreme-aura-"\]::before\{display:none!important\}/);
});

test('極限試煉光環壓扁到腳下，寵物原有金幣契印不被額外改動',()=>{
 assert.match(ground,/height:42px!important/);
 assert.match(ground,/top:216px!important/);
 assert.match(ground,/has\(img\[src\$="atk-assassin\.webp"\]\)::before\{top:184px!important\}/);
 assert.match(ground,/::after\{display:none!important\}/);
 assert.doesNotMatch(gold,/Projection on the floor beneath the boots\/paws/);
 assert.match(gold,/#companion\[data-gold-tier="4"\]>.hero::after/);
});

test('四張重製立繪使用統一顯示比例，刺客 ATK 保留獨立腳位定位',()=>{
 assert.doesNotMatch(ground,/src\$="clear-pactWarrior\.webp"\]\{transform:scale\(\.88\)!important/);
 assert.doesNotMatch(ground,/src\$="matk-assassin\.webp"\]\{transform:scale\(\.92\)!important/);
 assert.match(ground,/All four replacement portraits now include their own transparent safety margins/);
 assert.match(ground,/src\$="atk-assassin\.webp"\]\)::before\{top:184px!important/);
});
