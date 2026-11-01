const num=(s,key)=>Math.max(0,Number(s[key])||0);
export const petOffense=(s,role)=>['magic','support'].includes(role)?num(s,'matk'):role==='defense'?num(s,'def')*.7+num(s,'atk')*.3:num(s,'atk');
// The contribution target measures actual companion strikes separately from
// damage amplified on the owner's skills. Offense builds spend their budget on
// direct hits; guardian/healer builds trade that damage for protection.
export function petDirectRoleMultiplier(role,level=1){
 if(level<=50)return 1;
 // At 201 all combat-ready companions wear SSS pet gear; multiplying their
 // attacks by the old naked-pet coefficient would double-count the promotion.
 const phase=level>=201?8.5:level>=151?7.5:level>=101?24:level>=51?3:1;
 return role==='attack'?phase*.8:role==='magic'?phase:role==='defense'?phase*.48:phase*.42;
}
// A fused companion's two ordered roles determine its combat budget. This is
// deliberately NOT a universal 50/40/10 damage quota: attack+magic sacrifices
// mitigation and team buffs for burst, while a magic-led defender spends more
// of its budget on guarding. Only direct pet hits change; resonance/buffs keep
// their own ledger entries and damage-source ownership.
export function fusionDirectOutputFactor(pet){
 if(!pet?.fusion)return 1;
 const {main,sub}=pet.fusion;
 if(main==='attack'&&sub==='magic')return 1.6;
 if(main==='magic'&&sub==='defense')return .9;
 return 1;
}
export const petOffensivePower=(s,role)=>petOffense(s,role);
export function blessingStrength(skill,s,role){const potency=role==='attack'?num(s,'atk')*.8+num(s,'matk')*.2:role==='defense'?num(s,'def')*.8+num(s,'hp')*.025:role==='support'?num(s,'healPower')*.7+num(s,'matk')*.3:num(s,'matk');return Math.min((skill.family==='fusion'?.12:.18)*(num(s,'quality')||1),skill.power*potency/(25+num(s,'level')*8));}
export function petSkillEffect(skill,s,role){let value=0,duration=0;const power=skill.power,offense=skill.basis==='siege'?num(s,'atk')*.8+num(s,'def')*.35:skill.basis==='bastion'?num(s,'matk')*.8+num(s,'mdef')*.45:skill.kind==='magic'?num(s,'matk'):petOffense(s,role);
 if(skill.kind==='blessing'){value=blessingStrength(skill,s,role);duration=skill.duration||8000;}
 else if(skill.kind==='guard'){value=Math.round(num(s,'def')*power+num(s,'mdef')*.35+num(s,'hp')*.06);duration=4500+Math.min(2500,Math.round((num(s,'def')+num(s,'mdef'))*3));}
 else if(skill.kind==='shield'){const basis=role==='defense'?num(s,'def')*.85+num(s,'mdef')*.25+num(s,'hp')*.04:role==='magic'?num(s,'matk')*.65+num(s,'mdef')*.35:role==='support'?num(s,'healPower')*.7+num(s,'matk')*.3:num(s,'atk')*.45+num(s,'def')*.55;value=Math.round(basis*power);}
 else if(skill.kind==='heal'||skill.kind==='regen'){value=Math.round((role==='support'?num(s,'healPower'):role==='magic'?num(s,'matk')*.8:role==='defense'?num(s,'def')*.6+num(s,'hp')*.025:num(s,'atk')*.6)*power);}
 else if(skill.kind==='mana'){value=Math.round((['magic','support'].includes(role)?num(s,'matk')*.65+num(s,'healPower')*.35+num(s,'sp')*.035:petOffense(s,role)*.5+num(s,'sp')*.025)*power);}
 else value=Math.round(offense*power);
 return {value:skill.kind==='blessing'?value:Math.max(1,value),duration};
}
function basePetSkillPreview(skill,s,role){const e=petSkillEffect(skill,s,role),source=['magic','support'].includes(role)?'MATK':role==='defense'?'DEF／ATK':'ATK';if(skill.kind==='blessing')return `主人傷害 +${(e.value*100).toFixed(1)}% · ${e.duration/1000}秒（依自身能力）`;if(skill.kind==='guard')return `${skill.counter?'受擊反擊DEF '+skill.counter*100+'%（每0.8秒最多一次）；':''}DEF／MDEF／HP · 預估共用護盾 ${e.value}（優先保護夥伴） · 守護 ${(e.duration/1000).toFixed(1)}秒，每秒自療 ${Math.round(num(s,'def')*.08)}`;if(skill.kind==='shield')return `依自身防護／法術能力 · 預估共用護盾 ${e.value}；優先保護夥伴，餘額給主人，持續6.5秒`;if(skill.kind==='regen')return `每${(skill.interval||1500)/1000}秒恢復 ${e.value} HP，共${skill.ticks||5}次，優先治療缺血一方`;if(skill.kind==='heal')return `依自身治療能力 · 預估回復 HP ${e.value}（優先治療生命比例較低的一方）`;if(skill.kind==='mana')return `MATK／治療強度／最大SP · 預估回復 SP ${e.value}`;if(skill.kind==='bleed')return `${source} ${Number((skill.power*100).toFixed(1))}% · 預估 ${e.value}/跳，共${skill.ticks||3}跳`;if(skill.kind==='mark')return `${source} ${Number((skill.power*100).toFixed(1))}% · 下${skill.hits||2}次命中各附加 ${e.value}`;return `${skill.basis==='siege'?'ATK80%＋DEF35%':skill.basis==='bastion'?'MATK80%＋MDEF45%':skill.kind==='magic'?'MATK':source} ${Number((skill.power*100).toFixed(1))}% · 預估傷害 ${e.value}（未計防禦）`;}
export const supportPulse=s=>({hp:Math.max(1,Math.round(num(s,'healPower')*.85)),sp:Math.max(1,Math.round(num(s,'healPower')*.11+num(s,'sp')*.03))});
export function resonanceMagnitude(rule,s){if(rule.effect==='shield')return Math.round((num(s,'def')+.25*num(s,'mdef')+.035*num(s,'hp'))*rule.power);if(rule.effect==='heal')return Math.round(num(s,'healPower')*rule.power);if(rule.effect==='mana')return Math.round((num(s,'healPower')*.75+num(s,'matk')*.25+num(s,'sp')*.025)*rule.power);return Math.round(num(s,rule.effect==='magic'?'matk':'atk')*rule.power);}
export const petUltimateSupport=s=>({shield:Math.round(num(s,'def')*2.2+num(s,'mdef')*.5+num(s,'hp')*.08),hp:Math.round(num(s,'healPower')*2.8+num(s,'matk')*.4),sp:Math.round(num(s,'matk')*.7+num(s,'sp')*.08)});

export function petSkillPreview(skill,s,role,fusionPet=null){const multiplier=petDirectRoleMultiplier(role,s.level)*fusionDirectOutputFactor(fusionPet),direct=!['blessing','guard','shield','heal','regen','mana','mark'].includes(skill.kind);return basePetSkillPreview(skill,s,role)+(direct&&multiplier!==1?` · 角色定位實際直傷係數×${Number(multiplier.toFixed(2))}`:'')+(skill.splash?` · 其他最多3體各受主傷害${Math.round(skill.splash*100)}%`:'')+(skill.ignoreDef?` · 技能無視防禦${skill.ignoreDef}%`:'')+(skill.petRestore?` · 自身回復最大SP${Math.round(skill.petRestore*100)}%`:'')+(skill.kind==='drain'&&skill.family==='fusion'?' · 主人與自身各回復有效主目標傷害45%，單次各最多自身最大HP12%':'')+(skill.leech?` · 持續傷害${Math.round(skill.leech*100)}%轉為治療`:'');}
