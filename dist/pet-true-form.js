// Appearance-only secret. Never unlock during normalization or offline simulation.
export const TRUE_FORMS={
 'attack-magic':'星焰真契者','attack-defense':'鎮界龍衛','attack-support':'聖瑞麟劍士','magic-attack':'赤曜星羽姬',
 'magic-defense':'星岩晶詠者','magic-support':'聖光羽靈姬','defense-attack':'赤曜鎧聖','defense-magic':'星曜符衛',
 'defense-support':'碧玉聖庭守望者','support-attack':'赤曜麟武姬','support-magic':'星羽瑞雲仙','support-defense':'聖岩麟角賢者'
};
export const trueFormKey=pet=>pet?.fusion?pet.fusion.main+'-'+pet.fusion.sub:null;
export const trueFormReady=pet=>!!TRUE_FORMS[trueFormKey(pet)]&&pet.level>=200&&pet.loyalty>=500&&pet.trueForm!==true;
export const trueFormName=pet=>pet?.trueForm===true?TRUE_FORMS[trueFormKey(pet)]||null:null;
export const trueFormArt=pet=>trueFormName(pet)?`assets/true-forms/companions.svg#${trueFormKey(pet)}`:null;
export const TRUE_FORM_MESSAGE='恭喜！一路同行至今，你們早已親密無間。如今，牠終於願意卸下守護的外形，以原本的模樣與你相見。';
