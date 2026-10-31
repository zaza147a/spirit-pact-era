import {FRONTIER_BOSS_DIFFICULTY} from './frontier-difficulty.js';
import {ZONES} from './world-data.js?v=6.3.0';
import {noviceMonsterStats,normalMonsterStats} from './progression.js?v=6.3.0';
export const BOSS_ENCOUNTER_CHANCE=.035,BOSS_RESPITE_MS=90000;
const names=['迷霧鐘樓魔像','千枝菌冠女皇','黃沙蠍神','永凍白熊王','星核觀測者','熔心三首獄犬','深淵巨鉗海皇','齒輪裁決者','血月鐮魂使','終界吞天巨鯨','蒼港巡天鯨','千輪戰爭皇機','以太晶冠聖鹿','轟雷熔爐巨神','天極斷界龍','星潮海皇・涅瑞昂','古誓森母・艾薇拉','永夜時后・克羅妮','曜骨龍皇・索拉斯','界源熾天使・奧瑞亞'];
export const MAP_BOSSES=Object.fromEntries(ZONES.map((z,i)=>{const stats=z.max<=50?noviceMonsterStats(z.max):normalMonsterStats(z.max);return [z.id,{id:`boss_${z.id}`,name:names[i],map:z.id,level:z.max,icon:'♛',boss:true,elite:false,artIndex:i,artFile:i>=15?'bosses-frontier':i>=10?'new-continent-bosses':null,role:'attack',roleName:'獨立地圖首領',hp:Math.round(stats.hp*(z.max<=50?4:6)*(z.min>=151?FRONTIER_BOSS_DIFFICULTY.hp:1)),atk:Math.round(stats.atk*1.7*(z.min>=151?FRONTIER_BOSS_DIFFICULTY.atk:1)),def:Math.round(stats.def*1.2),xp:Math.round(stats.xp*6),gold:Math.round((2+z.max*.35)*4),drops:['red_large','blue_large','relic']}];}));
export function canEncounterBoss(location,enemies,now,nextAllowed=0,rng=Math.random){return !!MAP_BOSSES[location]&&now>=nextAllowed&&!enemies.some(e=>e.boss&&e.hp>0)&&rng()<BOSS_ENCOUNTER_CHANCE;}
export function bossRarity(rng=Math.random){const roll=rng();return roll<.7?'uncommon':roll<.95?'legendary':'mythic';}
export const BOSS_CARD_CHANCE=.001;
