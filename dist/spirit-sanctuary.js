import {homecomingBonuses} from './homecoming-state.js';
import {normalizeLoyalty} from './pet-ascension.js';

export const SPIRIT_SANCTUARY_MAP='spirit-sanctuary';
export const SPIRIT_SANCTUARY_MONSTERS=Object.freeze([
 {id:'fang',level:100,hp:950,atk:130,def:80,xp:0},
 {id:'wisp',level:100,hp:850,atk:145,def:65,xp:0},
 {id:'shell',level:100,hp:1250,atk:105,def:125,xp:0},
 {id:'sprout',level:100,hp:900,atk:110,def:85,xp:0}
]);
export const spiritSanctuaryUnlocked=p=>homecomingBonuses(p).count>=1;
export const isCaptureSanctuary=location=>location==='petland'||location===SPIRIT_SANCTUARY_MAP;

export function normalizeSpiritSanctuary(p){
 const s=p.spiritSanctuary||{};
 p.spiritSanctuary={notified:s.notified===true,visited:s.visited===true};
 return p.spiritSanctuary;
}
export function announceSpiritSanctuary(p){
 const state=normalizeSpiritSanctuary(p);
 if(!spiritSanctuaryUnlocked(p)||state.notified)return false;
 state.notified=true;
 return true;
}
export function visitSpiritSanctuary(p){
 if(!spiritSanctuaryUnlocked(p))return false;
 normalizeSpiritSanctuary(p).visited=true;
 return true;
}
export function spiritSanctuaryTracker(p){
 if(!spiritSanctuaryUnlocked(p)||p.spiritSanctuary?.visited)return '';
 return '<article class="quest-track-card" data-ui-key="spirit-sanctuary"><b>✦ 新任務：契靈之地</b><span>返鄉契約已完成。夥伴的信任引領你前往曙界新陸的契靈之地；這裡的神話夥伴天生忠誠 100。</span><button type="button" data-spirit-sanctuary-guide>前往契靈之地</button></article>';
}
export function blessSanctuaryPet(pet){
 pet.level=100;pet.xp=0;pet.rarity='mythic';pet.evolution=4;pet.ascended=true;
 pet.loyalty=100;pet.loyaltyKills=0;pet.loyaltyVersion=2;
 normalizeLoyalty(pet);
 return pet;
}
