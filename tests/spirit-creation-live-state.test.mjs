import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CLASSES,SLOTS} from '../dist/catalog.js';
import {rollGear,GEAR_BASE} from '../dist/loot.js';
import {initialJobSkills} from '../dist/job-skills.js';
import {SECOND_JOBS,secondJobChoices,transferEligibility} from '../dist/jobs.js';
import {readCharacterSlot,writeCharacterSlot} from '../dist/character-slots.js';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const freshSource=game.slice(game.indexOf('function fresh(name,job){'),game.indexOf('\nfunction ',game.indexOf('function fresh(name,job){')+10));
const fresh=new Function('CLASSES','SECOND_JOBS','SLOTS','rollGear','initialJobSkills',`${freshSource}\nreturn fresh;`)(CLASSES,SECOND_JOBS,SLOTS,rollGear,initialJobSkills);
const storage=()=>{
 const data=new Map();
 return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
};

test('御靈使直接創立合法一轉 Lv1，並能存入、讀回八格存檔',()=>{
 const p=fresh('新御靈使','spiritist');
 assert.equal(p.job,'spiritist');
 assert.equal(p.level,1);
 assert.equal(p.jobLevel,1);
 assert.equal(p.reborn,undefined);
 assert.equal(p.thirdJob,undefined);
 assert.equal(p.pets.length,0);
 assert.equal(p.gear.rightHand.id,'staffSword');
 assert.equal(GEAR_BASE[p.gear.rightHand.id].jobs.includes('spiritist'),true);
 assert.equal(Object.values(p.gear).filter(Boolean).length,1);
 const memory=storage();
 writeCharacterSlot(memory,7,p);
 const loaded=readCharacterSlot(memory,7,x=>x,x=>x?.job==='spiritist'&&x?.level===1);
 assert.equal(loaded.error,null);
 assert.equal(loaded.player.name,'新御靈使');
 assert.equal(loaded.player.gear.rightHand.id,'staffSword');
});

test('御靈使兩分支須正常達到 Base50 / Job40，且不允許直接創建二轉',()=>{
 const choices=secondJobChoices('spiritist').map(([id])=>id);
 assert.deepEqual(choices,['pactWarrior','spiritCommander']);
 const player=fresh('轉職測試','spiritist');
 for(const job of choices){
  assert.match(transferEligibility(player,job),/Base Lv\.50、Job Lv\.40|城鎮/);
  assert.equal(SECOND_JOBS[job].weapon,'staffSword');
  player.level=50;player.jobLevel=40;player.location='town';
  assert.equal(transferEligibility(player,job),null);
  player.level=1;player.jobLevel=1;player.location='petland';
 }
 assert.match(game,/if\(!CLASSES\[job\]\|\|SECOND_JOBS\[job\]\)return toast/);
 assert.doesNotMatch(game,/function spiritUnlocked\(/);
});

test('創角事件會解除御靈使按鈕鎖定、保存新角色並關閉視窗',()=>{
 const section=game.slice(game.indexOf('function refreshSpiritCreationLock(){'),game.indexOf('\nfunction resetSession(){'));
 const memory=storage(),hint={textContent:''},classes=new Set(['spirit-locked']);
 const button={disabled:true,classList:{add:value=>classes.add(value),remove:value=>classes.delete(value)},
  removeAttribute:key=>{if(key==='aria-label')delete button.ariaLabel;},
  querySelector:key=>key==='.spirit-unlock-hint'?hint:null,ariaLabel:'暫停創立'};
 const nodes={classChoices:{querySelector:()=>button},createModal:{style:{display:'grid'}},entryScreen:{inert:true}};
 const alerts=[];
 const setup=new Function('$','CLASSES','SECOND_JOBS','fresh','normalize','valid','writeCharacterSlot','localStorage','renderEntry','toast',
  `let creatingSlot=7,selectedSlot=null;${section}\nreturn {refreshSpiritCreationLock,start,selectedSlot:()=>selectedSlot,slot:()=>creatingSlot};`);
 const ui=setup(id=>nodes[id],CLASSES,SECOND_JOBS,fresh,x=>x,x=>x?.job==='spiritist'&&x?.level===1,
  writeCharacterSlot,memory,()=>{},message=>alerts.push(message));
 ui.refreshSpiritCreationLock();
 assert.equal(button.disabled,false);
 assert.equal(classes.has('spirit-locked'),false);
 assert.equal(hint.textContent,'從 1 等開始正常養成');
 ui.start('視窗御靈使','spiritist');
 assert.equal(ui.slot(),null);
 assert.equal(ui.selectedSlot(),7);
 assert.equal(nodes.createModal.style.display,'none');
 assert.equal(nodes.entryScreen.inert,false);
 assert.equal(JSON.parse(memory.getItem('icarus-character-slot-8')).player.gear.rightHand.id,'staffSword');
 assert.match(alerts.at(-1),/角色已建立/);
});
