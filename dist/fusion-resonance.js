import {REBIRTH_FUSION_DATA} from './rebirth-fusion-data.js';
import {REBIRTH_MAIN_REPLACES,jobSkillById} from './job-skills.js';
import {resonanceRule} from './resonance.js';
import {fusedPair,companionRole,fusionKey,FUSION_PAIRS} from './pet-fusion.js';
import {THIRD_JOBS} from './third-jobs.js';
import {THIRD_CONTRACT_DATA} from './fusion-contract-data.js';
const rows=THIRD_CONTRACT_DATA;
const FUSION_BASE_ORDER=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const contractIndex=key=>FUSION_BASE_ORDER.indexOf(key.split('-').sort((a,b)=>['attack','magic','defense','support'].indexOf(a)-['attack','magic','defense','support'].indexOf(b)).join('-'));


// Six legacy families retain their validated contracts. Reverse main/sub paths
// receive their own *mechanical* specialization, not just a different name.
// The modifiers use existing pact keys already handled by combat runtime.
const REVERSE_KEYS=new Set(['magic-attack','defense-attack','support-attack','defense-magic','support-magic','support-defense']);
const FUSION_JOB_SPECIALTY={
 knight:'petAttack',crusader:'petArmor',wizard:'magic',sage:'autoPower',
 assassin:'execute',rogue:'single',priest:'leech',monk:'petAttack',
 hunter:'targets',performer:'haste'
};
const REVERSE_ROUTE_SPECIALTY={
 'magic-attack':'magic','defense-attack':'petArmor','support-attack':'leech',
 'defense-magic':'petArmor','support-magic':'refund','support-defense':'haste'
};
function reversePactTransforms(job,key,M,W,F){
 if(!REVERSE_KEYS.has(key))return [M,W,F];
 const jobType=FUSION_JOB_SPECIALTY[job],routeType=REVERSE_ROUTE_SPECIALTY[key];
 const transform=(source,index)=>{
   const copy={...source};
   // Small differentiators, still bounded by downstream skill rules.
   const value=(type)=>type==='targets'?1:type==='refund'?0.06:type==='leech'?0.035:type==='haste'?0.035:type==='execute'?0.08:type==='single'?0.08:type==='autoPower'?0.08:type==='petArmor'?0.06:type==='magic'?0.07:0.07;
   const type=index===1?routeType:jobType;
   if(type==='targets')copy.targets=Math.max(1,Number(copy.targets)||0);
   else copy[type]=Array.isArray(copy[type])?copy[type].map(n=>n+value(type)):Number(copy[type]||0)+value(type);
   return copy;
 };
 return [transform(M,0),transform(W,1),transform(F,2)];
}
const levels=[151,161,171,181,191,200];
export const fusionTransformAtLevel=(t,level=151)=>Object.fromEntries(Object.entries(t).map(([k,v])=>{if(!Array.isArray(v))return[k,v];const l=Math.max(151,Math.min(200,level||151)),i=levels.findLastIndex(x=>x<=l);return[k,i===5?v[5]:v[i]+(v[i+1]-v[i])*(l-levels[i])/(levels[i+1]-levels[i])];}));
const labels={petAttack:'追加夥伴ATK',magic:'追加夥伴MATK',petArmor:'追加夥伴DEF',bonus:'人物技能倍率+',targets:'額外目標',haste:'動作間隔縮短',leech:'傷害轉治療',refund:'退還SP',single:'單一敵人時倍率+',execute:'目標HP低於30%倍率+',manaBurst:'SP達80%時倍率+',bounty:'掠獵金幣係數',autoPower:'自詠倍率+',autoTargets:'自詠額外目標',autoMana:'自詠回SP',castFactor:'詠唱時間倍率'};
const describe=t=>Object.entries(t).map(([k,v])=>`${labels[k]||k}${['targets','refund','autoTargets','autoMana','bounty'].includes(k)?v:Array.isArray(v)?v.map(n=>Math.round(n*100)+'%').join('→')+'（Base151→200逐級成長）':Math.round(v*100)+'%'}`).join('、');
export const THIRD_FUSION_RULES=Object.fromEntries(Object.entries(rows).map(([job,list])=>[job,Object.fromEntries(Object.keys(FUSION_PAIRS).map((key,i)=>{const [name,baseM,baseW,baseF,trigger]=list[contractIndex(key)],[M,W,F]=reversePactTransforms(job,key,baseM,baseW,baseF),main='thirdMain_'+job,wide='thirdWide_'+job,finish='thirdFinish_'+job,events=[main,...(trigger==='utility'?['thirdUtility_'+job]:trigger==='stance'?['thirdStance_'+job]:[])];return[key,{name:key===FUSION_BASE_ORDER[contractIndex(key)]?name:`${name}・${key.split('-')[0]}主契`,mode:'pact',effect:'stance',power:0,cooldown:4000,duration:8000,thirdFusion:true,skillId:main,events,transform:{},perSkill:{[main]:M,[wide]:W,[finish]:F},description:`${THIRD_JOBS[job].name}專屬；${trigger==='utility'?'生存技能或':trigger==='stance'?'姿態技能或':''}【${THIRD_JOBS[job].main}】命中／生效後開啟8秒共鳴。主攻：${describe(M)}；範圍技：${describe(W)}；終結技：${describe(F)}。` }];}))]));
// Reborn second jobs can fuse at 150 before transferring. Their contracts have
// independent triggers and a main-only payload; no third skill is required.
const rebirthNames={knight:'龍騎',crusader:'聖殿',wizard:'咒術',sage:'智者',assassin:'刺魂',rogue:'魅影',priest:'聖者',monk:'宗師',hunter:'神射',performer:'樂聖'};
const pairNames=['雙極','鐵誓','獵歌','玄星','靈泉','聖域'];
const rebirthPayloads=REBIRTH_FUSION_DATA;
export const REBIRTH_FUSION_RULES=Object.fromEntries(Object.entries(rebirthPayloads).map(([job,list])=>[job,Object.fromEntries(Object.keys(FUSION_PAIRS).map((key,i)=>{const id='rebirthMain_'+job;return[key,{name:rebirthNames[job]+'・'+pairNames[contractIndex(key)],mode:'pact',effect:'stance',power:0,cooldown:4000,duration:8000,fusionContract:true,skillId:id,events:[id],transform:{},perSkill:{[id]:list[contractIndex(key)]},description:`進階二轉【${rebirthNames[job]}】轉生主攻命中後開啟8秒融合共鳴：${describe(list[contractIndex(key)])}。不需要三轉。`}];}))]));
export function companionResonance(player,pet){const fused=!!fusedPair(pet),key=fused?fusionKey(pet.fusion.main,pet.fusion.sub):({attack:'attack-support',magic:'attack-magic',defense:'defense-support',support:'magic-support'})[companionRole(pet)];if(player.thirdJob||fused){if(player.thirdJob){const r=THIRD_FUSION_RULES[player.job]?.[key];if(!r)return null;const perSkill=Object.fromEntries(Object.entries(r.perSkill).map(([id,t])=>[id,fusionTransformAtLevel(t,player.level)]));return {...r,name:fused?r.name:THIRD_JOBS[player.job].name+'・'+({attack:'追獵戰契',magic:'元素戰契',defense:'守城戰契',support:'靈泉戰契'})[companionRole(pet)],thirdFusion:fused,thirdContract:true,perSkill,description:`${THIRD_JOBS[player.job].name}專屬；【${r.events.map(id=>jobSkillById(player.job,id)?.name||id).join('／')}】命中或生效後開啟8秒共鳴。主攻：${describe(perSkill['thirdMain_'+player.job])}；範圍技：${describe(perSkill['thirdWide_'+player.job])}；終結技：${describe(perSkill['thirdFinish_'+player.job])}。倍率隨Base逐級成長。`};}if(player.reborn){const r=REBIRTH_FUSION_RULES[player.job]?.[key];if(!r)return null;const old=REBIRTH_MAIN_REPLACES[player.job],main='rebirthMain_'+player.job;return {...r,events:[main,old],perSkill:{...r.perSkill,[old]:r.perSkill[main]},description:r.description+` 尚未習得轉生主攻時，也可由【${jobSkillById(player.job,old)?.name||old}】觸發。`};}}return resonanceRule(player.job,companionRole(pet));}
