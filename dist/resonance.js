// Five classes × four pet roles. Incoming events are real outcomes, never simulated dodges or blocks.
const rule=(events,name,effect,power,cooldown,description)=>({event:events[0],events,name,effect,power,cooldown,description});
export const RESONANCE_RULES={
 swordsman:{attack:rule(['attack','block'],'守護追擊','strike',1,4500,'劍士普攻命中或格擋時，攻擊寵物追擊'),magic:rule(['skill','attack'],'劍氣附魔','magic',.9,4500,'劍士攻擊或攻擊技能命中時，魔法寵物追加元素傷害'),defense:rule(['attack','block','pet_guard','shield'],'鋼鐵連防','shield',1.3,5500,'劍士命中、格擋、施放護盾，或坦寵受擊時獲得護盾'),support:rule(['attack','skill','heal'],'不屈祝福','heal',.7,5500,'劍士攻擊命中或成功治療後，寵物恢復主人生命')},
 acolyte:{attack:rule(['skill','attack'],'聖光追獵','strike',1,4500,'服事攻擊命中時，攻擊寵物追加追擊'),magic:rule(['skill','attack'],'神聖魔彈','magic',1.15,4500,'服事攻擊命中時，魔法寵物追加魔法傷害'),defense:rule(['heal','skill','shield','pet_guard'],'恩典護盾','shield',1.2,6000,'服事攻擊施法、成功治療、施放護盾或坦寵受擊時獲得護盾'),support:rule(['heal','skill','attack'],'雙重祈禱','mana',1,6000,'服事成功治療或攻擊命中時，輔助寵物恢復SP')},
 mage:{attack:rule(['skill','attack'],'元素裂擊','strike',1,4500,'法師攻擊命中時，攻擊寵物進行物理追擊'),magic:rule(['skill','attack'],'元素連鎖','magic',1.25,5000,'法師攻擊命中時，魔法寵物追加連鎖魔法'),defense:rule(['skill','pet_guard','mana'],'守護詠唱','shield',1.35,6000,'法師攻擊施法、回復SP或坦寵受擊時，獲得護盾'),support:rule(['skill','attack','mana'],'魔力回響','mana',1.25,5500,'法師攻擊命中或成功凝聚魔力後，寵物補充SP')},
 archer:{attack:rule(['attack','skill'],'獵鷹齊射','strike',1.15,4600,'弓箭手攻擊命中後，攻擊寵物協同追擊'),magic:rule(['skill','attack'],'元素箭共鳴','magic',1.2,5100,'弓箭手普攻或箭技命中後，魔法寵物以MATK追加傷害'),defense:rule(['attack','skill','pet_guard'],'獵手護幕','shield',1.4,5900,'弓箭手普攻／箭技命中，或坦寵受擊時獲得護盾；不依賴弓箭手被打或閃避'),support:rule(['attack','skill'],'續航箭歌','mana',1.1,5800,'弓箭手攻擊命中時，輔助寵物恢復SP')},
 thief:{attack:rule(['attack','crit'],'疾影追刃','strike',1.25,4000,'盜賊普攻或爆擊命中時，攻擊寵物快速追擊'),magic:rule(['skill','crit','attack'],'魔毒引爆','magic',1,5000,'盜賊攻擊命中時，魔法寵物追加魔法傷害'),defense:rule(['attack','dodge','pet_guard'],'殘影護身','shield',1.1,5500,'盜賊普攻命中、實際閃避或坦寵受擊時獲得護盾'),support:rule(['attack','crit'],'迅捷祝福','mana',.9,5000,'盜賊普攻或爆擊命中時，輔助寵物補充SP')}
};
export const RESONANCE_MAX=100,ULTIMATE_COST=60,ULTIMATE_COOLDOWN=30000;
export const RESONANCE_EVENTS={attack:'普攻命中',skill:'攻擊技能命中',crit:'爆擊命中',block:'實際格擋',dodge:'實際閃避',heal:'有效治療',shield:'施放護盾',mana:'有效回復SP',pet_guard:'坦寵實際受擊',pet:'寵物行動',tactic:'使用職業戰術'};
export const resonanceRule=(job,role)=>RESONANCE_RULES[job]?.[role]||null;
export const resonanceTriggered=(rule,event)=>!!rule&&(rule.events||[rule.event]).includes(event);
const secondResonance={
 knight:{events:['charge','attack','skill'],names:['衝鋒獵襲','焰刃衝鋒','戰騎護陣','凱旋戰歌'],effects:['strike','magic','shield','mana']},
 crusader:{events:['block','attack','shield','skill'],names:['守誓反擊','聖盾耀光','雙重壁壘','守護祈願'],effects:['strike','magic','shield','heal']},
 wizard:{events:['skill','attack'],names:['元素獵域','星火連鎖','詠唱護城','法潮回響'],effects:['strike','magic','shield','mana']},
 sage:{events:['fist','autospell','attack','skill'],names:['魔拳獵牙','自詠迴響','近身魔壁','靈泉拳意'],effects:['strike','magic','shield','mana']},
 assassin:{events:['crit','attack','skill'],names:['暗影雙獵','魔毒連爆','殘影甲幕','夜行回生'],effects:['strike','magic','shield','heal']},
 rogue:{events:['steal','attack','skill'],names:['掠影追擊','暗印突襲','煙幕重甲','奪寶靈歌'],effects:['strike','magic','shield','mana']},
 priest:{events:['heal','skill','attack','buff'],names:['聖獵祝福','神恩星耀','慈悲護城','雙聖祈禱'],effects:['strike','magic','shield','mana']},
 monk:{events:['combo','attack','skill'],names:['猛虎連拳','靈氣魔拳','金剛護體','調息共振'],effects:['strike','magic','shield','heal']},
 hunter:{events:['falcon','attack','skill'],names:['鷹狼合獵','靈羽元素箭','獵場護幕','巡林靈泉'],effects:['strike','magic','shield','mana']},
 performer:{events:['song','buff','attack','skill'],names:['戰獸協奏','星光交響','不破舞台','生命合唱'],effects:['strike','magic','shield','mana']}
};
for(const [job,entry] of Object.entries(secondResonance))RESONANCE_RULES[job]=Object.fromEntries(['attack','magic','defense','support'].map((role,i)=>[role,rule([...entry.events,...(role==='defense'?['pet_guard']:[])],entry.names[i],entry.effects[i],[1.05,1.05,1.3,1.05][i],5000,`${entry.events.map(e=>({charge:'衝鋒',block:'格擋',skill:'攻擊技能命中',attack:'普攻命中',fist:'魔力拳',autospell:'自動念咒',crit:'暴擊',steal:'成功偷取',heal:'有效治療',buff:'施放增益',combo:'拳套連段',falcon:'獵鷹協攻',song:'樂曲'})[e]).join('／')}時，${['攻擊寵追擊','魔法寵追擊','防禦寵提供護盾（亦可由坦寵受擊觸發）','輔助寵提供回復'][i]}`)]));
Object.assign(RESONANCE_EVENTS,{charge:'衝鋒命中',fist:'魔力拳命中',autospell:'自動念咒命中',steal:'成功偷取物品',buff:'施放增益',combo:'拳套連段命中',falcon:'獵鷹協攻',song:'樂曲協奏'});
