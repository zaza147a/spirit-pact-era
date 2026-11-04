import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

// Execute the production notice queue/renderer in a small DOM contract. This
// is not a substitute for cross-browser visual acceptance.
const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const start=source.indexOf('function queueBossCardNotice(id){');
const end=source.indexOf('\nfunction normalize(',start);
assert.ok(start>0&&end>start,'找不到遊戲內的真實王卡彈窗流程');
assert.match(source,/if\(enemy\.boss\)queueBossCardNotice\(enemy\.id\)/);
assert.match(source,/for\(const id of result\.drawn\)if\(CARDS\[id\]\?\.boss\)queueBossCardNotice\(id\)/);
assert.match(source,/bossCardNotices\.push\(\.\.\.\(summary\.bossCards\|\|\[\]\)\)/);
assert.match(source,/\$\('offlineClose'\)\.onclick=.*showNextBossCardNotice\(\)/);

const clicked=[],button={onclick:null,textContent:'',focus(){clicked.push('focus')}},modal={hidden:true,style:{},setAttribute(){},innerHTML:'',querySelector(id){
 assert.equal(id,'#bossCardNoticeNext');return button;
}};
const offlineModal={hidden:true};
const cards={bossA:{boss:true,name:'首領卡 A',description:'物理追擊',slots:['rightHand']},bossB:{boss:true,name:'首領卡 B',description:'魔法回響',slots:['accessory1']},normal:{boss:false}};
const ctx={CARDS:cards,SLOTS:{rightHand:'武器',accessory1:'飾品 1'},player:{level:210},offlineSimulation:false,
 offlineMetrics:null,gameRunning:true,bossCardNotices:[],bossCardNoticeOpen:false,clicked,
 document:{getElementById(id){return id==='bossCardNotice'&&!modal.hidden?modal:null;},createElement(){return modal;},body:{append(){}}},
 $:id=>id==='offlineModal'?offlineModal:null,
 spriteHtml:()=>'<img alt="王卡">',escapeHtml:x=>String(x),cardDescription:()=>''};
// An existing DOM node remains discoverable even after it has been hidden.
ctx.document.getElementById=id=>id==='bossCardNotice'&&ctx.created?modal:id==='bossCardNoticeNext'&&ctx.created?button:null;
ctx.document.body.append=()=>{ctx.created=true;};
runInNewContext('let bossCardNotices=[],bossCardNoticeOpen=false;'+source.slice(start,end),ctx);

runInNewContext('queueBossCardNotice("bossA");queueBossCardNotice("bossB");',ctx);
assert.match(modal.innerHTML,/首領卡 A/);
assert.match(modal.innerHTML,/物理追擊/);
assert.match(button.textContent,/下一張/);
// DOM mock records the renderer's callback on this latest button.
assert.equal(clicked.length,1);
assert.equal(modal.hidden,false);
button.onclick();
assert.match(modal.innerHTML,/首領卡 B/);
assert.equal(clicked.length,2);

// Verify deferred notices never hide the offline reward report.
ctx.offlineSimulation=true;ctx.offlineMetrics={bossCards:[]};
runInNewContext('queueBossCardNotice("bossA")',ctx);
assert.deepEqual(ctx.offlineMetrics.bossCards,['bossA']);
assert.match(modal.innerHTML,/首領卡 B/);
offlineModal.hidden=false;
button.onclick();
runInNewContext('bossCardNotices.push(...offlineMetrics.bossCards);showNextBossCardNotice()',ctx);
assert.equal(modal.hidden,true,'離線報告開啟時不得先顯示王卡');
offlineModal.hidden=true;
ctx.offlineSimulation=false;runInNewContext('showNextBossCardNotice()',ctx);
assert.match(modal.innerHTML,/首領卡 A/);
assert.match(modal.innerHTML,/物理追擊/);

console.log('production boss-card notice: live, multiple-card order, offline queue gating and card art/text contract passed');
