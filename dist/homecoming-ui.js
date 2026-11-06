import {HOMECOMING_ROUTES,homecomingIdentity} from './homecoming-data.js';
import {HOMECOMING_ADVENTURES,adventureLocation} from './homecoming-adventures.js';
import {eligibleHomecoming,homecomingBonuses} from './homecoming-state.js';
import {renderHomecomingArt,renderHomecomingJourneyArt} from './homecoming-art.js';
import {fourthPair,FOURTH_SKILLS,fourthUnlocked} from './companion-fourth-skill.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(id,action,label,choice)=>`<button data-homecoming="${action}" data-route="${id}"${choice===undefined?'':` data-choice="${esc(choice)}"`}>${esc(label)}</button>`;
const labels={heat:'熱量',pressure:'壓力',beacons:'航標',supplies:'補給',rescued:'救援',alarm:'警戒',key:'鑰匙',grain:'穀物',herb:'藥草',wheel:'車輪',wins:'演武',notes:'音節',keeper:'守門人證詞',child:'孩童證詞',record:'舊誓文',spring:'春風',summer:'夏雨',autumn:'秋霜',winter:'冬雪',sap:'樹液',people:'居民',trunk:'主根',seed:'幼苗',fuel:'燃料',scouted:'偵察'};
export function homecomingTracker(p){
 const quests=Object.values(p?.homecoming?.routes||{}),letters=quests.filter(q=>q.phase==='letter').length,active=quests.filter(q=>!['letter','claimed'].includes(q.phase)).length;
 if(!quests.length)return '';
 return `<article class="quest-track-card" data-ui-key="homecoming"><b>夥伴返鄉契約</b><span>未讀來信 ${letters}・進行中 ${active}</span>${button('','open','查看返鄉任務')}</article>`;
}
export function renderHomecomingPanel(p){
 const b=homecomingBonuses(p),pet=p.pets?.find(x=>x.id===p.activePetId);
 const summary=`<div class="item"><h3>十二大陸・返鄉契約</h3><p>高階人形（SSS）與契印 8 開啟返鄉來信。首次逐頁旅行後抵達城鎮；每條故事需帶上對應外觀的出戰夥伴，並在線上手動推進。</p><p>已完成 ${b.count}／12。人物永久傳承：傷害 +${(b.damage*100).toFixed(2)}%、HP +${Math.round(b.hp*100)}%、雙防 +${Math.round(b.def*100)}%、技能受療 +${Math.round(b.recovery*100)}%。</p><p class="muted">測試版：首次旅行插畫已齊全（36／36）；人物傳承與第四格專屬技能已生效。</p></div>`;
 const current=homecomingIdentity(pet),quests=p.homecoming?.routes||{};
 const priority=r=>{const q=quests[r.id];return q?.phase==='traveling'?0:r.id===current&&q?1:q&&q.phase!=='claimed'?2:q?3:4;};
 const ordered=[...HOMECOMING_ROUTES].sort((a,b)=>priority(a)-priority(b));
 const renderRoute=r=>{
 const q=p.homecoming?.routes?.[r.id];let html=`<section class="item homecoming-card" data-homecoming-route="${r.id}" style="--homecoming-color:${r.color}"><small>${esc(r.continent)}・${esc(r.companion)}</small><h3>${esc(r.title)}</h3>`;
 if(!q)return html+'<p class="muted">達成條件後，在安全城鎮收到家鄉來信。</p></section>';
 const match=eligibleHomecoming(p,pet)&&homecomingIdentity(pet)===r.id;
 if(!match&&q.phase!=='claimed')html+='<p class="muted">請出戰這條路線對應的高階人形夥伴。</p>';
 if(q.phase==='letter')html+=`<p>${esc(r.letter)}</p>`+button(r.id,'begin','帶夥伴啟程');
 else if(q.phase==='traveling')html+=`<div class="homecoming-journey"><small>${['啟程','途中','抵達'][q.journeyIndex]}・${q.journeyIndex+1}／3</small><p>${esc(r.journey[q.journeyIndex])}</p>${renderHomecomingJourneyArt(r.id,q.journeyIndex)}</div>`+button(r.id,q.journeyIndex===2?'arrive':'next',q.journeyIndex===2?'進入'+r.town:'下一張');
 else {
 if(p.location!==r.townId)html+=button(r.id,'return','返回'+r.town);
 if(q.phase==='arrived')html+=`<p>${esc(r.npc)}：「${esc(r.letter)}」</p>`+button(r.id,'accept','確認接受委託');
 if(q.phase==='active'){
 const a=q.adventure,d=HOMECOMING_ADVENTURES[r.id],n=d.nodes[a.step],map=adventureLocation(r,n);
 html+=renderHomecomingArt(r.id,a.step)+`<h4>${esc(d.mechanic)}</h4><p>${esc(n.text)}</p><p class="muted">${Object.entries(a.vars).map(([k,v])=>esc(labels[k]||k)+' '+v).join('・')}</p>`;
 if(p.location!==map)html+=button(r.id,'go','前往'+({town:r.town,field:'事件現場',boss:'核心區域'})[n.location]);
 else if(n.combat)html+='<p>請在戰鬥畫面完成這場挑戰。</p>';
 else html+='<div class="homecoming-actions">'+n.choices.map(c=>button(r.id,'choose',c.label,c.id)).join('')+'</div>';
 }
 if(q.phase==='ready')html+='<p>委託已完成，請回城與委託人交付。</p>'+button(r.id,'claim','向'+r.npc+'交付任務');
 if(q.phase==='claimed')html+=`<p>${esc(r.ending)}</p><p>人物傳承已登錄，獎勵不重複發放。</p>`;
 }
 const sk=FOURTH_SKILLS[fourthPair({fusion:{main:r.id.split('-')[0],sub:r.id.split('-')[1]}})];
 return html+`<p>第四格：${esc(sk.name)}・${fourthUnlocked(p,{trueForm:true,humanoidStage:3,fusion:{main:r.id.split('-')[0],sub:r.id.split('-')[1]}})?'已解放，可在夥伴技能頁查看':'尚未解放'}</p></section>`;
 };
 const known=ordered.filter(r=>quests[r.id]),waiting=ordered.filter(r=>!quests[r.id]);
 return summary+known.map(renderRoute).join('')+(waiting.length?`<details class="homecoming-waiting"><summary>尚未收到的家鄉來信（${waiting.length}）</summary>${waiting.map(renderRoute).join('')}</details>`:'');
}
export function renderHomecomingTown(p){
 const route=HOMECOMING_ROUTES.find(r=>r.townId===p.location);if(!route)return '';
 const q=p.homecoming?.routes?.[route.id];
 return `<div class="town-npc"><b>${esc(route.npc)}</b><p>${esc(q?.phase==='claimed'?route.ending:route.letter)}</p>${button(route.id,'open','與'+route.npc+'交談')}</div><button data-open="shop" class="town-evolution">城鎮補給商店</button>`;
}
