// Only explicitly selected skills belong to the queue. Learning never appends skills.
export const autoSkillGroup=skill=>skill?.kind==='shield'?'personalShield':skill?.exclusiveGroup||null;
export function normalizeAutoSkills(value,skills){
 const active=skills.filter(s=>s.kind!=='passive'&&s.learned!==false),byId=new Map(active.map(s=>[s.id,s]));
 const defaults=[...active].sort((a,b)=>Number(b.kind==='heal')-Number(a.kind==='heal')||Number(b.kind==='buff')-Number(a.kind==='buff')||Number(b.branch==='second')-Number(a.branch==='second')||Number(a.attackCycle||false)-Number(b.attackCycle||false)).map(s=>s.id);
 const disabled=new Set(Array.isArray(value?.disabled)?value.disabled:[]),saved=Array.isArray(value?.order)?value.order:defaults,seen=new Set(),groups=new Set(),order=[];
 for(const id of saved){const skill=byId.get(id),group=autoSkillGroup(skill);if(!skill||seen.has(id)||disabled.has(id)||group&&groups.has(group))continue;seen.add(id);if(group)groups.add(group);order.push(id);}
 return {version:2,order,disabled:[]};
}
export function orderedAutoSkills(value,skills){const settings=normalizeAutoSkills(value,skills),byId=new Map(skills.map(s=>[s.id,s]));return settings.order.map(id=>byId.get(id));}
export function moveAutoSkill(value,skills,id,direction){const settings=normalizeAutoSkills(value,skills),index=settings.order.indexOf(id),next=index+direction;if(index<0||next<0||next>=settings.order.length||![-1,1].includes(direction))return settings;[settings.order[index],settings.order[next]]=[settings.order[next],settings.order[index]];return settings;}
export const CAPTURE_ROLES=['attack','magic','defense','support'];
export const normalizeCaptureRoles=value=>[...new Set((Array.isArray(value)?value:[]).filter(role=>CAPTURE_ROLES.includes(role)))];
