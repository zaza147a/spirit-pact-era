const defs={
 knight:['盧恩騎士','龍紋破陣','震岳龍槍','絕界貫星槍','盧恩甲陣','龍魂進軍',2.15,3,'charge', [['龍槍真解',{atkPct:2}],['盧恩鐵骨',{hpPct:3}],['進軍韻律',{aspdPct:2}],['戰場洞察',{hitPct:2}]]],
 crusader:['皇家禁衛','聖王盾裁','聖域裁決','王權終審','聖誓回天','王城誓約',.67,3,'skill',[['聖盾真諦',{defPct:3}],['王城之軀',{hpPct:3}],['裁決意志',{atkPct:2}],['禁衛步法',{aspd:1}]]],
 wizard:['星界咒術師','星隕終焉','天界流星雨','虛空崩解','星流凝聚','秘法極境',3.3,5,'skill',[['星界奧義',{matkPct:2.5}],['詠唱精研',{castReduction:.02}],['魔力深淵',{mpPct:3}],['星流回溯',{spRegen:1}]]],
 sage:['元素使','四象魔拳','元素迴環','元初爆轟','元素自詠','靈脈循環',1.8,3,'fist',[['四象真理',{matkPct:2}],['靈拳節奏',{aspd:1}],['念咒共振',{autoSpellChance:.03}],['元素衣缽',{mdefPct:3}]]],
 assassin:['十字斬首者','幻滅雙刃','死亡旋舞','終式斬魂','幻影帷幕','處刑時刻',.88,3,'skill',[['殺戮真髓',{atkPct:2}],['致命洞察',{crit:1.2}],['斬魂研習',{critDmg:3}],['幻步真傳',{fleePct:2}]]],
 rogue:['逐影者','逐影掠刃','暗街伏殺','奪命斷影','夜行煙幕','暗巷領域',.80,3,'snatch',[['逐影刀藝',{atkPct:2}],['暗街手腕',{lootPct:3}],['黑市通途',{goldPct:2}],['疾行秘法',{aspd:.8}]]],
 priest:['聖域大主教','天啟聖裁','聖光審判','神諭定罪','聖域復甦','神恩協奏',1.9,3,'skill',[['聖典真解',{matkPct:2}],['救贖恩典',{healingPct:5}],['聖靈容器',{mpPct:3}],['光輝同契',{teamDamagePct:1}]]],
 monk:['修羅','龍虎震天','修羅震地','極意破空拳','龍息調元','無我鬥魂',1.65,3,'combo',[['修羅真意',{atkPct:2.3}],['連環精髓',{aspd:.7}],['苦行金身',{hpPct:3}],['破空慧眼',{crit:1.2}]]],
 hunter:['遊俠','蒼鷹穿界','風暴獵場','星墜狙擊','荒野護幕','獵神專注',1.05,3,'falcon',[['荒野真傳',{atkPct:2}],['獵神鷹眼',{hitPct:2}],['疾風弦律',{aspd:.7}],['弱點洞悉',{critDmg:2}]]],
 performer:['天籟詠者','天籟星弦','銀河交響','終幕絕奏','靈泉序曲','天籟合奏',.62,3,'song',[['天籟真音',{atkPct:2}],['靈魂共奏',{teamDamagePct:1.5}],['無盡樂泉',{spRegen:1}],['星弦節奏',{aspd:.7}]]]
};
export const THIRD_JOBS=Object.fromEntries(Object.entries(defs).map(([job,d])=>[job,{name:d[0],main:d[1],style:`${d[0]}以${d[1]}為主攻，${d[2]}應對多體、${d[3]}集中爆發，兼具四項常駐修練。`} ]));
const labels={atkPct:'ATK%',hpPct:'HP%',aspdPct:'攻速%',hitPct:'命中%',defPct:'DEF%',matkPct:'MATK%',castReduction:'詠唱縮短',mpPct:'SP%',spRegen:'每4秒回SP',aspd:'ASPD',autoSpellChance:'自詠機率',mdefPct:'MDEF%',crit:'暴擊率%',critDmg:'暴擊傷害%',fleePct:'FLEE%',lootPct:'裝備掉率%',goldPct:'金幣收益%',healingPct:'治療%',teamDamagePct:'主人與寵物傷害%'};
const buffModifiers={knight:{atkPct:20,hitPct:15},crusader:{defPct:25,aspd:10},wizard:{matkPct:20,castReduction:.1},assassin:{critDmg:25,aspdPct:12},rogue:{atkPct:20,lootPct:15},monk:{atkPct:20,aspdPct:10}};
export function thirdSkills(job){const [name,main,wide,finish,utility,stance,power,targets,event,passives]=defs[job],magic=['wizard','sage','priest'].includes(job),wizard=job==='wizard',base={branch:'third',thirdOnly:true,maxRank:10,weapons:[],kind:magic?'magic':'physical',mp:3,event,desc:'三轉專屬；主攻依ASPD動作間隔，承接本職共鳴。'},make=(id,title,extra)=>({...base,id:id+'_'+job,name:title,...extra});
 const list=[make('thirdMain',main,{unlock:1,power,attackCycle:true,cooldown:0,aoe:true,targets,mp:wizard?18:3,...(wizard?{castMs:2200,recovery:900}:{}),...(job==='crusader'?{source:'holyShield'}:{}),...(job==='rogue'?{steal:true}:{})}),make('thirdWide',wide,{unlock:5,power:power*(wizard?1.35:6.5),mp:18,cooldown:8000,aoe:true,targets:wizard?5:4,...(wizard?{castMs:2600,recovery:1200}:{}),desc:'三轉範圍攻擊；同時打擊多體，每體獨立計傷，需承受技能動作間隔。'}),make('thirdFinish',finish,{unlock:40,power:power*(wizard?2.8:12),mp:24,cooldown:12000,targets:1,...(wizard?{castMs:3000,recovery:1200}:{}),desc:'三轉單體終結技；高倍率、高消耗，適合首領與厚血目標。'})];
 for(const [i,ratio]of [[0,1],[1,wizard?1.35:6.5],[2,wizard?2.8:12]]){list[i].thirdGrowth={job,ratio};list[i].desc+=' 技能倍率隨Base151–200逐級成長；下方顯示目前實際倍率。';}
 let util={kind:'shield',power:2.5,cooldown:2800,exclusiveGroup:'personalShield',mp:16};
 if(['crusader','priest','monk'].includes(job))util={kind:'heal',power:job==='monk'?3:4,cooldown:7500,mp:18,healSource:job==='priest'?'matk':'atk',partyHeal:job!=='monk'};
 if(['wizard','performer'].includes(job))util={kind:'mana',power:.15,cooldown:8000,mp:8};
 if(job==='sage')util={kind:'buff',buff:'autoSpell',power:.55,duration:16000,cooldown:16000,rankScaled:true,mp:14};
 list.push(make('thirdUtility',utility,{unlock:10,...util,desc:'三轉生存與循環技能；效果隨技能等級與自身能力成長。'}));
 const stanceData=job==='sage'?{kind:'mana',power:.15,mp:8,cooldown:8000}:buffModifiers[job]?{kind:'buff',buff:'thirdStance',power:0,modifiers:buffModifiers[job],duration:12000,cooldown:16000,rankScaled:true,mp:16}:{kind:'buff',buff:job==='priest'?'angelus':job==='hunter'?'hunterFocus':'battleSong',power:job==='priest'?.20:job==='hunter'?.18:.22,duration:16000,cooldown:16000,rankScaled:true,mp:16};
 list.push(make('thirdStance',stance,{unlock:20,...stanceData,desc:'三轉戰鬥姿態；增益數值按技能等級／10成長，滿級達完整強度。'}));
 passives.forEach(([title,bonuses],i)=>list.push(make('thirdPassive'+i,title,{unlock:[1,5,15,30][i],kind:'passive',power:0,mp:0,maxRank:5,bonuses,desc:'常駐；每級 '+Object.entries(bonuses).map(([k,v])=>`${labels[k]||k} +${k==='castReduction'||k==='autoSpellChance'?v*100+'%':v}`).join('、')})));
 return list;
}
export const scaledSkillBuff=(s,rank)=>{const factor=s.rankScaled?Math.max(1,rank)/10:1;return{power:s.power*factor,modifiers:s.modifiers?Object.fromEntries(Object.entries(s.modifiers).map(([k,v])=>[k,v*factor])):undefined};};

// Explicit Base-level skill-ratio growth; displayed and executed by the same formula.
export const THIRD_MAIN_LEVELS=[151,161,171,181,191,200];
export const THIRD_MAIN_CURVES={knight:[2.15,2.37,2.37,2.37,2.37,2.37],crusader:[.67,1.20,1.58,1.63,1.73,1.73],wizard:[3.3,4.4,5.94,6.16,7.1,7.1],sage:[1.8,1.9,1.9,1.9,1.9,1.9],assassin:[.88,1.10,1.67,1.78,1.86,1.86],rogue:[.80,1.40,2.10,2.21,2.30,2.30],priest:[1.9,2.14,2.14,2.14,2.14,2.14],monk:[1.65,2.00,2.00,2.00,2.00,2.00],hunter:[1.05,1.05,1.51,1.57,1.67,1.67],performer:[.62,.68,1.04,1.10,1.18,1.18]};
export function skillPowerAtLevel(skill,level=151){if(!skill.thirdGrowth)return skill.power;const curve=THIRD_MAIN_CURVES[skill.thirdGrowth.job],value=Math.max(151,Math.min(200,level));let i=THIRD_MAIN_LEVELS.findLastIndex(x=>x<=value);const base=i===5?curve[5]:curve[i]+(curve[i+1]-curve[i])*(value-THIRD_MAIN_LEVELS[i])/(THIRD_MAIN_LEVELS[i+1]-THIRD_MAIN_LEVELS[i]);return base*skill.thirdGrowth.ratio;}
