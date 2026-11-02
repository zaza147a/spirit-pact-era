// Manual-only emergency tactics. They never enter auto-skill selection or
// offline simulation; cooldown timestamps live on the character save.
export const TACTIC_COOLDOWN_MS=60_000;
export const SECOND_TACTICS={
 knight:{name:'龍血突擊',kind:'burst',duration:6000,spPct:15,description:'物理最終傷害+25%、額外無視DEF 15%；受到傷害+10%'},
 crusader:{name:'王權庇護',kind:'guard',duration:5000,spPct:15,description:'自身最終減傷40%、夥伴25%，立即獲得最大HP 10%護盾'},
 wizard:{name:'星界超載',kind:'instant',duration:6000,spPct:20,description:'6秒內下一次魔法攻擊免詠唱、該次最終傷害+30%；原冷卻照常'},
 sage:{name:'元素暴走',kind:'elemental',duration:6000,spPct:18,charges:3,description:'6秒內三次魔法拳命中追加40%魔法傷害，不連鎖共鳴'},
 assassin:{name:'死亡宣告',kind:'execute',duration:6000,spPct:15,description:'指定目標所受自身傷害+15%，HP30%以下改為+35%'},
 rogue:{name:'幻影替身',kind:'decoy',duration:4000,spPct:20,description:'4秒內抵擋一次致命攻擊並保留1HP，觸發後2秒減傷30%'},
 priest:{name:'神聖救贖',kind:'rescue',duration:3000,spPct:25,description:'人物與夥伴立即回復最大HP35%、解除可解除的控制，3秒減傷15%'},
 monk:{name:'修羅解放',kind:'frenzy',duration:5000,spPct:30,description:'物理最終傷害+40%、攻擊速度+10%，受到傷害+25%'},
 hunter:{name:'獵神鎖定',kind:'mark',duration:6000,spPct:15,description:'指定目標必定命中，遠距物理最終傷害+25%；目標死亡即結束'},
 performer:{name:'終焉協奏',kind:'duet',duration:7000,spPct:20,description:'人物與夥伴最終傷害+20%，受到傷害-10%'}
};
export const FIRST_TACTICS={
 swordsman:{name:'防禦姿態',kind:'firstShield',duration:6000,spPct:10,description:'立即取得最大HP20%護盾'},
 acolyte:{name:'緊急治癒',kind:'firstHeal',duration:0,spPct:10,description:'立即回復最大HP30%'},
 mage:{name:'魔力凝聚',kind:'firstMana',duration:0,spPct:10,description:'立即回復最大SP30%'},
 thief:{name:'殘影步伐',kind:'firstDodge',duration:5000,spPct:10,description:'5秒內受到最終傷害降低25%'},
 archer:{name:'鷹眼專注',kind:'firstFocus',duration:5000,spPct:10,description:'5秒內命中+20、暴擊率+5%'}
};
export const manualTactic=job=>SECOND_TACTICS[job]||FIRST_TACTICS[job]||null;
export const tacticSPCost=(maxSp,rule)=>Math.max(1,Math.ceil(Math.max(0,maxSp)*rule.spPct/100));
export const tacticRemaining=(player,now)=>Math.max(0,Math.ceil(((player?.tacticReadyAt||0)-now)/1000));
export const tacticActive=(player,now)=>player?.tacticEffect?.until>now?player.tacticEffect:null;
export function tacticDamageFactor(effect,job,target,magical){
 if(!effect)return 1;
 switch(effect.kind){
 case 'burst':return magical?1:1.25;
 case 'frenzy':return magical?1:1.4;
 case 'duet':return 1.2;
 case 'execute':return effect.target===target?.instanceId?(target.hp<=target.maxHp*.3?1.35:1.15):1;
 case 'mark':return !magical&&effect.target===target?.instanceId?1.25:1;
 default:return 1;
 }
}
export function tacticIncomingFactor(effect,toPet=false){
 if(!effect)return 1;
 switch(effect.kind){
 case 'guard':return toPet?.75:.6;
 case 'rescue':return .85;
 case 'duet':return .9;
 case 'frenzy':return toPet?1:1.25;
 case 'burst':return toPet?1:1.1;
 case 'firstDodge':return toPet?1:.75;
 case 'decoyGuard':return toPet?1:.7;
 default:return 1;
 }
}
