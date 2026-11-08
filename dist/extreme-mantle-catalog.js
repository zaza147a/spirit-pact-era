// Four trials × twelve final jobs. The wardrobe owns the trial choice;
// the character's job determines which artwork is displayed.
export const EXTREME_MANTLE_JOBS=Object.freeze([
 'knight','crusader','assassin','rogue','hunter','performer',
 'wizard','sage','priest','monk','pactWarrior','spiritCommander'
]);
export const EXTREME_MANTLE_KINDS=Object.freeze(['atk','matk','hp','clear']);
export const EXTREME_MANTLE_CATALOG=Object.freeze(EXTREME_MANTLE_KINDS.flatMap(kind=>
 EXTREME_MANTLE_JOBS.map(job=>Object.freeze({id:`${kind}_${job}`,kind,job,
  art:`assets/extreme/mantles/${kind}-${job}.webp`}))));
export const EXTREME_MANTLE_READY=Object.freeze(['atk_knight','atk_crusader','atk_assassin','atk_rogue','atk_hunter','atk_performer','atk_wizard','atk_sage','atk_priest','atk_monk','atk_pactWarrior','atk_spiritCommander','matk_knight','matk_crusader','matk_assassin','matk_rogue','matk_hunter','matk_performer','matk_wizard','matk_sage','matk_priest','matk_monk','matk_pactWarrior','matk_spiritCommander','hp_knight','hp_crusader','hp_assassin']);

export const EXTREME_MANTLE_V2_READY=Object.freeze(['atk_knight','atk_crusader','atk_assassin']);

export function extremeMantleVariant(job,kind){
 return EXTREME_MANTLE_CATALOG.find(item=>item.job===job&&item.kind===kind)||null;
}

// Existing trial-specific artwork remains visible until all 48 class-specific
// illustrations have been produced and reviewed; no broken-image placeholders.
export function extremeMantleArt(job,kind,{classArtReady=EXTREME_MANTLE_READY.includes(`${kind}_${job}`)}={}){
 const variant=extremeMantleVariant(job,kind);
 if(!variant)return null;
 if(EXTREME_MANTLE_V2_READY.includes(`${kind}_${job}`))return `assets/extreme/mantles-v2/${kind}-${job}.webp`;
 return classArtReady?variant.art:`assets/extreme/outfit-${kind}.webp`;
}
