// Deterministic one-companion resonance state machine. No random rolls here:
// the game supplies the event clock, target and source. A profile owns one
// cooldown and one charge counter; changing pets/profiles starts fresh.
export const SPIRIT_PROC_RULES=Object.freeze({
 armorBreak:{charges:3,cooldownMs:5000,bonusPct:12,ignoreDef:10},
 elementMark:{charges:2,cooldownMs:4800,bonusPct:14,magic:true},
 retaliation:{charges:1,cooldownMs:6500,bonusPct:10,shieldPct:3},
 selfSustain:{charges:4,cooldownMs:6000,bonusPct:8,healPct:2},
 markedChase:{charges:2,cooldownMs:5000,bonusPct:13},
 arcaneCharge:{charges:2,cooldownMs:5000,bonusPct:14,magic:true},
 guardCounter:{charges:1,cooldownMs:7000,bonusPct:10,shieldPct:4},
 supportCycle:{charges:3,cooldownMs:7000,bonusPct:8,healPct:3},
 dualPolarity:{charges:2,cooldownMs:7500,bonusPct:18,ignoreDef:6,alternating:true},
 armorBurst:{charges:2,cooldownMs:7000,bonusPct:17,ignoreDef:12},
 chainSlash:{charges:2,cooldownMs:6500,bonusPct:15,cleaveTargets:2},
 arcaneCounter:{charges:1,cooldownMs:8000,bonusPct:18,shieldPct:3,magic:true},
 castHaste:{charges:3,cooldownMs:8000,bonusPct:14,cooldownReductionMs:400},
 oathBurst:{charges:1,cooldownMs:10000,bonusPct:20,healPct:3,hpBelow:40},
 dualElement:{charges:2,cooldownMs:7500,bonusPct:18,alternating:true},
 armorPierce:{charges:1,cooldownMs:7000,bonusPct:17,ignoreDef:12},
 petChase:{charges:2,cooldownMs:6500,bonusPct:15,cleaveTargets:2},
 arcaneRetaliation:{charges:1,cooldownMs:8000,bonusPct:17,shieldPct:4,magic:true},
 petCooldown:{charges:3,cooldownMs:8000,bonusPct:12,cooldownReductionMs:500},
 guardianVerdict:{charges:3,cooldownMs:6500,bonusPct:20,healPct:3}
});

export function createSpiritProcState(){return {key:null,charges:0,lastAt:-Infinity,lastChannel:null,lastTarget:null};}
export function advanceSpiritProc(state,profile,event,{now=0,channel='physical',hpPercent=100,targetId=null}={}){
 if(!state||!profile||event!==profile.trigger)return null;
 const rule=SPIRIT_PROC_RULES[profile.effect];
 if(!rule)return null;
 const key=[profile.stage,profile.source,profile.fusion||profile.baseRole,profile.effect].join(':');
 if(state.key!==key){
  state.key=key;state.charges=0;state.lastAt=-Infinity;state.lastChannel=null;state.lastTarget=null;
 }
 if(rule.hpBelow!==undefined&&hpPercent>rule.hpBelow)return null;
 if(rule.alternating&&state.lastChannel===channel)return null;
 if(rule.alternating)state.lastChannel=channel;
 state.charges=Math.min(rule.charges,state.charges+1);
 if(state.charges<rule.charges||now-state.lastAt<rule.cooldownMs)return null;
 state.charges=0;state.lastAt=now;state.lastTarget=targetId;
 return {effect:profile.effect,source:profile.source,bonusPct:rule.bonusPct,
  ignoreDef:rule.ignoreDef||0,shieldPct:rule.shieldPct||0,healPct:rule.healPct||0,
  cooldownReductionMs:rule.cooldownReductionMs||0,cleaveTargets:rule.cleaveTargets||0};
}
