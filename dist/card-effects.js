import {GEAR_TIERS,gearTierForLevel} from './progression.js';
export const CARD_THEMES={starter:'精準啟程',forest:'疾風連擊',desert:'破甲獵殺',frost:'寒霜堅守',astral:'秘法儲能',volcano:'燼火爆發',abyss:'潮汐續航',ruins:'機巧貫穿',eclipse:'月影奇襲',celestial:'星宮協調',skyport:'蒼港風行',gearfell:'千輪重擊',aether:'以太共振',stormforge:'雷霆迅擊',zenith:'天極決斷'};
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
for(const profiles of offensive)for(const effect of profiles)if(effect.aspd!==undefined){effect.aspdPct=effect.aspd*3;delete effect.aspd;}
const attributes=['STR','AGI','VIT','INT','DEX','LUK'];
function effectsFor(zone,index,boss=false){const z=Object.keys(CARD_THEMES).indexOf(zone);if(index<3){const h=z*3+index,k=Math.floor(h/5)%6,t=h%5,j=t>=k?t+1:t,primary=5+Math.floor(h/30),secondary=8-primary;const result={[attributes[k]]:primary,[attributes[j]]:secondary};if(result.AGI){const other=Object.keys(result).find(k=>k!=='AGI');result.AGI=k===1?(h>=30?3:2):(h>=30?4:1);result[other]=8-result.AGI;}return result;}if(index===3)return {hpPct:17+(z%5),defPct:8+Math.floor(z/5),hp:3+z*.12};if(index===6)return {fleePct:13+(z%6),damageReduction:2+Math.floor(z/6),flee:1+z*.09};if(index===7)return {hpPct:11+(z%4),mdefPct:10+(z%5),mpPct:8+Math.floor(z/5),mdef:.3+z*.035};const p=({4:0,5:1,8:2,9:3})[index],effect={...offensive[z][p]};delete effect.atkPct;delete effect.matkPct;if(effect.magicDamage)effect.magicDamage=Math.min(5,effect.magicDamage);if(index===4)Object.assign(effect,{atkPct:16+z%5*1.5,matkPct:16+z%5*1.5,atk:1+z*.055,matk:1+z*.055});if(index===5)Object.assign(effect,{magicDamage:6+z%3*.5,atk:.5+z*.03,matk:.5+z*.03,hit:.5+z*.05});if(index===8)effect.hit=.3+z*.04;if(index===9)effect.critDmg=Math.max(effect.critDmg||0,12+z*.7);if(boss)effect.critDmg=18+z;return effect;}
export const CARD_PROFILES=Object.fromEntries(Object.entries(CARD_THEMES).map(([id,theme])=>[id,{theme,profiles:Array.from({length:10},(_,i)=>effectsFor(id,i)),boss:effectsFor(id,8,true)}]));
export const CARD_SLOT_PROFILES=Object.fromEntries(Object.keys(CARD_THEMES).map(id=>[id,{profiles:CARD_SLOT_ORDER.map(s=>[s]),boss:['accessory1','accessory2']}]));
export const LEGACY_CARD_SLOTS={fang:['rightHand'],wisp:['headMiddle'],shell:['armor'],sprout:['shoes'],sandbug:['garment'],dog:['headUpper'],guardian:['headLower'],boss_petland:['accessory1','accessory2']};
export const LEGACY_CARD_EFFECTS={fang:{atkPct:19,crit:5},wisp:{INT:7,DEX:1},shell:{defPct:18,hpPct:13},sprout:{hpPct:16,mpPct:14},sandbug:{fleePct:17,mdefPct:11},dog:{AGI:7,LUK:1},guardian:{STR:7,VIT:1},boss_petland:{atkPct:11,matkPct:11,mpPct:11}};
const LABELS={atk:'ATK',matk:'MATK',hp:'HP',mp:'SP',def:'DEF',mdef:'MDEF',atkPct:'ATK',matkPct:'MATK',hpPct:'HP',mpPct:'SP',defPct:'DEF',mdefPct:'MDEF',fleePct:'FLEE',hit:'HIT',flee:'FLEE',aspd:'ASPD',aspdPct:'攻速加成',crit:'暴擊率',critDmg:'暴擊傷害',ignoreDef:'無視防禦',magicDamage:'魔法傷害',damageReduction:'最終減傷',DEX:'DEX',INT:'INT'};
export const describeCardEffects=effects=>Object.entries(effects).map(([key,v])=>`${LABELS[key]||key} ${v>=0?'+':''}${Number(v.toFixed(2))}${key.endsWith('Pct')||['crit','critDmg','ignoreDef','magicDamage','damageReduction'].includes(key)?'%':''}`).join('、');
export function cardEffectsFor(card,level=1){const power=GEAR_TIERS[gearTierForLevel(level)-1].power;return Object.fromEntries(Object.entries(card?.effects||{}).map(([k,v])=>[k,['atk','matk','def','mdef','hp','mp','hit','flee'].includes(k)?Math.round(v*power):v]));}
export const cardDescription=(card,level=1)=>card?`${card.theme}：${describeCardEffects(cardEffectsFor(card,level))}。`:'空卡位';
export function cardAllowedInSlot(card,slot){return !!card?.slots?.includes(slot);}
export function migrateCardBindings(player,cards,slots){const returned=[];for(const slot of Object.keys(slots)){const id=player.sockets[slot];if(!id||cardAllowedInSlot(cards[id],slot))continue;if(!cards[id])continue;const held=player.cards.find(c=>c.id===id);if(held)held.qty++;else player.cards.push({id,qty:1});player.sockets[slot]=null;returned.push({id,slot});}if(returned.length)player.cardBindingMigration={version:2,returned};return returned;}
export function createWorldCards(monsters,bosses){return Object.fromEntries([...monsters,...Object.values(bosses)].map(m=>{const group=CARD_PROFILES[m.map],index=m.level-(monsters.find(x=>x.map===m.map)?.level||1),effects=m.boss?group.boss:group.profiles[index],slots=m.boss?['accessory1','accessory2']:[CARD_SLOT_ORDER[index]],first=Object.entries(effects)[0];return [m.id,{name:`${m.name}卡片`,slots,stat:'LUK',bonus:0,effect:first[0],amount:first[1],effects:{...effects},theme:group.theme,boss:!!m.boss,map:m.map,description:`${m.boss?'首領專屬 · ':''}${group.theme}：${describeCardEffects(effects)}。固定數值隨人物裝備階段成長；能力值全身合計上限24。`}];}));}
export function socketCardBonus(sockets,cards,key,level=1){return Object.values(sockets||{}).reduce((sum,id)=>sum+(cardEffectsFor(cards[id],level)[key]||0),0);}
