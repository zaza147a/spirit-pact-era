import {EXTREME_TRIALS,extremeStage,normalizeExtremeProgress} from './extreme-trials.js';
import {EXTREME_FLOOR_COLLECTIBLES} from './extreme-trials-rewards.js';

const escapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const format=n=>Math.round(n).toLocaleString('zh-TW');
// Keep a bounded checkpoint selector even when records grow without a cap.
export function extremeStartOptions(highest){
 const maxStart=Math.floor(Math.max(0,highest)/10)*10;
 const checkpoints=[1,10,20,30];
 for(let i=Math.max(40,maxStart-190);i<=maxStart;i+=10)checkpoints.push(i);
 return [...new Set(checkpoints.filter(n=>n===1||n<=maxStart))].sort((a,b)=>a-b);
}

// HTML only; host binds data-extreme-enter and data-extreme-exit to actual actions.
export function renderExtremePanel(player,{now=0}={}){
  const progress=normalizeExtremeProgress(player?.extremeProgress);
  const current=player?.extremeRun;
  if(current){
    const config=EXTREME_TRIALS[current.kind],stage=extremeStage(current.kind,current.floor);
    const seconds=Math.max(0,stage.seconds-Math.floor((now-current.stageStartedAt)/1000));
    const objective=current.kind==='clear'?`本階擊殺 ${current.stageKills||0}／${stage.requiredKills}`:current.kind==='hp'
      ?`本階傷害 ${format(current.stageDamage||0)}／${format(stage.requiredDamage)}`
      :`首領 ${current.kind.toUpperCase()} × ${stage.attackMultiplier.toFixed(2)} · 撐過本階攻擊`;
    return `<section class="item extreme-trial-panel"><h3>⚔ ${escapeText(config.name)} · 第 ${current.floor} 階</h3><p>${objective}</p><p>⏳ 本階剩餘 ${seconds} 秒</p><button data-extreme-exit="1">主動退出試煉</button></section>`;
  }
  return `<section class="item extreme-trial-panel"><h3>✦ 四域極限試煉</h3><p>極限試煉官・亞爾德 · 每隻角色各自紀錄四王最高階與永久解鎖獎勵，互不共用。從任何已解鎖的十階節點連續挑戰，可於離線持續戰鬥，首次失敗立即停止。達到指定階數即自動獲得稱號、名稱框、戰袍、光環與背景，不需累積或購買。第 31 階起繼續挑戰可取得更高階稱號。</p>`+
    Object.entries(EXTREME_TRIALS).map(([kind,config])=>{
      const high=progress[kind].highest,options=extremeStartOptions(high);
      const detail=kind==='clear'?'30 秒內擊殺指定數量怪物':kind==='hp'?'30 秒內達成傷害門檻':'存活 20 秒，前 30 階逐階提升攻擊，31 階後平滑加速';
      return `<article class="extreme-boss-card"><img class="extreme-boss-thumb" src="assets/extreme/boss-${kind}.webp" alt="${escapeText(config.name)}立繪" loading="lazy"><div><h4>${escapeText(config.name)}</h4><p>${detail} · 歷史最高第 ${high} 階</p></div>`+
        `<label>入場階段 <select data-extreme-select="${kind}">${options.map(f=>`<option value="${f}">第 ${f} 階</option>`).join('')}</select></label>`+
        `<button data-extreme-enter="${kind}" ${player?.level<200?'disabled title="需要 200 等"':''}>開始挑戰</button>`+
        (high>0?`<button data-extreme-enter="${kind}" data-extreme-floor="${high+1}" ${player?.level<200?'disabled title="需要 200 等"':''}>從最高進度繼續 · 第 ${high+1} 階</button>`:'')+`</article>`;
    }).join('')+`<p>每隻王的固定解鎖：第 10 階稱號、第 20 階兩款名稱框、第 25 階專屬戰袍、第 30 階光環及兩款背景；第 35 階起每五階再獲得更高階稱號。所有獎勵直接解鎖，不消耗任何貨幣。試煉不提供一般經驗值、金幣或怪物掉落。</p>`+
    `<h3>階段獎勵 · 自動永久解鎖</h3>`+
    EXTREME_FLOOR_COLLECTIBLES.map(item=>{
      const unlocked=progress[item.kind].highest>=item.floor;
      return `<div class="extreme-shop-row"><b>${escapeText(item.name)}</b><small>${escapeText(EXTREME_TRIALS[item.kind].name)}第 ${item.floor} 階自動解鎖</small><span>${unlocked?'✓ 已解鎖':'尚未解鎖'}</span></div>`;
    }).join('')+`</section>`;
}
