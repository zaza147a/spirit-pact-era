export const characterLevelCap=p=>p.reborn?150:99;
export const attributeCap=p=>p.reborn&&p.level>=100?120:99;
export const ignoresGearLevel=(p,g)=>!!p.reborn&&(g.level||1)<=99;
export const isTown=location=>['town','skycity'].includes(location);
export const homeTown=location=>['skyport','gearfell','aether','stormforge','zenith','skycity'].includes(location)?'skycity':'town';
export const jobLevelCap=p=>p.reborn&&['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'].includes(p.job)?70:50;
export function experienceFactor(level,monsterLevel,reborn=false){if(reborn&&monsterLevel<=99)return 1;const gap=Math.abs(level-monsterLevel);return gap<=20?1:gap>40?0:(41-gap)/21;}
export const REBIRTH_ZONES=['volcano','abyss','ruins','eclipse','celestial'];
export function rebirthEligibility(p,secondJobs){if(p.reborn)return '已完成轉生';if(p.location!=='town')return '請回村莊轉生';if(!secondJobs[p.job]||p.level<99||p.jobLevel<50)return '需要二轉 Base99／Job50';if(!REBIRTH_ZONES.every(id=>p.quests?.[id]?.done))return '需完成五個區域的征途任務';return null;}
export function normalizeProgression(p){p.reborn=p.reborn===true;p.quests=p.quests&&typeof p.quests==='object'?p.quests:{};p.autoSellJunk=Array.isArray(p.autoSellJunk)?[...new Set(p.autoSellJunk.filter(x=>typeof x==='string'))]:[];p.capturePity=p.capturePity&&typeof p.capturePity==='object'?p.capturePity:{};return p;}
