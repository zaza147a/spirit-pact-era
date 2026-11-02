import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {visualForSkill} from '../dist/skill-effects-presets.js';

test('every authored combat skill family resolves to a recognizable visual type',async()=>{
 const {JOB_SKILLS}=await import('../dist/job-skills.js');
 for(const skills of Object.values(JOB_SKILLS))for(const s of skills){
  const visual=visualForSkill({skillId:s.id,name:s.name,kind:s.kind,range:s.range});
  assert.ok(visual&&typeof visual==='string',s.id);
 }
 const source=readFileSync(new URL('../dist/skill-effects.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/skill-cinematic|playCinematic|createElement\('canvas'\)|\.animate\(/);
 assert.match(source,/effect\.source==='boss'\)return/);
 assert.match(source,/for\(const \{id,rect\} of positions\)/);
 assert.match(source,/el\.textContent=symbols\[type\]/);
 assert.doesNotMatch(source,/el\.textContent=effect\.name/);
});

test('lightweight skill styles contain no costly blur or gradient effects',()=>{
 const css=readFileSync(new URL('../dist/skill-effects.css',import.meta.url),'utf8');
 assert.doesNotMatch(css,/filter:|box-shadow:|radial-gradient|conic-gradient|drop-shadow/);
 assert.match(css,/skill-sigil-pop/);
});

test('a three-target skill draws exactly three lightweight glyphs, while boss attacks draw none',async()=>{
 const oldDocument=globalThis.document,oldHeight=globalThis.innerHeight;
 const created=[];
 const targets=['a','b','c'].map((id,i)=>({dataset:{target:id},getBoundingClientRect:()=>({left:150+i*120,top:100,width:70,height:90,bottom:190})}));
 const makeNode=()=>({dataset:{},style:{},setAttribute(){},remove(){this.removed=true;}});
 globalThis.document={hidden:false,readyState:'loading',addEventListener(){},head:{append(){}},body:{append(fragment){created.push(...fragment.children);}},querySelectorAll(selector){return selector.includes('.enemy-target')?targets:[];},querySelector(){return null;},createElement:makeNode,createDocumentFragment(){return {children:[],append(node){this.children.push(node);}};}};
 globalThis.innerHeight=1000;
 try{
  const {queueCombatVfx}=await import('../dist/skill-effects.js?test=lightweight-multi');
  queueCombatVfx({source:'skill',skillId:'thirdWide_crusader',name:'聖域裁決',targetIds:['a','b','c']});
  assert.equal(created.length,3);
  assert.deepEqual(created.map(el=>el.dataset.targetId),['a','b','c']);
  assert.ok(created.every(el=>el.textContent&&!el.textContent.includes('聖域裁決')));
  queueCombatVfx({source:'boss',targetIds:['a','b','c']});
  assert.equal(created.length,3);
 }finally{globalThis.document=oldDocument;globalThis.innerHeight=oldHeight;}
});
