import {ZONES} from './world-data.js?v=6.5.0';
const fields=new Set(ZONES.map(z=>z.id));
export function mapRules(location){if(location==='dawnrift')return {capture:false,bosses:true,cards:false,summary:'曙界新陸 · 僅掉落曙界獨有雜物 · 不自動販賣'};if(location==='spirit-sanctuary')return {capture:true,bosses:false,cards:false,summary:'契靈之地 · Lv.100 神話夥伴、忠誠100 · 可直接捕捉 · 無首領與卡片'};const field=fields.has(location);return {capture:location==='petland',bosses:field,cards:field,summary:location==='petland'?'捕捉專區 · 無首領 · 不掉卡片':['town','skycity','dawncity'].includes(location)?'安全城鎮 · 整備與進化':'練功區 · 可掉卡片 · 無法捕捉'};}
export const cardDropChance=(location,foe)=>location==='dawnrift'?(foe?.id==='dawn-archon' ? .001 : 0):mapRules(location).cards?(foe?.boss?.001:.002):0;
