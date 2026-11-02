import test from 'node:test';
import assert from 'node:assert/strict';

const gears={
 blade:{name:'單手劍',hands:1,damage:'atk',base:'sword'},oneSpear:{name:'單手槍',hands:1,damage:'atk',base:'spear'},
 twoSword:{name:'雙手巨劍',hands:2,damage:'atk',base:'greatsword'},twoSpear:{name:'雙手長槍',hands:2,damage:'atk',base:'greatspear'},
 rifle:{name:'短劍',hands:1,damage:'atk',base:'dagger'},offDagger:{name:'副手短劍',hands:1,damage:'atk',base:'dagger'},
 katar:{name:'拳刃',hands:2,damage:'atk',base:'katar'},
 oneStaff:{name:'單手法杖',hands:1,damage:'matk',base:'staff'},
 twoStaff:{name:'雙手法杖',hands:2,damage:'matk',base:'greatstaff'},
 spellFist:{name:'魔拳套',hands:2,damage:'matk',base:'spellfist'},
 mace:{name:'單手權杖',hands:1,damage:'matk',base:'mace'},
 knuckles:{name:'拳套',hands:2,damage:'atk',base:'knuckle'},
 shortBow:{name:'短弓',hands:2,damage:'atk',base:'bow'},
 longBow:{name:'長弓',hands:2,damage:'atk',base:'bow'},
 crossbow:{name:'十字弩',hands:2,damage:'atk',base:'crossbow'},
 instrument:{name:'樂器',hands:2,damage:'atk',base:'instrument'}
};
const JOBS={
 knight:['blade+shield','oneSpear+shield','twoSword','twoSpear'],
 crusader:['blade+shield','oneSpear+shield'],
 wizard:['oneStaff+shield','twoStaff'],
 sage:['oneStaff+shield','twoStaff','spellFist'],
 assassin:['rifle+shield','rifle+offDagger','katar'],
 rogue:['rifle+shield'],
 priest:['mace+shield'],
 monk:['knuckles'],
 hunter:['shortBow','longBow','crossbow'],
 performer:['instrument','shortBow','longBow']
};
const quality={common:1,mythic:1.72};
const primary={atk:12,matk:14,def:5};
const range=(key,tier,rarity)=>{const base=primary[key]*2**(tier-1)*quality[rarity];return [Math.ceil(base*.98),Math.ceil(base*1.02)]};
const mid=a=>(a[0]+a[1])/2;
const damage=(p,d)=>Math.max(1,Math.round(Math.max(1,p-d)));
const received=(a,d)=>Math.max(1,Math.round(a*500/(500+d)));
const events=aspd=>1000/Math.max(140,Math.round((200-Math.min(193,Math.max(100,aspd)))*20));
const compute=(combo,level,rarity='mythic',scenario='current')=>{
 const tier=level<=20?1:level<=35?2:level<=50?3:level<=70?4:level<=90?5:level<=110?6:level<=130?7:level<=150?8:level<=170?9:level<=190?10:11;
 const [main,off]=combo.split('+'),g=gears[main];assert.ok(g);
 const atk=mid(range(g.damage,tier,rarity));
 const def=mid(range('def',tier,rarity));
 const hasShield=off==='shield';
 let attack=atk,defense=hasShield?def:0;
 if(off==='offDagger')attack+=atk*(scenario==='test'?0.4:1);
 if(g.hands===2&&scenario==='test')attack*=1.35;
 const aspd=Math.min(193,193-(g.hands===2?3:0));
 return {tier,damageStat:g.damage,attack,defense,aspd,hitRate:events(aspd),survivalFraction:received(15000,1000+defense)/received(15000,1000)};
};
test('ten class configuration matrix includes all jobs',()=>{
 assert.equal(Object.keys(JOBS).length,10);
 for(const [job,choices] of Object.entries(JOBS))for(const combo of choices){
  const [main,off]=combo.split('+');assert.ok(gears[main],job+' '+combo);
  assert.ok(!off||['shield','offDagger'].includes(off),combo);
  assert.ok(!(off&&gears[main].hands===2),combo);
  assert.ok(gears[main].hands===2||Boolean(off),job+' has empty offhand: '+combo);
  if(off==='offDagger')assert.equal(main,'rifle',job+' offhand dagger must pair with dagger');
 }
});
test('single-hand setups must have an occupied offhand',()=>{
 for(const [job,choices] of Object.entries(JOBS))for(const combo of choices){
  const [main,off]=combo.split('+');
  assert.ok(gears[main].hands===2||(off&&['shield','offDagger'].includes(off)),job+' '+combo);
 }
 assert.deepEqual(JOBS.rogue,['rifle+shield']);
 assert.deepEqual(JOBS.priest,['mace+shield']);
});
test('mandatory two-handed jobs are covered without fictitious shield route',()=>{
 for(const job of ['monk','hunter','performer'])assert.ok(JOBS[job].every(c=>gears[c.split('+')[0]].hands===2));
});
test('different class roles compare magical stats correctly',()=>{
 for(const c of JOBS.wizard.concat(JOBS.sage))assert.equal(compute(c,200).damageStat,'matk');
 for(const c of JOBS.hunter)assert.equal(compute(c,200).damageStat,'atk');
});
test('shield yields survival and costs offhand damage or two-handed weapon',()=>{
 const shield=compute('rifle+shield',200),dual=compute('rifle+offDagger',200),katar=compute('katar',200);
 assert.ok(shield.survivalFraction<dual.survivalFraction);
 assert.ok(dual.attack>shield.attack);
 assert.ok(dual.hitRate>katar.hitRate);
});
for(const level of [20,50,100,150,170,190,200,210])for(const rarity of ['common','mythic'])test('scenario matrices '+level+' '+rarity,()=>{
 for(const [job,choices] of Object.entries(JOBS))for(const combo of choices)for(const scenario of ['current','test']){
  const r=compute(combo,level,rarity,scenario);
  assert.ok(Number.isFinite(r.attack)&&r.attack>0,job+' '+combo);
  assert.ok(Number.isFinite(r.hitRate)&&r.hitRate>0,job+' '+combo);
  assert.ok(r.survivalFraction>0&&r.survivalFraction<=1,job+' '+combo);
 }
});
export {JOBS,compute};
