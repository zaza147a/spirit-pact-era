import {SECOND_JOBS,parentJob} from './jobs.js?v=4.0';
const make=(id,name,kind,unlock,mp,power,desc,weapons=[],extra={})=>({id,name,kind,unlock,mp,power,desc,weapons,maxRank:10,branch:'first',...extra});
const passive=(id,name,unlock,bonuses,desc,branch='first')=>make(id,name,'passive',unlock,0,0,desc,[],{bonuses,branch,maxRank:5});
export const JOB_SKILLS={
 swordsman:[make('bash','重擊','physical',1,18,1.8,'單體近戰重擊'),make('magnum','怒爆','physical',5,23,1.9,'近身爆發，波及其他目標',[],{aoe:.3}),make('provoke','挑釁護身','shield',10,17,1.2,'以戰吼凝聚防護'),make('recover','戰地恢復','heal',20,20,1.25,'恢復自身HP'),passive('swordTraining','劍術修練',3,{atkPct:2},'每級 ATK +2%'),passive('ironBody','體魄鍛鍊',12,{hpPct:3},'每級 HP +3%')],
 acolyte:[make('holy','聖光攻擊','magic',1,18,1.8,'單體聖光魔法'),make('heal','治癒術','heal',2,20,1.85,'以MATK治療自己'),make('bless','天使防護','shield',10,19,1.35,'生成防護護盾'),make('holyPrayer','靜心祈禱','mana',20,12,1.4,'以MATK恢復SP'),passive('faith','信仰修練',3,{matkPct:2},'每級 MATK +2%'),passive('mercy','慈悲之心',12,{healingPct:3},'每級 自身治療 +3%')],
 mage:[make('fire','火箭術','magic',1,18,1.8,'單體火元素魔法'),make('ice','冰箭術','magic',2,22,2.15,'單體寒冰魔法'),make('barrier','魔力屏障','shield',10,20,1.25,'製造魔力護盾'),make('focus','精神集中','mana',20,12,1.9,'恢復自身SP'),passive('arcaneStudy','魔法研究',3,{matkPct:2},'每級 MATK +2%'),passive('manaStudy','禪心',12,{mpPct:3,spRegen:1},'每級 SP +3%，每4秒額外回復1SP')],
 thief:[make('double','二連擊','physical',1,18,1.8,'使用短劍迅速連擊',['dagger']),make('poison','毒刃突襲','physical',5,22,2.25,'短劍突襲',['dagger']),make('shadow','隱匿護身','shield',10,16,1.1,'暫時保護自身'),make('backstab','背刺','physical',20,29,3.1,'短劍弱點打擊',['dagger']),passive('daggerTraining','短劍修練',3,{atkPct:2},'每級 ATK +2%'),passive('evasion','殘影修練',12,{fleePct:3},'每級 FLEE +3%')],
 archer:[make('aimShot','精準射擊','physical',1,16,1.6,'單體遠程射擊'),make('doubleArrow','二連矢','physical',5,22,2.25,'連續射出兩支箭'),make('eagleEye','鷹眼護持','shield',10,17,1.1,'集中精神並獲得護盾'),make('piercingArrow','穿雲箭','physical',20,29,2.5,'遠距離貫穿攻擊'),passive('bowTraining','箭術修練',3,{atkPct:2},'每級 ATK +2%'),passive('owlEye','鴞梟之眼',12,{hit:4,crit:1},'每級 HIT +4、CRIT +1%')]
};
const S=(...args)=>{const skill=make(...args);skill.branch='second';return skill;};
const P=(...args)=>passive(...args,'second');
const SECOND_SKILLS={
 knight:[S('charge','騎乘衝鋒','physical',1,24,2.6,'衝鋒命中並觸發騎士共鳴',['spear','greatspear','sword','greatsword'],{cooldown:5000,event:'charge',aoe:.2}),S('brandish','連環槍陣','physical',5,28,2.7,'槍陣掃擊',[],{cooldown:6500,aoe:.35}),S('knightGuard','鐵壁戰意','shield',12,20,1.8,'維持前線護盾'),S('pierce','螺旋穿刺','physical',20,34,3.4,'強力物理突進',[],{cooldown:8000}),P('cavalry','騎術精通',3,{atkPct:2,aspd:.3},'每級 ATK +2%、ASPD +0.3'),P('battleVigor','戰場意志',10,{hpPct:3},'每級 HP +3%')],
 crusader:[S('shieldBash','盾擊','physical',1,24,3.8,'以防禦能力加入攻擊傷害',[],{source:'shield',cooldown:5000}),S('holyCross','聖十字制裁','magic',5,28,2.6,'ATK與DEF凝聚聖光',[],{source:'shield',cooldown:6500,aoe:.2}),S('devotion','犧牲守護','buff',12,24,.12,'8秒內角色受傷降低12%，並提升夥伴傷害12%',[],{buff:'devotion',duration:8000,cooldown:14000}),S('crusaderWall','神聖壁壘','shield',20,30,2.6,'生成強力護盾'),P('fortress','神盾精通',3,{defPct:4,hpPct:2},'每級 DEF +4%、HP +2%'),P('retribution','反擊誓言',10,{reflect:.02},'格擋時每級反擊ATK20%，並降低受傷2%')],
 wizard:[S('thunder','雷鳴風暴','magic',1,26,2.2,'大範圍雷擊',[],{cooldown:6000,aoe:.55}),S('meteor','隕星術','magic',5,32,2.8,'多目標隕星轟炸',['staff','greatstaff'],{cooldown:8000,aoe:.6}),S('arcaneStorm','暴風雪','magic',12,36,3,'大範圍冰雪魔法',[],{cooldown:10000,aoe:.65}),S('wizardBarrier','元素結界','shield',20,24,1.8,'護盾與元素防護'),P('elementMastery','元素精通',3,{matkPct:2.5},'每級 MATK +2.5%'),P('spellFlow','魔力洪流',10,{mpPct:4,spRegen:1},'每級 SP +4%，每4秒回復1SP')],
 sage:[S('spellFist','魔力拳','magic',1,22,2.3,'近身以MATK打出魔力拳',['spellfist','staff','greatstaff'],{cooldown:5000,event:'fist'}),S('autoSpell','自動念咒','buff',5,22,.45,'8秒普攻有45%機率追加MATK60%魔法',[],{buff:'autoSpell',duration:8000,cooldown:12000}),S('elementStrike','元素連拳','magic',12,30,2.8,'元素拳波',[],{cooldown:7000,aoe:.25}),S('sageChannel','魔力循環','mana',20,12,2.2,'回復SP以維持近戰施法'),P('fistMastery','魔拳精研',3,{matkPct:2,aspd:.4},'每級 MATK +2%、ASPD +0.4'),P('spellArmor','賢者魔甲',10,{mdefPct:4,hpPct:2},'每級 MDEF +4%、HP +2%')],
 assassin:[S('dualStrike','雙刃亂舞','physical',1,24,2.5,'雙短劍／拳刃高速爆發',['dual','katar'],{cooldown:5000}),S('katarSlash','拳刃旋斬','physical',5,28,2.6,'拳刃範圍旋斬',['katar'],{cooldown:7000,aoe:.3}),S('sonicBlow','音速投擲','physical',12,32,3.4,'連續弱點爆發',['dual','katar'],{cooldown:8000}),S('venomBurst','劇毒爆破','physical',20,30,3,'毒刃爆發',[],{cooldown:7000}),P('lethalMastery','致命修練',3,{crit:1.5,critDmg:2},'每級 CRIT +1.5%、暴擊傷害 +2%'),P('dualMastery','雙刃精通',10,{atkPct:2,aspd:.3},'每級 ATK +2%、ASPD +0.3')],
 rogue:[S('snatch','掠奪突襲','physical',1,24,2.3,'短劍打擊，嘗試偷取額外物品',['dagger'],{cooldown:6000,steal:true}),S('daggerDance','短劍遊擊','physical',5,24,2.6,'短劍移位追擊',['dagger'],{cooldown:5500}),S('gangAmbush','脅持伏擊','physical',12,30,2.9,'短劍伏擊並波及鄰近目標',['dagger'],{cooldown:7000,aoe:.2}),S('smokeVeil','煙幕護身','shield',20,20,1.8,'短暫防護掠奪行動'),P('pilfer','順手牽羊',3,{lootPct:4,goldPct:3},'每級裝備掉率+4%相對值、金幣+3%'),P('streetBlades','街頭刀術',10,{atkPct:2,fleePct:2},'每級 ATK +2%、FLEE +2%')],
 priest:[S('holyJudgment','神聖審判','magic',1,24,4.2,'聖光打擊',[],{cooldown:5500}),S('sanctuary','聖域治療','heal',5,28,2.7,'以MATK恢復主人生命，並治療夥伴'),S('angelus','天使頌歌','buff',12,24,.14,'10秒主人與寵物傷害+14%',[],{buff:'angelus',duration:10000,cooldown:15000}),S('exorcism','十字驅魔','magic',20,32,2.7,'聖域範圍驅魔',[],{cooldown:8000,aoe:.4}),P('divineGrace','神恩',3,{healingPct:4,matkPct:1.5},'每級 治療+4%、MATK +1.5%'),P('meditation','冥想',10,{mpPct:4,spRegen:1},'每級 SP +4%，每4秒回復1SP')],
 monk:[S('chainCombo','六合連環拳','physical',1,22,2.8,'拳套連段',['knuckle'],{cooldown:5000,event:'combo'}),S('spiritPalm','氣功波','physical',5,26,2.7,'氣功衝擊',['knuckle'],{cooldown:6500,aoe:.2}),S('asura','阿修羅霸拳','physical',12,40,4,'高消耗單體爆發',['knuckle'],{cooldown:11000,event:'combo'}),S('breathing','調息','heal',20,20,1.8,'以ATK恢復生命'),P('ironFist','鐵拳修練',3,{atkPct:2,crit:1},'每級 ATK +2%、CRIT +1%'),P('ascetic','苦修之軀',10,{hpPct:3,defPct:2},'每級 HP +3%、DEF +2%')],
 hunter:[S('falconStrike','獵鷹突襲','physical',1,24,2.0,'獵鷹精準攻擊',[],{cooldown:5500,event:'falcon'}),S('arrowRain','箭雨','physical',5,28,2.5,'範圍箭雨',[],{cooldown:7000,aoe:.4}),S('beastMark','獵獸標記','physical',12,30,2.5,'標記並與獵鷹追擊',[],{cooldown:7500,event:'falcon'}),S('hunterFocus','獵手專注','buff',20,22,.12,'8秒主人與夥伴傷害+12%',[],{buff:'hunterFocus',duration:8000,cooldown:13000}),P('falconry','馴鷹術',3,{falcon:.06},'普攻觸發獵鷹追加ATK35%，每級機率+6%'),P('ranger','荒野箭術',10,{atkPct:2,hit:3},'每級 ATK +2%、HIT +3')],
 performer:[S('sonicNote','旋律音刃','physical',1,22,2.3,'以DEX與樂器發出音波',['instrument','bow'],{cooldown:5500}),S('battleSong','戰鬥樂章','buff',5,22,.15,'10秒主人與寵物傷害+15%',['instrument','bow'],{buff:'battleSong',duration:10000,cooldown:15000,event:'song'}),S('dissonance','不協和音','physical',12,28,2.5,'範圍音波攻擊',[],{cooldown:7000,aoe:.35}),S('encore','安可終曲','physical',20,30,3,'終曲爆發',[],{cooldown:8000,event:'song'}),P('rhythm','節奏掌握',3,{atkPct:2,aspd:.3},'每級 ATK +2%、ASPD +0.3'),P('inspiration','靈感共奏',10,{mpPct:3,spRegen:1},'每級 SP +3%，每4秒回復1SP')]
};
for(const skill of JOB_SKILLS.archer)if(skill.kind==='physical')skill.weapons=['bow','crossbow'];
// AOE deals its lower per-target ratio independently, never splitting a damage pool.
for(const skills of Object.values(JOB_SKILLS))for(const skill of skills)if(skill.aoe){skill.power*=.58;skill.targets=3;}
for(const [job,skills] of Object.entries(SECOND_SKILLS))for(const skill of skills)if(skill.aoe){skill.power*=job==='wizard'?.62:.6;skill.targets=job==='wizard'?(skill.id==='arcaneStorm'?5:4):3;}
// A rapid skill replaces one normal-attack cycle; it never adds a free second attack.
const rapid={bash:[.78,3],double:[.8,3],aimShot:[.75,3],pierce:[.72,3],dualStrike:[.32,3],daggerDance:[.42,2],chainCombo:[.95,3],falconStrike:[.46,3],sonicNote:[.36,3],spellFist:[.5,2]};
for(const skill of [...Object.values(JOB_SKILLS).flat(),...Object.values(SECOND_SKILLS).flat()])if(rapid[skill.id]){[skill.power,skill.mp]=rapid[skill.id];skill.attackCycle=true;skill.desc+=' · 無獨立CD，與普攻共用動作間隔，由ASPD限制';}
for(const [id,power,castMs] of [['thunder',1.344,1800],['meteor',1.66,2400],['arcaneStorm',1.98,3000]]){const s=SECOND_SKILLS.wizard.find(s=>s.id===id);Object.assign(s,{power,castMs});}
Object.assign(SECOND_SKILLS.sage.find(s=>s.id==='autoSpell'),{duration:12000,cooldown:12000,mp:12,desc:'12秒普攻／魔力拳有45%機率追加MATK60%魔法，最多3目標；頻率依ASPD'});
Object.assign(SECOND_SKILLS.sage.find(s=>s.id==='spellFist'),{aoe:true,targets:3,desc:'MATK魔力拳無獨立CD，最多3目標，與普攻共用ASPD動作間隔'});
SECOND_SKILLS.crusader.find(s=>s.id==='holyCross').power=2.4;SECOND_SKILLS.priest.find(s=>s.id==='exorcism').power=2.7;
SECOND_SKILLS.rogue.find(s=>s.id==='gangAmbush').power=2.6;SECOND_SKILLS.rogue.find(s=>s.id==='snatch').event='snatch';
const REBORN_SKILLS={
 knight:['蒼穹戰意',{atkPct:20,aspdPct:8},'天槍破陣','physical',3.8,'charge'],
 crusader:['聖誓堅城',{defPct:25,damageReduction:8},'裁決盾陣','physical',10.0,'skill'],
 wizard:['元素超載',{matkPct:25,castReduction:.25},'天穹隕滅','magic',6.0,'skill'],
 sage:['賢者極意',{aspdPct:15,autoSpellChance:.15},'奧術連環拳','magic',.72,'fist'],
 assassin:['致命覺醒',{crit:15,critDmg:20},'幻影滅殺','physical',7.0,'skill'],
 rogue:['暗巷王權',{atkPct:20,goldPct:15},'掠影絕刃','physical',7.0,'snatch'],
 priest:['神恩降臨',{matkPct:15,healingPct:30},'聖裁光域','magic',7.0,'skill'],
 monk:['龍魂鬥氣',{atkPct:25,crit:8},'龍虎崩拳','physical',4.3,'combo'],
 hunter:['蒼鷹戰魂',{atkPct:20,hitPct:15},'蒼穹獵殺','physical',3.9,'falcon'],
 performer:['永恆協奏',{spRegen:2},'星河終章','physical',3.8,'song']
};
for(const [job,[buffName,modifiers,mainName,kind,power,event]] of Object.entries(REBORN_SKILLS)){
 const desc=Object.entries(modifiers).map(([key,n])=>`${({atkPct:'ATK',defPct:'DEF',matkPct:'MATK',aspdPct:'攻速',damageReduction:'最終減傷',castReduction:'詠唱縮短',autoSpellChance:'自詠機率',crit:'暴擊率',critDmg:'暴擊傷害',goldPct:'金幣收益',hitPct:'命中',healingPct:'治療',spRegen:'每4秒回SP'})[key]} +${key==='castReduction'||key==='autoSpellChance'?n*100:n}${key==='spRegen'?'':'%'}`).join('、');
 SECOND_SKILLS[job].push(S('rebirthBuff_'+job,buffName,'buff',10,25,job==='performer'?.2:0,`轉生二轉 Job10自動習得；10秒${desc}${job==='performer'?'、主人與寵物傷害+20%':''}`,[],{rebornOnly:true,maxRank:1,buff:'rebirth_'+job,modifiers,duration:10000,cooldown:18000,teamDamage:job==='performer',event:job==='performer'?'song':'buff'}));
 SECOND_SKILLS[job].push(S('rebirthMain_'+job,mainName,kind,20,32,power,`轉生二轉 Job20自動習得；承接本職業共鳴（額外能力傷害係數50%，CD縮短最多20%）${job==='sage'?'，可觸發自動念咒':job==='hunter'?'，由獵鷹協同射擊':job==='rogue'?'，可嘗試偷取物品':''}`,[],{rebornOnly:true,maxRank:1,cooldown:9000,event,aoe:true,targets:job==='wizard'?5:3,...(job==='wizard'?{castMs:2400}:{}),...(job==='sage'?{attackCycle:true,mp:4}:{}),...(job==='crusader'?{source:'holyShield'}:{}),...(job==='rogue'?{steal:true}:{})}));
}
for(const [id,meta] of Object.entries(SECOND_JOBS))JOB_SKILLS[id]=[...JOB_SKILLS[meta.parent],...SECOND_SKILLS[id]];
export const jobSkillById=(job,id)=>JOB_SKILLS[job]?.find(s=>s.id===id);
export const activeJobSkills=job=>JOB_SKILLS[job].filter(s=>s.kind!=='passive');
export const initialJobSkills=job=>({[activeJobSkills(job).find(s=>!SECOND_JOBS[job]||s.branch==='second').id]:1});
export const weaponSkillAllowed=(skill,right,left)=>skill.kind==='passive'||!skill.weapons?.length||skill.weapons.some(type=>type==='dual'?right==='dagger'&&left==='dagger':right===type);
export function jobPassives(player){const bonuses={};for(const skill of JOB_SKILLS[player.job]||[])if(skill.kind==='passive'){const rank=player.jobSkills?.[skill.id]||0;for(const [key,value] of Object.entries(skill.bonuses))bonuses[key]=(bonuses[key]||0)+value*rank;}return bonuses;}
export const skillUnlocked=(player,skill)=>(skill.branch==='first'&&SECOND_JOBS[player.job]?player.firstJobLevel||50:player.jobLevel)>=skill.unlock;
