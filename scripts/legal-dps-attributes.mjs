export const STAT_KEYS=Object.freeze(['STR','AGI','VIT','INT','DEX','LUK']);
export function mainAttribute(job){
 if(['wizard','sage','priest','spiritCommander'].includes(job))return 'INT';
 if(['hunter','performer'].includes(job))return 'DEX';
 return 'STR';
}

export function allocateForAspd(job,agility){
 const main=mainAttribute(job),attrs=Object.fromEntries(STAT_KEYS.map(key=>[key,1]));
 attrs[main]=150;
 attrs.AGI=Math.max(1,Math.min(150,Math.round(agility)));
 let left=438-149-(attrs.AGI-1);
 for(const key of ['LUK','VIT','DEX','INT','STR','AGI']){
  const possible=150-attrs[key],used=Math.min(left,possible);
  attrs[key]+=used;left-=used;
  if(!left)break;
 }
 if(left!==0)throw Error('Unallocated stat points '+left);
 return attrs;
}
