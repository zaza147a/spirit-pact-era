export const characterLevelCap=p=>p.reborn?120:99;
export const attributeCap=p=>p.reborn&&p.level>=100?120:99;
export const ignoresGearLevel=(p,g)=>!!p.reborn&&(g.level||1)<=99;
export function experienceFactor(level,monsterLevel){const gap=Math.abs(level-monsterLevel);return gap<=20?1:gap>40?0:(41-gap)/21;}
export const REBIRTH_ZONES=['volcano','abyss','ruins','eclipse','celestial'];
export function rebirthEligibility(p,secondJobs){if(p.reborn)return '已完成轉生';if(p.location!=='town')return '請回村莊轉生';if(!secondJobs[p.job]||p.level<99||p.jobLevel<50)return '需要二轉 Base99／Job50';if(!REBIRTH_ZONES.every(id=>p.quests?.[id]?.done))return '需完成五個區域的征途任務';return null;}
export function normalizeProgression(p){p.reborn=p.reborn===true;p.quests=p.quests&&typeof p.quests==='object'?p.quests:{};p.autoSellJunk=Array.isArray(p.autoSellJunk)?[...new Set(p.autoSellJunk.filter(x=>typeof x==='string'))]:[];p.capturePity=p.capturePity&&typeof p.capturePity==='object'?p.capturePity:{};return p;}
