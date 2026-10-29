export const SECOND_JOBS={
 knight:{parent:'swordsman',name:'騎士',range:'melee',weapon:'twoSpear',attribute:'STR',style:'衝鋒與近距離物理爆發'},
 crusader:{parent:'swordsman',name:'十字軍',range:'melee',weapon:'blade',attribute:'VIT',style:'盾擊、守護、反擊的前線坦職'},
 wizard:{parent:'mage',name:'巫師',range:'ranged',weapon:'twoStaff',attribute:'INT',style:'INT／DEX縮短詠唱，元素法術同時轟炸多個目標'},
 sage:{parent:'mage',name:'賢者',range:'melee',weapon:'spellFist',attribute:'INT',style:'INT提升MATK，AGI／ASPD驅動魔力拳與範圍自動念咒'},
 assassin:{parent:'thief',name:'刺客',range:'melee',weapon:'katar',attribute:'STR',style:'雙刀或拳刃的高爆發與毒刃'},
 rogue:{parent:'thief',name:'流氓',range:'melee',weapon:'rifle',attribute:'STR',style:'短劍突襲與偷取物品、提高裝備收益'},
 priest:{parent:'acolyte',name:'祭師',range:'ranged',weapon:'mace',attribute:'INT',style:'治療、聖光與輔助祝福'},
 monk:{parent:'acolyte',name:'武僧',range:'melee',weapon:'knuckles',attribute:'STR',style:'STR提升拳傷，AGI驅動連環拳，氣功與阿修羅爆發'},
 hunter:{parent:'archer',name:'獵人',range:'ranged',weapon:'longBow',attribute:'DEX',style:'弓箭與獵鷹協同追擊'},
 performer:{parent:'archer',name:'詩人／舞孃',range:'ranged',weapon:'instrument',attribute:'DEX',style:'樂曲增益、音波攻擊與夥伴協奏'}
};
export const parentJob=job=>SECOND_JOBS[job]?.parent||job;
export const secondJobChoices=job=>Object.entries(SECOND_JOBS).filter(([,s])=>s.parent===job);
export const SECOND_JOB_REQUIREMENTS={base:50,job:40};
export function transferEligibility(player,target){const choice=SECOND_JOBS[target];if(!choice||player.job!==choice.parent)return '職業分支不符';if(player.location!=='town')return '請回城鎮辦理二轉';if(player.level<50||player.jobLevel<40)return '需要 Base Lv.50、Job Lv.40';return null;}
