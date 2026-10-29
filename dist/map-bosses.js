import {ZONES} from './world-data.js?v=4.0';
import {noviceMonsterStats,normalMonsterStats} from './progression.js?v=4.0';
export const BOSS_ENCOUNTER_CHANCE=.035,BOSS_RESPITE_MS=90000;
const names=['迷霧鐘樓魔像','千枝菌冠女皇','黃沙蠍神','永凍白熊王','星核觀測者','熔心三首獄犬','深淵巨鉗海皇','齒輪裁決者','血月鐮魂使','終界吞天巨鯨'];
export const MAP_BOSSES=Object.fromEntries(ZONES.map((z,i)=>{const stats=z.max<=50?noviceMonsterStats(z.max):normalMonsterStats(z.max);return [z.id,{id:`boss_${z.id}`,name:names[i],map:z.id,level:z.max,icon:'♛',boss:true,elite:false,artIndex:i,role:'attack',roleName:'獨立地圖首領',hp:Math.round(stats.hp*(z.max<=50?4:6)),atk:Math.round(stats.atk*1.7),def:Math.round(stats.def*1.2),xp:Math.round(stats.xp*6),gold:Math.round((2+z.max*.35)*4),drops:['red_large','blue_large','relic']}];}));
export function canEncounterBoss(location,enemies,now,nextAllowed=0,rng=Math.random){return !!MAP_BOSSES[location]&&now>=nextAllowed&&!enemies.some(e=>e.boss&&e.hp>0)&&rng()<BOSS_ENCOUNTER_CHANCE;}
export function bossRarity(rng=Math.random){const roll=rng();return roll<.7?'uncommon':roll<.95?'legendary':'mythic';}
export const BOSS_CARD_CHANCE=.001;
