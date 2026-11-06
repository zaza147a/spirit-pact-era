export function petAttackIdentity(role){
 if(role==='magic')return {type:'magic',label:'魔法主攻',primary:'MATK',secondary:'ATK'};
 if(role==='support')return {type:'magic',label:'輔助／魔法',primary:'MATK',secondary:'ATK'};
 if(role==='defense')return {type:'physical',label:'防禦／物理',primary:'ATK',secondary:'MATK'};
 return {type:'physical',label:'物理主攻',primary:'ATK',secondary:'MATK'};
}

// Compact HUD wording: combat numbers remain in the detailed attributes panel.
export function compactAttackLabel(identity,range){
 const type=identity?.type==='magic'?'魔法':identity?.type==='hybrid'?'物魔':'物理';
 return `${type}・${range==='ranged'?'遠距':'近距'}`;
}

export function ownerAttackIdentity(job,thirdJob,atk,matk,profileKind=null){
 if(!thirdJob&&['spiritist','pactWarrior'].includes(job))return (matk>atk)
  ?{type:'magic',label:'魔法主攻',primary:'MATK',secondary:'ATK'}
  :{type:'physical',label:'物理主攻',primary:'ATK',secondary:'MATK'};
 if(job==='pactWarrior'&&thirdJob){
  if(profileKind==='hybrid')return matk>atk?petAttackIdentity('magic'):petAttackIdentity('attack');
  return petAttackIdentity(profileKind==='magic'?'magic':'attack');
 }
 if(job==='crusader')return {type:'hybrid',label:'物理／魔法技能',primary:'ATK／DEF',secondary:'MATK'};
 return ['mage','wizard','sage','acolyte','priest','spiritCommander'].includes(job)
  ?petAttackIdentity('magic'):petAttackIdentity('attack');
}

export function fusionEquipmentHint(role,hasFusion){
 if(!hasFusion)return '';
 if(['magic','support'].includes(role))return '魔法型優先裝備 MATK／INT；舊裝備的固定ATK與STR詞條可暫以80%折算為MATK，不包含夥伴原生ATK，也不是永久最佳配裝。';
 if(role==='attack')return '物理型優先裝備 ATK／STR；舊裝備的固定MATK與INT詞條可暫以80%折算為ATK，不包含夥伴原生MATK。';
 return '此融合以防禦與物理系能力為主，請按實際技能與生存需求配置裝備。';
}
