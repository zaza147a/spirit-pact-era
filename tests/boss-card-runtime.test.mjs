import assert from 'node:assert/strict';
import {createWorldCards,CARD_SLOT_PROFILES,BOSS_SLOT_EFFECTS,cardAllowedInSlot,migrateCardBindings} from '../dist/card-effects.js';
import {BOSS_MECHANIC_TEXT,bossCardEquipAllowed,bossCardHitBonus,bossCardIncoming,bossCardDodge} from '../dist/boss-card-runtime.js';

const zones=Object.keys(BOSS_MECHANIC_TEXT);
assert.equal(zones.length,21);
const bosses=Object.fromEntries(zones.map((z,i)=>[z,{id:z==='dawnrift'?'dawn-archon':'boss_'+z,name:z,map:z,level:Math.min(210,10+i*10),boss:true}]));
const cards=createWorldCards([],bosses),idFor=z=>z==='dawnrift'?'dawn-archon':'boss_'+z;
const player=(job='knight',zone='zenith')=>({job,sockets:{[CARD_SLOT_PROFILES[zone].boss[0]]:idFor(zone)},hp:10000});
const hit=(p,{now=1_000_000,source='owner',damage=1000,critical=false,magical=false,range='melee',petId='',targetHpFraction=.5}={})=>
 bossCardHitBonus(p,cards,{now,source,damage,critical,magical,range,petId,targetHpFraction});
for(const z of zones){
 assert.match(cards[idFor(z)].description,/專屬效果/,'卡面未介紹機制：'+z);
 assert.equal(typeof BOSS_MECHANIC_TEXT[z],'string');
 assert.ok(CARD_SLOT_PROFILES[z].boss.length,'首領缺少卡槽：'+z);
 assert.equal(BOSS_SLOT_EFFECTS[z].damageReduction,undefined,'王卡不可再提供面板最終減傷：'+z);
}
assert.equal(bossCardEquipAllowed(cards['dawn-archon'],'rightHand','knight'),false);
assert.equal(bossCardEquipAllowed(cards['dawn-archon'],'rightHand','pactWarrior'),true);
assert.equal(bossCardEquipAllowed(cards['dawn-archon'],'rightHand','spiritCommander'),true);
assert.equal(cardAllowedInSlot(cards['dawn-archon'],'rightHand','wizard'),false);
const legacy={job:'wizard',sockets:{rightHand:'dawn-archon'},cards:[]};
assert.equal(migrateCardBindings(legacy,cards,{rightHand:1}).length,1);
assert.equal(legacy.cards[0].id,'dawn-archon');

// Three real original hits produce a single independent 210 card attack.
const pact=player('pactWarrior','dawnrift');
for(let i=0;i<2;i++)assert.equal(hit(pact,{now:1_000_000+i*100}),0);
assert.equal(hit(pact,{now:1_000_200}),4200);
assert.equal(hit(pact,{now:1_000_300}),0,'extra damage must not recursively trigger');
const commander=player('spiritCommander','dawnrift');
assert.equal(hit(commander,{source:'pet',petId:'first'}),0);
assert.equal(hit(commander,{source:'pet',petId:'first',now:1_000_100}),0);
assert.equal(hit(commander,{source:'pet',petId:'first',now:1_000_200}),2200,'唯一夥伴每三次命中追加追擊');
assert.equal(hit(commander,{source:'pet',petId:'first',now:1_000_300}),0,'追擊不得每次無條件觸發');

const ranger=player('hunter','skyport');
for(let i=0;i<4;i++)assert.equal(hit(ranger,{range:'ranged',now:1_000_000+i*100}),0);
assert.equal(hit(ranger,{range:'ranged',now:1_000_400}),800);
const caster=player('wizard','astral');
for(let i=0;i<3;i++)assert.equal(hit(caster,{magical:true,now:1_000_000+i*100}),0);
assert.equal(hit(caster,{magical:true,now:1_000_300}),700);
const assassin=player('assassin','eclipse');
for(let i=0;i<3;i++)assert.equal(hit(assassin,{critical:true,targetHpFraction:.2,now:1_000_000+i*100}),0);
assert.equal(hit(assassin,{critical:true,targetHpFraction:.2,now:1_000_300}),850);
const dancer=player('performer','worldroot');
for(let i=0;i<3;i++)hit(dancer,{now:1_000_000+i*100});
assert.equal(hit(dancer,{now:1_000_300}),900);

// Defences apply to boss events, not the global 40% reduction attribute.
const armor=player('knight','frost');
assert.deepEqual(bossCardIncoming(armor,cards,{now:1_000_000,boss:false,magic:true,damage:1000,maxHp:10000}),{damage:1000,shield:0,heal:0});
assert.equal(bossCardIncoming(armor,cards,{now:1_000_100,boss:true,magic:true,damage:1000,maxHp:10000}).damage,880);
assert.equal(bossCardIncoming(armor,cards,{now:1_000_200,boss:true,magic:true,damage:1000,maxHp:10000}).damage,1000);
const dodge=player('rogue','starshore');dodge.hp=5000;
bossCardDodge(dodge,cards,1_000_000,10000);
assert.equal(dodge.hp,5300);
bossCardDodge(dodge,cards,1_000_100,10000);
assert.equal(dodge.hp,5300);

// Matching event sequences yield the same outcome for live and offline simulation.
const live=player('hunter','sungrave'),offline=structuredClone(live);
const sequence=[1_000_000,1_000_100,1_000_200,1_000_300,1_000_400,1_000_500];
assert.deepEqual(sequence.map(now=>hit(live,{now,range:'ranged'})),sequence.map(now=>hit(offline,{now,range:'ranged'})));
assert.deepEqual(live.bossCardRuntime,offline.bossCardRuntime);
const sungraveMage=player('wizard','sungrave');
for(let i=0;i<4;i++)assert.equal(hit(sungraveMage,{now:1_000_000+i*100,magical:true}),0);
assert.equal(hit(sungraveMage,{now:1_000_400,magical:true}),700,'飾品1曜骨的魔法追擊應與遠距物理等效');
for(const zone of ['starter','forest','desert','astral','eclipse','celestial','skyport','gearfell','aether','zenith','sungrave','worldroot']){
 const p=player(zone==='worldroot'?'performer':zone==='eclipse'?'assassin':'hunter',zone);
 if(['starter','gearfell'].includes(zone))bossCardIncoming(p,cards,{now:1_000_000,boss:true,damage:1000,maxHp:10000});
 let total=0;
 for(let i=0;i<12;i++)total+=hit(p,{now:1_000_100+i*1000,critical:true,magical:!['skyport','zenith','sungrave'].includes(zone),range:'ranged',targetHpFraction:.2});
 assert.ok(total>0,zone+' 未能觸發獨立王卡戰鬥效果');
}
for(const zone of ['frost','volcano','abyss','ruins','stormforge','starshore','oathwood','nightclock']){
 const p=player('knight',zone);p.hp=3000;
 if(zone==='ruins'){bossCardDodge(p,cards,1_000_000,10000);bossCardDodge(p,cards,1_008_100,10000);}
 const before=p.hp,guard=bossCardIncoming(p,cards,{now:1_010_000,boss:true,magic:zone==='frost',damage:1000,maxHp:10000});
 if(zone==='starshore')bossCardDodge(p,cards,1_010_000,10000);
 assert.ok(guard.damage<1000||guard.shield>0||guard.heal>0||p.hp>before,zone+' 未能觸發生存效果');
}
console.log('21 boss card mechanisms, dual-pet gating, deterministic combat and defensive cooldowns passed');
