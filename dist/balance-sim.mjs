// Simplified expected-value sanity check; estimates, not exact combat telemetry.
import {CLASSES,makePet,petStats} from './catalog.js';
import {rollGear,rollPetGear} from './loot.js';
import {WORLD_MONSTERS} from './world-data.js';
import {hitChance,aspdAttackIntervalMs,incomingMonsterDamage,monsterCombatStats} from './combat-balance.js';
const pets={attack:'fang',magic:'wisp',defense:'shell',support:'sprout'};
const avg=items=>items.reduce((a,b)=>a+b,0)/items.length;
function simulate(level,job,role,geared){
 const c=CLASSES[job],magic=job==='mage'||job==='acolyte',attrs={STR:1+Math.round(level*(magic?.13:.65)),INT:1+Math.round(level*(magic?.65:.13)),VIT:1+Math.round(level*.3),AGI:1+Math.round(level*.25),DEX:1+Math.round(level*.3)};
 const gear=geared?[magic?'oneStaff':'blade','vest','helm','visor','mask','shield','cloak','boots','chip','ring'].map(id=>rollGear(id,level,'rare')):[];
 const bonus=key=>gear.reduce((n,g)=>n+(g.affixes[key]||0),0);
 const atk=c.atk+(level-1)*3+(attrs.STR+bonus('STR'))*2+Math.floor(attrs.DEX/3)+bonus('atk');
 const matk=6+level*2+(attrs.INT+bonus('INT'))*2+bonus('matk')+(magic?9:0);
 const def=c.def+(level-1)*2+attrs.VIT+bonus('def')+gear.reduce((n,g)=>n+({vest:4,helm:2,cloak:2,boots:2}[g.id]||0),0);
 const hp=c.hp+(level-1)*24+attrs.VIT*8+bonus('hp');
 const aspd=Math.min(193,({swordsman:151,acolyte:147,mage:145,thief:156})[job]+(attrs.AGI+bonus('AGI'))*.32+(attrs.DEX+bonus('DEX'))*.1+bonus('aspd'));
 const hit=80+level*2+attrs.DEX*2+bonus('hit');
 const pet=makePet(pets[role]);pet.level=level;pet.gear=geared?{head:rollPetGear('petHelm',level,'rare'),body:rollPetGear('petArmor',level,'rare'),shoes:rollPetGear('petBoots',level,'rare')}:{head:null,body:null,shoes:null};const ps=petStats(pet);
 const monster=WORLD_MONSTERS[level-1],e=monsterCombatStats(monster);
 const playerDps=Math.max(1,atk-monster.def)*1000/aspdAttackIntervalMs(aspd)*hitChance(hit,e.flee)+Math.max(0,((magic?matk:atk)*2.25*(1+.08*(Math.min(10,Math.ceil(level/5))-1))-monster.def*(magic?.25:1)))/4.5*.78;
 const petDps=Math.max(1,ps.atk*(role==='magic'?1.4:1)-monster.def*(role==='magic'?.25:1))*1000/aspdAttackIntervalMs(ps.aspd)*hitChance(ps.hit,e.flee)+ps.atk*(role==='attack'?.28:role==='magic'?.35:role==='defense'?.15:.08);
 const incoming=incomingMonsterDamage(monster.atk,def)*1000/aspdAttackIntervalMs(e.aspd)*hitChance(e.hit,65+level*2),petIncoming=incomingMonsterDamage(monster.atk,ps.def)*1000/aspdAttackIntervalMs(e.aspd)*hitChance(e.hit,ps.flee),petShare=role==='defense'?.73:.35;
 const survival=Math.min(hp/(incoming*(1-petShare)+.01),ps.hp/(petIncoming*petShare+.01)),kill=monster.hp/(playerDps+petDps);
 const effectiveHeal=role==='support'?Math.min(incoming*(1-petShare),ps.atk*.85*1000/aspdAttackIntervalMs(ps.aspd)):0,prevented=role==='defense'?incoming*petShare*.8:0;
 return {level,job,role,geared,playerDps:Math.round(playerDps),petDps:Math.round(petDps),petContribution:Math.round(100*(petDps+effectiveHeal+prevented)/(playerDps+petDps+effectiveHeal+prevented)),kill:+kill.toFixed(1),survival:+survival.toFixed(1),wins:kill<survival};
}
const jobs=['swordsman','acolyte','mage','thief'],levels=[10,20,30,40,50];
const data=levels.flatMap(level=>jobs.flatMap(job=>Object.keys(pets).flatMap(role=>[simulate(level,job,role,true),simulate(level,job,role,false)])));
for(const level of levels){const equipped=data.filter(x=>x.level===level&&x.geared),empty=data.filter(x=>x.level===level&&!x.geared);console.log(`Lv${level}: geared pet contribution ${Math.round(avg(equipped.map(x=>x.petContribution)))}% (range ${Math.min(...equipped.map(x=>x.petContribution))}-${Math.max(...equipped.map(x=>x.petContribution))}%), geared wins ${equipped.filter(x=>x.wins).length}/16, empty wins ${empty.filter(x=>x.wins).length}/16`);}
console.log(JSON.stringify(data.filter(x=>x.level===40&&x.job==='swordsman')));
