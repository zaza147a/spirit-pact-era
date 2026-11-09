import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {runtime} from './runtime31-helper.mjs';

test('character sigil shows saved rank everywhere, crafting belongs to its NPC',async()=>{
 const c=await runtime(),p=c.api.fresh('契印驗收','knight');
 p.dawnSigil=4;p.location='worldroot';c.api.setup(p,null);
 assert.match(c.api.renderCharacterTabs(),/data-character-section="sigil"/);
 let html=vm.runInContext('renderDawnSigil()',c);
 assert.match(html,/4／8階/);assert.match(html,/各 \+8%/);assert.doesNotMatch(html,/data-upgrade-sigil/);
 assert.doesNotMatch(vm.runInContext('renderDawnSigil(true)',c),/data-upgrade-sigil/);
 p.location='dawncity';p.dawnSigil=0;p.bag=[];
 html=vm.runInContext('renderDawnSigil(true)',c);
 assert.match(html,/契印師・曦紋/);assert.match(html,/data-upgrade-sigil disabled/);assert.match(html,/製作1階契印/);
 p.bag=['dawn_scout_fang','dawn_ram_horn','dawn_ray_membrane'].map(id=>({id,qty:999}));
 assert.match(vm.runInContext('renderDawnSigil(true)',c),/data-upgrade-sigil >/);
 p.dawnSigil=8;html=vm.runInContext('renderDawnSigil(true)',c);
 assert.match(html,/各 \+16%/);assert.match(html,/已達最高階/);assert.doesNotMatch(html,/data-upgrade-sigil/);
});
