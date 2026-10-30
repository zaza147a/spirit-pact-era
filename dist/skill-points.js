// Rank 1 of the starting skill is the Job 1 grant. Each later Job level adds one.
// Rebuild unspent balances from earned ranks, so lost awards can be recovered safely.
export function reconcileSkillPoints(player, skills, secondJob=false){
 const level=Math.max(1,Math.floor(Number(player.jobLevel)||1));
 const pools={jobPoints:{earned:0,spent:0},firstJobPoints:{earned:0,spent:0},rebornJobPoints:{earned:0,spent:0},thirdJobPoints:{earned:0,spent:0}};
 const capacity={first:0,second:0,rebirth:0};
 for(const skill of skills){
  const branch=skill.thirdOnly?'third':skill.rebornOnly?'rebirth':skill.branch;
  capacity[branch]=(capacity[branch]||0)+skill.maxRank;
  const pool=skill.thirdOnly?'thirdJobPoints':skill.rebornOnly?'rebornJobPoints':secondJob&&branch==='first'?'firstJobPoints':'jobPoints';
  pools[pool].spent+=Math.max(0,Math.min(skill.maxRank,Math.floor(Number(player.jobSkills?.[skill.id])||0)));
 }
 // Second-job certification completes the first-job point budget, even after Job 40 transfer.
 pools.firstJobPoints.earned=secondJob?capacity.first:0;
 pools.jobPoints.earned=Math.min(player.thirdJob?50:level,secondJob?capacity.second:capacity.first,50);
 pools.rebornJobPoints.earned=player.reborn&&secondJob?Math.min(Math.max(0,(player.thirdJob?70:level)-50),capacity.rebirth):0;
 pools.thirdJobPoints.earned=player.thirdJob?Math.min(level,capacity.third||0,70):0;
 for(const [pool,{earned,spent}] of Object.entries(pools))player[pool]=Math.max(0,earned-spent);
 return player;
}

// Refresh balances and upgrade availability even while a skill selector is open.
// Keep the existing controls, focus and native dropdown state intact.
export function updateSkillPointControls(root,player,skills,secondJob,isUnlocked){
 for(const label of root.querySelectorAll('[data-skill-points]')){
  const value=String(player[label.dataset.skillPoints]||0);
  if(label.textContent!==value)label.textContent=value;
 }
 for(const button of root.querySelectorAll('[data-jobup]')){
  const skill=skills.find(s=>s.id===button.dataset.jobup);
  if(!skill)continue;
  const pool=skill.thirdOnly?'thirdJobPoints':skill.rebornOnly?'rebornJobPoints':secondJob&&skill.branch==='first'?'firstJobPoints':'jobPoints';
  button.disabled=!(isUnlocked(player,skill)&&(player[pool]||0)>0&&(player.jobSkills[skill.id]||0)<skill.maxRank);
 }
}
