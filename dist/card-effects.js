import {GEAR_TIERS,gearTierForLevel} from './progression.js?v=6.5.0';
export const CARD_THEMES={starter:'精準啟程',forest:'疾風連擊',desert:'破甲獵殺',frost:'寒霜堅守',astral:'秘法儲能',volcano:'燼火爆發',abyss:'潮汐續航',ruins:'機巧貫穿',eclipse:'月影奇襲',celestial:'星宮協調',skyport:'蒼港風行',gearfell:'千輪重擊',aether:'以太共振',stormforge:'雷霆迅擊',zenith:'天極決斷',starshore:'星瀾追獵',oathwood:'古誓共生',nightclock:'永夜時序',sungrave:'曜龍決意',worldroot:'界源調律'};
export const CARD_SLOT_ORDER=['headUpper','headMiddle','headLower','armor','rightHand','leftHand','garment','shoes','accessory1','accessory2'];
const offensive=[
 [{atkPct:18,hit:2},{matkPct:18,hit:2},{crit:8,hit:2},{critDmg:18,hit:2}],
 [{atkPct:14,aspd:2.5},{matkPct:14,aspd:2.5},{aspd:2,crit:7},{atkPct:10,matkPct:10,aspd:1.5}],
 [{atkPct:16,ignoreDef:10},{matkPct:18,magicDamage:7},{ignoreDef:12,critDmg:12},{critDmg:26,crit:4}],
 [{atkPct:20,crit:4},{matkPct:20,crit:4},{atkPct:12,matkPct:12,hit:1},{ignoreDef:8,crit:6}],
 [{matkPct:22,magicDamage:8},{matkPct:17,mpPct:15},{matkPct:14,magicDamage:6},{crit:7,mpPct:18}],
 [{atkPct:24,critDmg:15},{matkPct:24,critDmg:15},{critDmg:32,hit:-1},{crit:12,atkPct:6}],
 [{matkPct:16,mpPct:22},{atkPct:16,mpPct:22},{atkPct:10,matkPct:10,mpPct:20},{crit:6,mpPct:25}],
 [{ignoreDef:16,atkPct:12},{matkPct:19,hit:3},{ignoreDef:15,aspd:-.5},{critDmg:24,hit:3}],
 [{crit:14,atkPct:12},{crit:14,matkPct:12},{critDmg:30,aspd:1},{crit:11,hit:-2}],
 [{atkPct:15,matkPct:15},{magicDamage:10,atkPct:12},{atkPct:12,matkPct:12,crit:3},{critDmg:20,mpPct:16}],
 [{atkPct:17,aspd:2},{matkPct:17,aspd:2},{hit:4,crit:7},{aspd:2.5,critDmg:10}],
 [{atkPct:23,ignoreDef:6},{matkPct:21,critDmg:12},{ignoreDef:11,crit:8},{atkPct:14,critDmg:16}],
 [{matkPct:25,magicDamage:5},{matkPct:18,mpPct:20},{magicDamage:9,crit:6},{matkPct:13,critDmg:20}],
 [{atkPct:16,aspd:3},{matkPct:16,aspd:3},{aspd:3,ignoreDef:6},{crit:9,aspd:1.5}],
 [{atkPct:21,matkPct:9,ignoreDef:5},{matkPct:21,atkPct:9,magicDamage:5},{crit:10,critDmg:18},{ignoreDef:12,matkPct:10}]
];
offensive.push([{atkPct:20,aspd:2,hit:5},{matkPct:20,magicDamage:6},{crit:8,aspd:2},{critDmg:25,ignoreDef:6}],[{atkPct:18,mpPct:16},{matkPct:18,mpPct:16},{aspd:2,mpPct:10},{crit:10,critDmg:20}],[{atkPct:21,aspd:3},{matkPct:21,aspd:3},{ignoreDef:10,hit:6},{critDmg:24,aspd:2}],[{atkPct:24,ignoreDef:10},{matkPct:24,magicDamage:8},{crit:13,ignoreDef:6},{critDmg:35,hit:-2}],[{atkPct:18,matkPct:18},{magicDamage:10,hit:5},{crit:9,mpPct:18},{ignoreDef:12,critDmg:24}]);
for(const profiles of offensive)for(const effect of profiles){
 if(effect.aspd!==undefined){effect.aspdPct=effect.aspd*3;delete effect.aspd;}
 if(effect.ignoreDef!==undefined){
  const old=effect.ignoreDef;
  effect.damageReduction=(effect.damageReduction||0)+(old<=6?2:old<=9?3:old<=12?4:5);
  delete effect.ignoreDef;
 }
}
const attributes=['STR','AGI','VIT','INT','DEX','LUK'];
function effectsFor(zone,index,boss=false){const z=Object.keys(CARD_THEMES).indexOf(zone);if(index<3){const h=z*3+index,k=Math.floor(h/5)%6,t=h%5,j=t>=k?t+1:t,primary=5+Math.floor(h/30),secondary=8-primary;const result={[attributes[k]]:primary,[attributes[j]]:secondary};if(result.AGI){const other=Object.keys(result).find(k=>k!=='AGI');result.AGI=k===1?(h>=30?3:2):(h>=30?4:1);result[other]=8-result.AGI;}return result;}if(index===3)return {hpPct:17+(z%5),defPct:8+Math.floor(z/5),hp:3+z*.12};if(index===6)return {fleePct:13+(z%6),damageReduction:2+Math.floor(z/6),flee:1+z*.09};if(index===7)return {hpPct:11+(z%4),mdefPct:10+(z%5),mpPct:8+Math.floor(z/5),mdef:.3+z*.035};const p=({4:0,5:1,8:2,9:3})[index],effect={...offensive[z%offensive.length][p]};delete effect.atkPct;delete effect.matkPct;if(effect.magicDamage)effect.magicDamage=Math.min(5,effect.magicDamage);if(index===4)Object.assign(effect,{atkPct:16+z%5*1.5,matkPct:16+z%5*1.5,atk:1+z*.055,matk:1+z*.055});if(index===5)Object.assign(effect,{magicDamage:6+z%3*.5,atk:.5+z*.03,matk:.5+z*.03,hit:.5+z*.05});if(index===8)effect.hit=.3+z*.04;if(index===9)effect.critDmg=Math.max(effect.critDmg||0,12+z*.7);if(boss)effect.critDmg=18+z;return effect;}
// Each map boss has its own accessory-card identity. These bonuses use existing
// supported combat stats, so the same rules apply to online/offline combat.
export const BOSS_IDENTITIES=Object.freeze({
 starter:{title:'鐘樓守望',effects:{hpPct:24,atkPct:12,matkPct:12},detail:'初期同時提升生命與雙系輸出，適合尚未定型的冒險者'},
 forest:{title:'菌冠再生',effects:{hpPct:21,mpPct:18,damageReduction:3},detail:'兼顧生命、法力與減傷的持久戰護符'},
 desert:{title:'蠍神毒針',effects:{crit:10,critDmg:24,hit:5},detail:'偏向爆擊與命中，適合早期追擊高迴避目標'},
 frost:{title:'永凍誓盾',effects:{hpPct:26,defPct:17,mdefPct:12},detail:'物魔雙防與生命共同成長的防禦護符'},
 astral:{title:'星核秘儀',effects:{matkPct:23,magicDamage:9,mpPct:12},detail:'專精魔法爆發並補足施法續航'},
 volcano:{title:'熔心狂戰',effects:{atkPct:24,critDmg:24,damageReduction:2},detail:'以近戰暴擊火力換取集中爆發'},
 abyss:{title:'深淵潮汐',effects:{hpPct:18,mpPct:24,mdefPct:18},detail:'對長時間魔法戰與補給具有優勢'},
 ruins:{title:'裁決齒輪',effects:{atkPct:20,hit:12,aspdPct:8},detail:'命中與攻速並進，偏重穩定連續打擊'},
 eclipse:{title:'血月追魂',effects:{crit:15,critDmg:29,fleePct:10},detail:'偏向高速刺殺與暴擊的靈巧配裝'},
 celestial:{title:'終界共鳴',effects:{atkPct:17,matkPct:17,critDmg:22},detail:'物法混合與融合夥伴玩法皆能利用'},
 skyport:{title:'巡天空襲',effects:{aspdPct:14,hit:13,crit:9},detail:'專攻高速命中與遠距穩定輸出'},
 gearfell:{title:'千輪不屈',effects:{hpPct:27,defPct:18,damageReduction:5},detail:'高階首領戰的物理承傷核心'},
 aether:{title:'晶冠靈脈',effects:{matkPct:26,mpPct:23,magicDamage:10},detail:'高階法系的魔法增幅與續戰'},
 stormforge:{title:'轟雷迅擊',effects:{atkPct:23,aspdPct:14,hit:10},detail:'偏重攻擊速度的連段輸出'},
 zenith:{title:'斷界決意',effects:{atkPct:25,critDmg:33,crit:8},detail:'決戰型物理暴擊增幅'},
 starshore:{title:'星潮獵律',effects:{crit:14,aspdPct:13,critDmg:27},detail:'兼顧暴率、暴傷與攻速的獵殺核心'},
 oathwood:{title:'古誓守護',effects:{hpPct:30,defPct:16,mdefPct:16,damageReduction:4},detail:'三重防護適合首領攻堅與防禦夥伴'},
 nightclock:{title:'永夜時序',effects:{aspdPct:16,matkPct:22,mpPct:15},detail:'攻速與魔法同步成長的特殊流派'},
 sungrave:{title:'曜骨滅界',effects:{atkPct:27,critDmg:35,hit:11},detail:'後期高命中物理終結配裝'},
 worldroot:{title:'界源調律',effects:{atkPct:22,matkPct:22,hpPct:20,mpPct:20},detail:'終局物法雙修與生存兼顧的通用核心'}
});
export const CARD_PROFILES=Object.fromEntries(Object.entries(CARD_THEMES).map(([id,theme])=>[id,{theme,profiles:Array.from({length:10},(_,i)=>effectsFor(id,i)),boss:BOSS_IDENTITIES[id]?.effects||effectsFor(id,8,true)}]));
export const CARD_SLOT_PROFILES=Object.fromEntries(Object.keys(CARD_THEMES).map(id=>[id,{profiles:CARD_SLOT_ORDER.map(s=>[s]),boss:['accessory1','accessory2']}]));
export const LEGACY_CARD_SLOTS={fang:['rightHand'],wisp:['headMiddle'],shell:['armor'],sprout:['shoes'],sandbug:['garment'],dog:['headUpper'],guardian:['headLower'],boss_petland:['accessory1','accessory2']};
export const LEGACY_CARD_EFFECTS={fang:{atkPct:19,crit:5},wisp:{INT:7,DEX:1},shell:{defPct:18,hpPct:13},sprout:{hpPct:16,mpPct:14},sandbug:{fleePct:17,mdefPct:11},dog:{AGI:7,LUK:1},guardian:{STR:7,VIT:1},boss_petland:{atkPct:11,matkPct:11,mpPct:11}};
const LABELS={atk:'ATK',matk:'MATK',hp:'HP',mp:'SP',def:'DEF',mdef:'MDEF',atkPct:'ATK',matkPct:'MATK',hpPct:'HP',mpPct:'SP',defPct:'DEF',mdefPct:'MDEF',fleePct:'FLEE',hit:'HIT',flee:'FLEE',aspd:'ASPD',aspdPct:'攻速加成',crit:'暴擊率',critDmg:'暴擊傷害',ignoreDef:'無視防禦',magicDamage:'魔法傷害',damageReduction:'最終減傷',DEX:'DEX',INT:'INT'};
export const describeCardEffects=effects=>Object.entries(effects).map(([key,v])=>`${LABELS[key]||key} ${v>=0?'+':''}${Number(v.toFixed(2))}${key.endsWith('Pct')||['crit','critDmg','ignoreDef','magicDamage','damageReduction'].includes(key)?'%':''}`).join('、');
export function cardEffectsFor(card,level=1){const power=GEAR_TIERS[gearTierForLevel(level)-1].power;return Object.fromEntries(Object.entries(card?.effects||{}).map(([k,v])=>[k,['atk','matk','def','mdef','hp','mp','hit','flee'].includes(k)?Math.round(v*power):v]));}
export const cardDescription=(card,level=1)=>card?`${card.theme}：${describeCardEffects(cardEffectsFor(card,level))}。`:'空卡位';
export function cardAllowedInSlot(card,slot){return !!card?.slots?.includes(slot);}
export function migrateCardBindings(player,cards,slots){const returned=[];for(const slot of Object.keys(slots)){const id=player.sockets[slot];if(!id||cardAllowedInSlot(cards[id],slot))continue;if(!cards[id])continue;const held=player.cards.find(c=>c.id===id);if(held)held.qty++;else player.cards.push({id,qty:1});player.sockets[slot]=null;returned.push({id,slot});}if(returned.length)player.cardBindingMigration={version:2,returned};return returned;}
export function createWorldCards(monsters,bosses){return Object.fromEntries([...monsters,...Object.values(bosses)].filter(m=>CARD_PROFILES[m.map]).map(m=>{const group=CARD_PROFILES[m.map],index=m.level-(monsters.find(x=>x.map===m.map)?.level||1),effects=m.boss?group.boss:group.profiles[index],slots=m.boss?['accessory1','accessory2']:[CARD_SLOT_ORDER[index]],first=Object.entries(effects)[0];return [m.id,{name:`${m.name}卡片`,slots,stat:'LUK',bonus:0,effect:first[0],amount:first[1],effects:{...effects},theme:m.boss?(BOSS_IDENTITIES[m.map]?.title||group.theme):group.theme,boss:!!m.boss,map:m.map,description:`${m.boss?'首領專屬 · ':''}${m.boss?(BOSS_IDENTITIES[m.map]?.title||group.theme):group.theme}：${describeCardEffects(effects)}。${m.boss?(BOSS_IDENTITIES[m.map]?.detail+'。'):''}固定數值隨人物裝備階段成長；能力值依每項基本上限的20%計算，溢出轉為遞減潛能。`}];}));}
export function socketCardBonus(sockets,cards,key,level=1){return Object.values(sockets||{}).reduce((sum,id)=>sum+(cardEffectsFor(cards[id],level)[key]||0),0);}
