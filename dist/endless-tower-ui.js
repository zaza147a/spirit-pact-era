import {TOWER_NAME,TOWER_REGIONS,towerFloor,towerEntryError,normalizeTowerProgress} from './endless-tower.js';
import {TOWER_FIRST_RELEASE_MAX,towerRemainingSeconds} from './endless-tower-runtime.js';

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderTowerPanel(player,{maxFloor=TOWER_FIRST_RELEASE_MAX,now=0}={}) {
  const progress=normalizeTowerProgress(player?.towerProgress),entryError=towerEntryError(player);
  const active=player?.towerRun;
  const title=`<section class="item trial-intro tower-intro"><span class="eyebrow">ENDLESS TOWER / 天穹終境</span><h3>✧ ${TOWER_NAME}</h3><p>共100層固定關卡，101層後開放無盡深淵。每10層解鎖檢查點；死亡或超時立即停止。獎勵限稱號、外觀、收藏與便利功能，沒有永久戰鬥加成。</p><p>最高紀錄：<b>${progress.highest} 層</b> · 檢查點 ${progress.checkpoint} 層 · 塔幣 ${Math.max(0,Math.floor(Number(player?.towerCoins)||0)).toLocaleString('zh-TW')}</p></section>`;
  if(active){
    const stage=towerFloor(active.floor);
    return title+`<section class="item trial-route tower-active" aria-live="polite"><h3>${stage.floor} 層 · ${escapeHtml(stage.name)}</h3><p>${escapeHtml(stage.region)} · ${escapeHtml(stage.mechanic)} · 剩餘 ${Math.ceil(towerRemainingSeconds(active,now))} 秒</p><p>已擊敗 ${active.completedEnemyIds?.length||0}／${stage.enemyCount} 隻</p><button data-tower-exit>結束天穹終境挑戰</button></section>`;
  }
  const regions=TOWER_REGIONS.slice(0,Math.ceil(maxFloor/10));
  return title+`<section class="item"><b>開放條件</b><p>${escapeHtml(entryError||'已符合入場條件')}</p><p>第一階段開放 1～${maxFloor} 層，後續樓層將於實戰平衡驗收後開放。</p></section>`+
    regions.map((region,i)=>{
      const from=i*10+1,to=Math.min(maxFloor,(i+1)*10),unlocked=progress.highest>=from-1;
      const next=progress.highest>=from&&progress.highest<to?progress.highest+1:from;
      const canEnter=!entryError&&unlocked&&next<=maxFloor;
      return `<section class="item trial-route tower-region"><h3>${from}～${to} 層 · ${escapeHtml(region.name)}</h3><p>大型首領：${escapeHtml(region.boss)}</p><p>敵人能力：${escapeHtml(region.mechanic)} · 首領首次通關稱號：${escapeHtml(region.reward)}</p><small>${progress.highest>=to?'✓ 已通關':unlocked?'可挑戰':'尚未解鎖'}</small> <button data-tower-enter="${next}" ${canEnter?'':'disabled'}>${canEnter?`挑戰第 ${next} 層`:entryError?escapeHtml(entryError):'尚未解鎖'}</button>${progress.highest>=to?`<button data-tower-enter="${to}" ${entryError?'disabled':''}>重戰第 ${to} 層首領</button>`:''}</section>`;
    }).join('');
}

export function towerRewardNotice({floor,coins=0,firstReward=null,clearSeconds=0}={}) {
  return `<section class="item quest-ready tower-reward" role="status"><h3>✦ 天穹終境 · 第 ${Math.max(1,Math.floor(Number(floor)||1))} 層通關</h3><p>通關時間 ${Math.max(0,Number(clearSeconds)||0).toFixed(1)} 秒 · 天穹塔幣 +${Math.max(0,Math.floor(Number(coins)||0))}</p>${firstReward?`<p>首次通關稱號：${escapeHtml(firstReward)}</p>`:''}</section>`;
}
