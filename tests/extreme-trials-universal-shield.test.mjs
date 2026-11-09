import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {rollGear,GEAR_BASE} from '../dist/loot.js';
import {shouldAutoSalvage} from '../dist/salvage-rules.js';

const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer','pactWarrior','spiritCommander'];
const extremeSalvage={autoSalvage:true,keepRarity:true,salvageMaxRarity:'mythic',keepTier:false,keepStat:false,salvageMatchMode:'any'};

test('12職皆能裝備守衛盾牌，裝盾自動卸下雙手武器並保留完整裝備',async()=>{
 for(const job of jobs){
  const c=await runtime(),p=c.api.fresh('盾牌QA',job);
  p.level=210;p.thirdJob=true;
  const twoHand=rollGear('twoSword',1,'common');
  p.gear.rightHand=twoHand;p.gear.leftHand=null;
  const shield=rollGear('shield',1,'common');
  p.bag.push(shield);
  c.api.setup(p);c.api.useItem(p.bag.length-1);
  assert.equal(p.gear.leftHand?.uid,shield.uid,job);
  assert.equal(p.gear.rightHand,null,job);
  const returned=p.bag.find(item=>item.uid===twoHand.uid);
  assert.ok(returned,`${job}: two-handed weapon not returned`);
  assert.equal(returned.swapProtected,true,job);
  assert.equal(p.bag.some(item=>item.uid===shield.uid),false,job);
 }
});

test('雙手武器裝回仍會卸下盾牌，不允許雙手武器與盾同時生效',async()=>{
 const c=await runtime(),p=c.api.fresh('雙手盾牌', 'knight');
 p.level=210;p.gear.leftHand=rollGear('shield',1,'common');
 p.bag.push(rollGear('twoSword',1,'common'));
 const shieldUid=p.gear.leftHand.uid;
 c.api.setup(p);c.api.useItem(p.bag.length-1);
 assert.equal(p.gear.rightHand?.id,'twoSword');
 assert.equal(p.gear.leftHand,null);
 assert.equal(p.bag.find(item=>item.uid===shieldUid)?.swapProtected,true);
});

test('盾牌比較預覽會計入卸下雙手武器，結束後不更改原本穿戴',async()=>{
 const c=await runtime(),p=c.api.fresh('盾牌預覽','knight');
 p.level=210;p.gear.rightHand=rollGear('twoSword',1,'common');
 const weapon=p.gear.rightHand.uid,shield=rollGear('shield',1,'common');
 c.api.setup(p);
 const html=c.api.gearComparison(shield);
 assert.match(html,/已包含卸除雙手武器的影響/);
 assert.equal(p.gear.rightHand?.uid,weapon);
 assert.equal(p.gear.leftHand,null);
});

test('雙手武器改持盾牌時，角色防禦提高但失去原武器的實際攻擊能力',async()=>{
 const c=await runtime(),p=c.api.fresh('盾牌取捨','knight');
 p.level=210;p.gear.rightHand=rollGear('twoSword',200,'mythic',()=>.5);
 p.gear.leftHand=null;p.bag.push(rollGear('shield',200,'mythic',()=>.5));
 c.api.setup(p);
 const before={atk:c.api.stat('atk'),def:c.api.stat('def')};
 c.api.useItem(p.bag.length-1);c.api.clearStatSnapshots();
 assert.equal(p.gear.rightHand,null);
 assert.ok(c.api.stat('atk')<before.atk);
 assert.ok(c.api.stat('def')>before.def);
});

test('一般副手匕首仍需要主手短劍，不能繞過雙手互斥限制',async()=>{
 const c=await runtime(),p=c.api.fresh('副手匕首','assassin');
 p.level=210;p.gear.rightHand=rollGear('blade',1,'common');
 const dagger=rollGear('offDagger',1,'common');p.bag.push(dagger);
 c.api.setup(p);c.api.useItem(p.bag.length-1);
 assert.equal(p.gear.leftHand,null);
 assert.ok(p.bag.some(item=>item.uid===dagger.uid));
});

test('背包滿2000格仍可一進一出替換；超量時不得卸下雙手武器',async()=>{
 const c=await runtime(),p=c.api.fresh('容量盾牌','knight');
 p.level=210;p.gear.rightHand=rollGear('twoSword',1,'common');
 p.bag=Array.from({length:2000},(_,i)=>i===0?rollGear('shield',1,'common'):{id:'med',qty:1});
 const oldWeapon=p.gear.rightHand.uid,shield=p.bag[0].uid;
 c.api.setup(p);c.api.useItem(0);
 assert.equal(p.gear.rightHand,null);
 assert.equal(p.gear.leftHand?.uid,shield);
 assert.equal(p.bag.length,2000);
 assert.ok(p.bag.some(item=>item.uid===oldWeapon));
 // Defensive guard for imported/legacy oversized bags.
 const d=await runtime(),q=d.api.fresh('超量盾牌','knight');
 q.level=210;q.gear.rightHand=rollGear('twoSword',1,'common');
 q.bag=Array.from({length:2001},(_,i)=>i===0?rollGear('shield',1,'common'):{id:'med',qty:1});
 const held=q.gear.rightHand.uid;
 d.api.setup(q);d.api.useItem(0);
 assert.equal(q.gear.rightHand.uid,held);
 assert.equal(q.gear.leftHand,null);
 assert.equal(q.bag.length,2001);
});

test('已換下和新掉落的盾牌都不被自動分解，其他裝備仍遵循原有設定',async()=>{
 const shield=rollGear('shield',1,'common'),weapon=rollGear('blade',1,'common');
 assert.equal(GEAR_BASE.shield.jobs,undefined);
 assert.equal(shouldAutoSalvage(shield,extremeSalvage),false);
 assert.equal(shouldAutoSalvage(weapon,extremeSalvage),true);
 const c=await runtime(),p=c.api.fresh('分解盾牌','knight');
 p.autoSalvage=true;Object.assign(p,extremeSalvage);
 p.bag=[];c.api.setup(p);
 c.api.awardGear(shield);
 assert.ok(p.bag.some(item=>item.uid===shield.uid));
 c.api.salvageBagEquipment();
 assert.ok(p.bag.some(item=>item.uid===shield.uid));
});
