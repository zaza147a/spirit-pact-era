import {ZONES} from './world-data.js';
const fields=new Set(ZONES.map(z=>z.id));
export function mapRules(location){const field=fields.has(location);return {capture:location==='petland',bosses:field,cards:field,summary:location==='petland'?'捕捉專區 · 無首領 · 不掉卡片':location==='town'?'安全城鎮 · 整備與進化':'練功區 · 可掉卡片 · 無法捕捉'};}
export const cardDropChance=(location,foe)=>mapRules(location).cards?(foe?.boss?.001:.002):0;
