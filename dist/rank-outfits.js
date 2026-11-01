// Cosmetic identities only. Never imported by combat formulas.
export const RANK_OUTFIT_VERSION='6.5.0';
export const RANK_OUTFITS=Object.freeze({
 knight:{motif:'龍槍、騎兵甲、龍紋重裝',names:['赤槍遊騎','龍紋槍衛','焰龍盧恩統御者']},
 crusader:{motif:'皇家劍盾、王庭重甲、聖誓反擊',names:['青誓禁衛','王庭聖盾','獅心皇家統帥']},
 wizard:{motif:'巫帽、星隕法杖、彗尾法袍',names:['暮星術士','雙極星詠','群星墜界者']},
 sage:{motif:'魔導拳套、學者戰衣、元素符書',names:['元素研習者','魔導拳師','萬象符拳賢者']},
 assassin:{motif:'拳刃、毒刃潛行裝、斬首面甲',names:['暮刃潛行者','蝕毒追獵者','終夜斬首者']},
 rogue:{motif:'短刃、手弩、幻影遊掠長衣',names:['黃巾掠影','幻影遊掠者','星鎖劫影王']},
 priest:{motif:'祈禱書、主教冠、聖堂祭服',names:['晨禱療者','聖域主祭','天穹聖典大主教']},
 monk:{motif:'拳纏、金剛拳鎧、修羅氣勁',names:['赤心修行者','金剛氣鬥士','極意修羅']},
 hunter:{motif:'長弓、鷹獵披風、天弓羽甲',names:['林哨獵手','銀羽鷹衛','天弓巡界者']},
 performer:{motif:'豎琴、演奏禮服、晶弦舞台裝',names:['旅歌奏者','晶弦領奏者','萬籟星律詠者']}
});
const ranks=['S','SS','SSS'];
export function rankOutfitArt(job,rank){return Object.hasOwn(RANK_OUTFITS,job)&&ranks.includes(rank)?`assets/rank-outfits/${job}-${rank}.webp?v=${RANK_OUTFIT_VERSION}`:null;}
export function rankOutfitName(job,rank){return Object.hasOwn(RANK_OUTFITS,job)?RANK_OUTFITS[job].names[ranks.indexOf(rank)]||null:null;}
