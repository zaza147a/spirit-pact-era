import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as data from '../dist/homecoming-data.js';
import * as state from '../dist/homecoming-state.js';
import * as adventures from '../dist/homecoming-adventures.js';
import * as fourth from '../dist/companion-fourth-skill.js';
function preview(){
 const html=readFileSync(new URL('../dist/homecoming-preview.html',import.meta.url),'utf8');
 const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].split('\n').filter(l=>!l.startsWith('import ')).join('\n');
 const elements=new Map(),storage=new Map();let fail=false;
 const document={querySelector(id){if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',value:''});return elements.get(id);}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem(k,v){if(fail)throw Error('quota');storage.set(k,v);}};
 const context=vm.createContext({...data,...state,...fourth,...adventures,document,localStorage});
 vm.runInContext(script,context);
 return {context,elements,storage,failSave(){fail=true;},click(id){elements.get(id).onclick();},action(action,route='attack-magic',choice){elements.get('#routes').onclick({target:{closest:()=>({dataset:{action,route,choice}})}});},value:()=>JSON.parse(vm.runInContext('JSON.stringify(p)',context))};
}
test('preview first trip renders one page, persists arrival and allows town acceptance',()=>{
 const h=preview();assert.equal((h.elements.get('#routes').innerHTML.match(/<article/g)||[]).length,12);
 h.click('#discover');h.action('begin');assert.match(h.elements.get('#routes').innerHTML,/首次旅行 1 \/ 3/);
 h.action('next');assert.equal(h.value().homecoming.routes['attack-magic'].journeyIndex,1);
 h.action('next');h.action('arrive');assert.equal(h.value().location,'hc_1_town');
 h.action('accept');assert.equal(h.value().homecoming.routes['attack-magic'].phase,'active');
 assert.equal(h.value().homecoming.routes['magic-attack'].phase,'letter');
});
test('preview save failure rolls back state and reports it',()=>{
 const h=preview();h.click('#discover');h.failSave();h.action('begin');
 assert.equal(h.value().homecoming.routes['attack-magic'].phase,'letter');
 assert.match(h.elements.get('#status').textContent,/儲存失敗/);
});

test('preview drives a unique furnace puzzle instead of the old kill-count flow',()=>{
 const h=preview();h.click('#discover');
 for(const action of ['begin','next','next','arrive','accept'])h.action(action);
 assert.match(h.elements.get('#routes').innerHTML,/祖爐熱壓/);
 h.action('questGo');
 for(const choice of ['fuel','fuel','seal'])h.action('questChoice','attack-magic',choice);
 assert.equal(h.value().homecoming.routes['attack-magic'].adventure.vars.heat,2);
 assert.equal(h.value().homecoming.routes['attack-magic'].adventure.vars.pressure,1);
 h.action('questChoice','attack-magic','ignite');h.action('questGo');h.action('testBoss');
 h.action('questGo');h.action('questChoice','attack-magic','elder');h.action('claim');
 assert.equal(h.value().homecoming.routes['attack-magic'].phase,'claimed');
});
