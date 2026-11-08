import {EXTREME_TRIALS,extremeStage,normalizeExtremeProgress} from './extreme-trials.js';

const escapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const format=n=>Math.round(n).toLocaleString('zh-TW');

// HTML only; host binds data-extreme-enter and data-extreme-exit to actual actions.
export function renderExtremePanel(player,{now=0}={}){
  const progress=normalizeExtremeProgress(player?.extremeProgress);
  const current=player?.extremeRun;
  if(current){
    const config=EXTREME_TRIALS[current.kind],stage=extremeStage(current.kind,current.floor);
    const seconds=Math.max(0,stage.seconds-Math.floor((now-current.stageStartedAt)/1000));
    const objective=current.kind==='hp'
      ?`本階傷害 ${format(current.stageDamage||0)}／${format(stage.requiredDamage)}`
      :`首領 ${current.kind.toUpperCase()} × ${stage.attackMultiplier.toFixed(2)} · 撐過本階攻擊`;
    return `<section class="item extreme-trial-panel"><h3>⚔ ${escapeText(config.name)} · 第 ${current.floor} 階</h3><p>${objective}</p><p>⏳ 本階剩餘 ${seconds} 秒</p><button data-extreme-exit="1">主動退出試煉</button></section>`;
  }
  return `<section class="item extreme-trial-panel"><h3>✦ 三域極限試煉</h3><p>極限試煉官・亞爾德 · 每階首次突破才可領取極限徽記。三隻王獨立記錄成績。</p>`+
    Object.entries(EXTREME_TRIALS).map(([kind,config])=>{
      const high=progress[kind].highest,maxStart=Math.floor(high/10)*10;
      const options=[1,...Array.from({length:maxStart/10},(_,i)=>(i+1)*10)];
      const detail=kind==='hp'?'30 秒內達成傷害門檻':'存活 20 秒，攻擊每階增加 15%';
      return `<article class="extreme-boss-card"><h4>${escapeText(config.name)}</h4><p>${detail} · 歷史最高第 ${high} 階</p>`+
        `<label>入場階段 <select data-extreme-select="${kind}">${options.map(f=>`<option value="${f}">第 ${f} 階</option>`).join('')}</select></label>`+
        `<button data-extreme-enter="${kind}" ${player?.level<200?'disabled title="需要 200 等"':''}>開始挑戰</button></article>`;
    }).join('')+`<p>極限徽記：${format(player?.extremeCoins||0)} 枚。試煉不提供一般經驗值、金幣或怪物掉落。</p></section>`;
}
