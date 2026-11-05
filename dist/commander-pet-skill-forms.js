// The Commander reshapes the ONE fused pet's three equipped skill slots.
// The role follows the player's skill order, never the unordered fusion input.
export const COMMANDER_SKILL_FORMS=Object.freeze([
 {name:'主攻',targets:3,primary:1.20,secondary:.50},
 {name:'範圍',targets:6,primary:.95,secondary:.75},
 {name:'終結',targets:4,primary:1.80,secondary:.40}
]);
export function commanderPetSkillForm(player,pet,skill){
 if(player?.job!=='spiritCommander'||!pet?.fusion||!skill)return null;
 const selected=pet.equippedSkills||[];
 const index=selected.indexOf(skill.id);
 if(index<0||index>2)return null;
 return {...COMMANDER_SKILL_FORMS[index],slot:index};
}
export function commanderSupportSkillPower(stats,role,form){
 if(!form)return 0;
 const base=['magic','support'].includes(role)?stats.matk:stats.atk;
 return Math.max(1,Math.round(base*[2.5,2.2,3.2][form.slot]));
}
