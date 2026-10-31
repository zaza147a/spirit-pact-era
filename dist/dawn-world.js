import {normalMonsterStats} from './progression.js';
const base=normalMonsterStats(200);
export const DAWN_ZONE={id:'dawnrift',name:'黎明斷層',min:201,max:210,icon:'🌅',continent:'dawn',names:['晨晶巡狩獸','曙岩角羊','流光翼魟']};
export const DAWN_MONSTERS=DAWN_ZONE.names.map((name,i)=>({id:['dawn-scout','dawn-ram','dawn-ray'][i],name,level:201+i*4,map:'dawnrift',icon:'🌅',role:'attack',roleName:'曙界生物',hp:Math.round(base.hp*(8+i*.8)),atk:Math.round(base.atk*(14+i*.8)),def:Math.round(base.def*(2+i*.2)),xp:Math.round(base.xp*(1.05+i*.05)),gold:0,drops:[],dawn:true,junkId:['dawn_scout_fang','dawn_ram_horn','dawn_ray_membrane'][i],artPath:`assets/sky-trials/${['dawn-scout','dawn-ram','dawn-ray'][i]}.webp`}));
export const DAWN_BOSS={...DAWN_MONSTERS[2],id:'dawn-archon',junkId:'dawn_archon_crystal',name:'黎明裁界者',boss:true,level:210,hp:Math.round(base.hp*60),atk:Math.round(base.atk*55),def:Math.round(base.def*3),xp:Math.round(base.xp*6),artPath:'assets/sky-trials/dawn-archon.webp'};
export const DAWN_MAPS={dawncity:{name:'曙光聖港',eyebrow:'DAWN CONTINENT / SAFE HAVEN',capture:false},dawnrift:{name:'黎明斷層',eyebrow:'DAWN FRONTIER / 201–210',min:201,max:210,capture:false}};
