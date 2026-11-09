// All ten owner sockets use obtainable boss cards. New spirit careers get the
// sole Lv210 exclusive right-hand card; never duplicate a card ID or bypass a slot.
import {CARDS,SLOTS} from '../../dist/catalog.js';
import {bossCardEquipAllowed} from '../../dist/boss-card-runtime.js';

const MAGIC_JOBS=new Set(['wizard','sage','priest','spiritCommander']);
const OPTIONS={
 headUpper:['boss_skyport','boss_starter'],
 headMiddle:['boss_gearfell','boss_forest'],
 headLower:['boss_aether','boss_desert'],
 armor:['boss_frost','boss_stormforge'],
 rightHand:['boss_zenith','boss_astral'],
 leftHand:['boss_volcano','boss_starshore'],
 garment:['boss_oathwood','boss_abyss'],
 shoes:['boss_nightclock','boss_ruins'],
 accessory1:['boss_sungrave','boss_eclipse'],
 accessory2:['boss_celestial','boss_worldroot']
};

export function equipExtremeBossCards(player){
 const magic=MAGIC_JOBS.has(player.job);
 const chosen={};
 for(const slot of Object.keys(SLOTS)){
  const preferred=slot==='rightHand'&&['pactWarrior','spiritCommander'].includes(player.job)
   ?['dawn-archon']
   :slot==='rightHand'&&magic?['boss_astral','boss_zenith']
   :slot==='accessory2'&&!magic?['boss_worldroot','boss_celestial']
   :OPTIONS[slot];
  const id=preferred?.find(id=>CARDS[id]?.boss&&bossCardEquipAllowed(CARDS[id],slot,player.job)&&!Object.values(chosen).includes(id));
  if(!id)throw Error(`no permitted boss card for ${player.job}/${slot}`);
  chosen[slot]=id;
 }
 if(Object.keys(chosen).length!==10)throw Error('missing boss card socket');
 player.sockets=chosen;
 return chosen;
}
