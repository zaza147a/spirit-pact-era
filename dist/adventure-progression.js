import {HOMECOMING_ROUTES,homecomingMap} from './homecoming-data.js';
export const characterLevelCap=p=>p.thirdJob?(p.dawnUnlocked?210:200):p.reborn?150:99;
export const attributeCap=p=>p.level>=201?150:p.reborn&&p.level>=100?120:99;
export const ignoresGearLevel=(p,g)=>!!p.reborn&&(g.level||1)<=99;
export const isTown=location=>homecomingMap(location)?.kind==='town'||['town','skycity','dawncity'].includes(location);
export const homeTown=location=>homecomingMap(location)?.route.townId||(['dawncity','dawnrift'].includes(location)?'dawncity':['skyport','gearfell','aether','stormforge','zenith','skycity','starshore','oathwood','nightclock','sungrave','worldroot'].includes(location)?'skycity':'town');
export const jobLevelCap=p=>p.reborn&&['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer','pactWarrior','spiritCommander'].includes(p.job)?70:50;
export function experienceFactor(level,monsterLevel,reborn=false){if(reborn&&monsterLevel<=99)return 1;const gap=Math.abs(level-monsterLevel);return gap<=20?1:gap>40?0:(41-gap)/21;}
export const REBIRTH_ZONES=['volcano','abyss','ruins','eclipse','celestial'];
export const REBIRTH_CORE_ID='rebirth_core';
export function rebirthEligibility(p,secondJobs){if(p.reborn)return '已完成轉生';if(p.location!=='town')return '請回村莊轉生';if(!secondJobs[p.job]||p.level<99||p.jobLevel<50)return '需要二轉 Base99／Job50';if(!p.bag?.some(e=>e.id===REBIRTH_CORE_ID&&e.qty>=1))return '需要擊敗99級星宮首領取得轉生核心×1';return null;}
export function normalizeProgression(p){p.reborn=p.reborn===true;p.thirdJob=p.thirdJob===true&&p.reborn;p.secondJobLevel=Math.min(70,Math.max(1,Number(p.secondJobLevel)||70));p.quests=p.quests&&typeof p.quests==='object'?p.quests:{};for(const map of REBIRTH_ZONES)delete p.quests[map];p.autoSellJunk=Array.isArray(p.autoSellJunk)?[...new Set(p.autoSellJunk.filter(x=>typeof x==='string'))]:[];p.capturePity=p.capturePity&&typeof p.capturePity==='object'?p.capturePity:{};return p;}
