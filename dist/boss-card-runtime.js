// Boss cards are equipment-triggered effects. Only original successful hits
// enter this engine: extra card damage must never recursively trigger cards.
// State lives on the player so the browser and offline Worker use one timeline.
const NEW_JOBS=new Set(['pactWarrior','spiritCommander']);
export const BOSS_MECHANIC_TEXT=Object.freeze({
 starter:'承受首領攻擊後，下一次有效主攻附加45%反擊（8秒冷卻）；修羅每5次主攻可額外觸發50%鬥氣拳擊',
 forest:'每4次魔法主攻，追加當次65%的魔法回響',
 desert:'每5次暴擊追加45%毒針追擊（6秒冷卻）；流氓每4次暴擊可觸發',
 frost:'受到首領魔法攻擊時減免該次12%傷害（6秒冷卻）',
 astral:'每4次魔法主攻追加70%星核回響',
 volcano:'承受首領攻擊時產生最大生命12%護盾（12秒冷卻）',
 abyss:'生命低於40%且受到攻擊時產生最大生命15%護盾（20秒冷卻）',
 ruins:'連續兩次閃避後，下一次受到的首領傷害降低15%（8秒冷卻）',
 eclipse:'每6次暴擊追加55%追擊；十字斬首者每4次暴擊觸發，處刑階段提升至85%（5.5秒冷卻）',
 celestial:'每4次魔法主攻追加70%秘法回響',
 skyport:'每5次遠距物理主攻追加80%追射',
 gearfell:'受到首領攻擊後產生最大生命7%護盾，下一次有效主攻附加40%反擊（8秒冷卻）',
 aether:'每4次魔法主攻追加70%法力回響',
 stormforge:'受到首領物理攻擊時減免該次12%傷害（6秒冷卻）',
 zenith:'物理連擊追加斷界追擊；騎士5次槍系命中、流氓5次近戰命中、修羅4次連環命中，其餘6次；十字軍使用通用較低倍率',
 starshore:'成功閃避時恢復最大生命3%（5秒冷卻）',
 oathwood:'受到首領攻擊後恢復最大生命12%（20秒冷卻）',
 nightclock:'生命低於50%且受到攻擊時恢復最大生命12%（24秒冷卻）',
 sungrave:'遠距物理或魔法每5次攻擊追加70%曜龍追擊；近戰物理每6次追加40%追擊',
 worldroot:'舞孃每4次主攻追加90%協奏音刃（3.5秒冷卻）；其他職業每5次追加35%共鳴攻擊（5秒冷卻）',
 dawnrift:'只限靈契君王與萬靈宗師：靈契君王每3次主攻引爆420%同化裁決；萬靈宗師雙夥伴在8秒內分別命中後啟動雙靈領域，領域內每次夥伴命中追加220%雙靈追擊'
});
export const bossCardEquipAllowed=(card,slot,job)=>!!card?.slots?.includes(slot)&&
 (card.map!=='dawnrift'||NEW_JOBS.has(job));
const attached=(player,cards)=>Object.values(player?.sockets||{}).map(id=>({id,card:cards[id]}))
 .filter(({card})=>card?.boss&&(!card.map||card.map!=='dawnrift'||NEW_JOBS.has(player.job)));
const stateFor=(player,id)=>((player.bossCardRuntime??={})[id]??={count:0,at:0});
function proc(state,now,{every=1,cooldown=0}={}){
 state.count=(state.count||0)+1;
 if(state.count<every||now-(state.at||0)<cooldown)return false;
 state.count=0;state.at=now;return true;
}
export function bossCardHitBonus(player,cards,event){
 const {now,source,damage,critical=false,magical=false,secondary=false,range='melee',skillId='',petId='',targetHpFraction=1}=event;
 if(!(damage>0))return 0;
 let extra=0;
 const owner=source==='owner',pet=source==='pet';
 for(const {id,card} of attached(player,cards)){
  const s=stateFor(player,id),zone=card.map;
  const add=(ratio,options)=>{if(proc(s,now,options))extra+=damage*ratio;};
  switch(zone){
   case 'starter':
    if(owner&&player.job==='monk')add(.50,{every:5,cooldown:3500});
    else if(owner&&s.guardReady){s.guardReady=false;add(.45,{cooldown:8000});}
    break;
   case 'forest':if(owner&&magical)add(.65,{every:4});break;
   case 'desert':if(owner&&critical)add(.45,{every:player.job==='rogue'?4:5,cooldown:6000});break;
   case 'astral':if(owner&&magical)add(.70,{every:4});break;
   case 'ruins':break; // defensive dodge charge is spent on the next boss hit
   case 'eclipse':if(owner&&critical){
    const assassin=player.job==='assassin',execution=targetHpFraction<=.35;
    add(assassin&&execution?.85:.55,{every:assassin?4:6,cooldown:5500});
   }break;
   case 'celestial':if(owner&&magical)add(.70,{every:4});break;
   case 'skyport':if(owner&&!magical&&range==='ranged')add(.80,{every:5});break;
   case 'gearfell':if(owner&&s.guardReady&&now-(s.at||0)>=8000){s.guardReady=false;add(.40,{cooldown:0});}break;
   case 'aether':if(owner&&magical)add(.70,{every:4});break;
   case 'zenith':if(owner&&!magical){
    const rank=player.job==='monk'?4:['knight','rogue'].includes(player.job)?5:6;
    const power=player.job==='crusader'?.50:player.job==='monk'?.80:.85;
    add(power,{every:rank});
   }break;
   case 'sungrave':if(owner)add(magical||range==='ranged'?.70:.40,{every:magical||range==='ranged'?5:6});break;
   case 'worldroot':if(owner){
    const dance=player.job==='performer';
    const ready=dance&&s.songCharge>0;
    if(ready)s.songCharge--;
    add(dance?.90:.35,{every:dance?(ready?3:4):5,cooldown:dance?3500:5000});
   }break;
   case 'dawnrift':
    if(player.job==='pactWarrior'&&owner)add(4.20,{every:3});
    else if(player.job==='spiritCommander'&&pet){
     if(!petId)break;
     if(!s.windowAt||now-s.windowAt>8000){s.windowAt=now;s.seen={};}
     (s.seen??={})[petId]=true;
     if(Object.keys(s.seen).length>=2&&!(s.activatedUntil>now))s.activatedUntil=now+8000;
     if(s.activatedUntil>now)extra+=damage*2.20;
    }
    break;
  }
 }
 return Math.max(0,Math.round(extra));
}
export function bossCardSong(player,cards){
 if(player.job!=='performer')return;
 for(const {id,card} of attached(player,cards))if(card.map==='worldroot'){
  const s=stateFor(player,id);s.songCharge=Math.min(2,(s.songCharge||0)+1);
 }
}
export function bossCardDodge(player,cards,now,maxHp){
 for(const {id,card} of attached(player,cards)){
  const s=stateFor(player,id);
  if(card.map==='starshore'&&now-(s.at||0)>=5000){s.at=now;player.hp=Math.min(maxHp,player.hp+Math.max(1,Math.round(maxHp*.03)));}
  if(card.map==='ruins'&&proc(s,now,{every:2,cooldown:8000}))s.dodgeGuard=true;
 }
}
export function bossCardIncoming(player,cards,{now,boss=false,magic=false,damage,maxHp}){
 if(!(damage>0))return {damage,shield:0,heal:0};
 let amount=damage,shield=0,heal=0;
 for(const {id,card} of attached(player,cards)){
  const s=stateFor(player,id),zone=card.map;
  switch(zone){
   case 'starter':if(boss)s.guardReady=true;break;
   case 'gearfell':if(boss){s.guardReady=true;if(now-(s.at||0)>=8000){s.at=now;shield+=maxHp*.07;}}break;
   case 'frost':if(boss&&magic&&now-(s.at||0)>=6000){s.at=now;amount*=.88;}break;
   case 'stormforge':if(boss&&!magic&&now-(s.at||0)>=6000){s.at=now;amount*=.88;}break;
   case 'volcano':if(boss&&now-(s.at||0)>=12000){s.at=now;shield+=maxHp*.12;}break;
   case 'abyss':if(player.hp<maxHp*.4&&now-(s.at||0)>=20000){s.at=now;shield+=maxHp*.15;}break;
   case 'ruins':if(boss&&s.dodgeGuard){s.dodgeGuard=false;amount*=.85;}break;
   case 'oathwood':if(boss&&now-(s.at||0)>=20000){s.at=now;heal+=maxHp*.12;}break;
   case 'nightclock':if(player.hp<maxHp*.5&&now-(s.at||0)>=24000){s.at=now;heal+=maxHp*.12;}break;
  }
 }
 return {damage:Math.max(1,Math.round(amount)),shield:Math.round(shield),heal:Math.round(heal)};
}
