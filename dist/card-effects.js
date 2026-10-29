export const CARD_PROFILES={
 starter:{theme:'精準入門',profiles:[{hit:22},{flee:18},{hpPct:7}],boss:{hit:32,flee:8}},
 forest:{theme:'迅捷連擊',profiles:[{aspd:1.5},{crit:5},{fleePct:9}],boss:{aspd:2.3,crit:2}},
 desert:{theme:'物理破甲',profiles:[{atkPct:7},{ignoreDef:5},{critDmg:12}],boss:{ignoreDef:9,atkPct:5}},
 frost:{theme:'堅甲生存',profiles:[{defPct:12},{mdefPct:12},{hpPct:10}],boss:{hpPct:15,defPct:8}},
 astral:{theme:'法術儲能',profiles:[{matkPct:7},{magicDamage:6},{mpPct:12}],boss:{matkPct:11,magicDamage:5}},
 volcano:{theme:'犧牲爆發',profiles:[{atkPct:11,hpPct:-6},{critDmg:20,defPct:-8},{crit:8,fleePct:-8}],boss:{atkPct:15,hpPct:-4}},
 abyss:{theme:'均衡續航',profiles:[{hpPct:7,mpPct:7},{defPct:7,mdefPct:7},{matkPct:5,mpPct:5}],boss:{hpPct:12,mpPct:12}},
 ruins:{theme:'機巧穿透',profiles:[{ignoreDef:8,aspd:-.5},{hit:14,critDmg:8},{DEX:4,INT:4}],boss:{ignoreDef:12,aspd:-.3}},
 eclipse:{theme:'殘影奇襲',profiles:[{fleePct:13,hpPct:-5},{crit:7,hit:-10},{aspd:2,defPct:-8}],boss:{crit:10,fleePct:15,hpPct:-6}},
 celestial:{theme:'全能協調',profiles:[{atkPct:4,matkPct:4},{hpPct:5,defPct:5},{mpPct:5,mdefPct:5}],boss:{atkPct:7,matkPct:7,hpPct:7}},
 petland:{theme:'夥伴守護',profiles:[{hpPct:5}],boss:{hpPct:10,mpPct:8}}
};
const LABELS={atkPct:'ATK',matkPct:'MATK',hpPct:'HP',mpPct:'SP',defPct:'DEF',mdefPct:'MDEF',fleePct:'FLEE',hit:'HIT',flee:'FLEE',aspd:'ASPD',crit:'暴擊率',critDmg:'暴擊傷害',ignoreDef:'無視防禦',magicDamage:'魔法傷害',DEX:'DEX',INT:'INT'};
export const describeCardEffects=effects=>Object.entries(effects).map(([key,v])=>`${LABELS[key]||key} ${v>=0?'+':''}${v}${key.endsWith('Pct')||['crit','critDmg','ignoreDef','magicDamage'].includes(key)?'%':''}`).join('、');
export function createWorldCards(monsters,bosses){return Object.fromEntries([...monsters,...Object.values(bosses)].map(m=>{const group=CARD_PROFILES[m.map],effects=m.boss?group.boss:group.profiles[(m.level-1)%group.profiles.length],first=Object.entries(effects)[0];return [m.id,{name:`${m.name}卡片`,stat:'LUK',bonus:0,effect:first[0],amount:first[1],effects:{...effects},theme:group.theme,boss:!!m.boss,map:m.map,description:`${m.boss?'首領專屬 · ':''}${group.theme}：${describeCardEffects(effects)}。同卡可疊加，依配裝選擇，無穿戴等級限制。`}];}));}
export function socketCardBonus(sockets,cards,key){return Object.values(sockets||{}).reduce((sum,id)=>{const c=cards[id];return sum+(c?.effects?.[key]??(c?.effect===key?c.amount:0)??0);},0);}
