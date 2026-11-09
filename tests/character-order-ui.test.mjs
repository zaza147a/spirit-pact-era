import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {readCharacterOrder,moveCharacterOrder,saveCharacterOrder} from '../dist/character-order.js';

test('選角卡排序按鈕保留原始存檔索引並在重繪後持續生效',()=>{
 const code=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 const snippet=code.slice(code.indexOf('const renderEntryWithoutOrdering=renderEntry;'),code.indexOf('function refreshSpiritCreationLock()'));
 assert.ok(snippet.startsWith('const renderEntryWithoutOrdering='));
 const data=new Map();
 const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
 const cards=Array.from({length:8},(_,index)=>{
  const actions={after(value){card.controls=value}};
  const card={index,controls:null,querySelector(selector){
   if(selector==='[data-slot-select]')return {dataset:{slotSelect:String(index)}};
   if(selector==='.slot-actions')return actions;
   if(selector==='h2')return {textContent:`角色${index+1}`};
   throw Error(selector);
  }};
  return card;
 });
 const grid={children:[],append(card){this.children=this.children.filter(item=>item!==card);this.children.push(card)}};
 const createElement=()=>({style:{},children:[],append(value){this.children.push(value)},setAttribute(name,value){this[name]=value}});
 const sandbox={readCharacterOrder,moveCharacterOrder,saveCharacterOrder,localStorage:storage,document:{createElement},$:(id)=>{assert.equal(id,'slotGrid');return grid},toast:()=>{throw Error('unexpected toast')},renderEntry(){grid.children=[...cards]}};
 vm.createContext(sandbox);vm.runInContext(snippet,sandbox);
 assert.deepEqual(grid.children.map(card=>card.index),[]);
 vm.runInContext('renderEntry()',sandbox);
 cards[3].controls.children[0].onclick();
 assert.deepEqual(grid.children.map(card=>card.index),[0,1,3,2,4,5,6,7]);
 assert.deepEqual(readCharacterOrder(storage),[0,1,3,2,4,5,6,7]);
 assert.equal(cards[3].querySelector('[data-slot-select]').dataset.slotSelect,'3');
 vm.runInContext('renderEntry()',sandbox);
 assert.deepEqual(grid.children.map(card=>card.index),[0,1,3,2,4,5,6,7]);
 assert.equal(cards[0].controls.children[0].disabled,true);
 assert.equal(cards[7].controls.children[1].disabled,true);
});
