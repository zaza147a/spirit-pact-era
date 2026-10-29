// Saved per character. Priority is player-authored; no damage optimizer reorders it.
export function normalizeAutoSkills(value,skills){
 const active=skills.filter(s=>s.kind!=='passive'),ids=new Set(active.map(s=>s.id));
 const defaults=[...active].sort((a,b)=>Number(b.kind==='heal')-Number(a.kind==='heal')||Number(b.kind==='buff')-Number(a.kind==='buff')||Number(b.branch==='second')-Number(a.branch==='second')||Number(a.attackCycle||false)-Number(b.attackCycle||false)).map(s=>s.id);
 const saved=Array.isArray(value?.order)?value.order:[];
 const order=[...new Set([...saved.filter(id=>ids.has(id)),...defaults])];
 return {order,disabled:[...new Set((Array.isArray(value?.disabled)?value.disabled:[]).filter(id=>ids.has(id)))]};
}
export function orderedAutoSkills(value,skills){const settings=normalizeAutoSkills(value,skills),byId=new Map(skills.map(s=>[s.id,s])),disabled=new Set(settings.disabled);return settings.order.filter(id=>!disabled.has(id)).map(id=>byId.get(id));}
export function moveAutoSkill(value,skills,id,direction){const settings=normalizeAutoSkills(value,skills),learned=skills.filter(s=>s.kind!=='passive'&&s.learned!==false).map(s=>s.id),visible=settings.order.filter(id=>learned.includes(id)),index=visible.indexOf(id),next=index+direction;if(index<0||next<0||next>=visible.length||![-1,1].includes(direction))return settings;const a=settings.order.indexOf(id),b=settings.order.indexOf(visible[next]);[settings.order[a],settings.order[b]]=[settings.order[b],settings.order[a]];return settings;}
export const CAPTURE_ROLES=['attack','magic','defense','support'];
export const normalizeCaptureRoles=value=>[...new Set((Array.isArray(value)?value:[]).filter(role=>CAPTURE_ROLES.includes(role)))];
