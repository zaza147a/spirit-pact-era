// Visual intent for skills, keyed by stable combat skill ID where available.
// Pure presentation metadata; never used by combat, inventory, or saves.
const third={
 knight:['lance','quake','lance'],crusader:['royalShield','royalSanctuary','royalJudgment'],
 wizard:['meteor','meteorRain','void'],sage:['elementFist','elementStorm','elementBurst'],
 assassin:['dualBlade','bladeStorm','execute'],rogue:['shadowBlade','ambush','execute'],
 priest:['holyBeam','sanctuary','judgment'],monk:['dragonFist','quake','dragonFist'],
 hunter:['falconArrow','arrowRain','snipe'],performer:['starNote','symphony','finale']
};
const named={
 bash:'bash',magnum:'flameBurst',holy:'holyBeam',fire:'firebolt',ice:'frostbolt',
 double:'dualBlade',poison:'poisonBlade',backstab:'ambush',pierce:'lance',
 shieldBash:'shieldStrike',holyCross:'holyCross',thunder:'lightning',meteor:'meteor',arcaneStorm:'arcaneStorm',
 spellFist:'elementFist',elementStrike:'elementBurst',autoSpell:'arcaneStorm',
 dualStrike:'dualBlade',katarSlash:'bladeStorm',sonicBlow:'execute',daggerDance:'bladeStorm',gangAmbush:'ambush',
 holyJudgment:'holyBeam',exorcism:'sanctuary',chainCombo:'dragonFist',spiritPalm:'energyPalm',asura:'dragonFist',
 falconStrike:'falconArrow',arrowRain:'arrowRain',beastMark:'snipe',sonicNote:'starNote',
 dissonance:'symphony',encore:'finale',aimShot:'snipe'
};
const rebirth={knight:'lance',crusader:'shieldArray',wizard:'meteor',sage:'elementFist',assassin:'dualBlade',rogue:'shadowBlade',priest:'sanctuary',monk:'dragonFist',hunter:'falconArrow',performer:'finale'};
const semantic=[
 [/盾裁|盾擊|盾陣|聖盾/,'holyShield'],[/十字|聖裁|聖光|神諭|審判/,'holyBeam'],
 [/龍槍|貫星|突刺|槍/,'lance'],[/箭雨|風暴獵場/,'arrowRain'],[/蒼鷹|獵鷹/,'falconArrow'],[/狙擊|星墜/,'snipe'],
 [/流星雨|星隕|隕滅|隕石/,'meteorRain'],[/雷|電/,'lightning'],[/冰|寒霜/,'frostbolt'],[/炎|火|怒爆/,'flameBurst'],
 [/虛空|崩解/,'void'],[/元素迴環|四象|自詠/,'elementStorm'],[/元素|爆轟/,'elementBurst'],
 [/幻滅|雙刃|雙刀/,'dualBlade'],[/死亡旋舞|旋舞|刀舞/,'bladeStorm'],[/斬魂|處刑|奪命|終式/,'execute'],
 [/暗街|伏殺|背刺/,'ambush'],[/逐影|掠影|夜行|暗巷/,'shadowBlade'],
 [/龍虎|修羅|震地|震天/,'dragonFist'],[/氣功|破空|拳/,'energyPalm'],
 [/銀河交響|協奏|旋律|樂章|音刃/,'symphony'],[/終幕|絕奏|終曲/,'finale'],[/星弦|天籟/,'starNote'],
 [/治癒|復甦|回天|恢復/,'heal'],[/守護|護幕|護身|聖域/,'shield'],[/祈禱|凝聚|調元/,'mana']
];
export function visualForSkill({skillId='',name='',kind='',range='',finisher=false}={}){
 if(kind==='heal')return 'heal';if(kind==='shield')return 'shield';if(kind==='mana')return 'mana';if(kind==='buff')return 'buff';
 const thirdId=/^third(Main|Wide|Finish)_(\w+)$/.exec(skillId);
 if(thirdId&&third[thirdId[2]])return third[thirdId[2]][{Main:0,Wide:1,Finish:2}[thirdId[1]]];
 const reborn=/^rebirthMain_(\w+)$/.exec(skillId);if(reborn&&rebirth[reborn[1]])return rebirth[reborn[1]];
 if(named[skillId])return named[skillId];
 for(const [pattern,visual] of semantic)if(pattern.test(name))return visual;
 if(finisher)return 'execute';
 return kind==='magic'?'arcaneStorm':range==='ranged'?'snipe':'bash';
}
export const THIRD_SKILL_VISUALS=third;
