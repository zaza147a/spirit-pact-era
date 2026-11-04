import {CLASSES,SLOTS} from '../../dist/catalog.js';

// Starter character generated from the current fresh() save schema.
// It contains no enhanced gear, cards, second job or hand-authored pet stats.
export function starterPlayer(){
 const slots=Object.fromEntries(Object.keys(SLOTS).map(slot=>[slot,null]));
 return {
  version:51,name:'DualTest',job:'spiritist',location:'petland',
  level:1,xp:0,jobLevel:1,jobXp:0,jobPoints:0,statPoints:0,
  hp:CLASSES.spiritist.hp,mp:CLASSES.spiritist.mp,
  gold:90,kills:0,cardRecyclePoints:0,
  bag:[],gear:slots,attributes:{STR:1,AGI:1,VIT:1,INT:1,DEX:1,LUK:1},
  sockets:structuredClone(slots),cards:[],pets:[],
  activePetId:null,secondaryPetId:null,petBook:{},resonance:0,shield:0,
  battleHistory:[],autoUltimate:false,autoPotions:{playerHp:false,playerSp:false,petHp:false,petSp:false},
  offline:{enabled:true,at:2000000000000}
 };
}
