import {TOWER_NAME,TOWER_REGIONS,towerFloor,towerEntryError,normalizeTowerProgress,towerAvailableFloors,towerObjectiveLabel} from './endless-tower.js';
import {TOWER_FIRST_RELEASE_MAX,towerRemainingSeconds} from './endless-tower-runtime.js';

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderTowerPanel(player,{maxFloor=TOWER_FIRST_RELEASE_MAX,now=0}={}) {
  const progress=normalizeTowerProgress(player?.towerProgress),entryError=towerEntryError(player)||(!player?.towerRun&&player?.location!=='dawncity'?'請前往曙光聖港':null);
  const active=player?.towerRun;
  const title=`<section class="item trial-intro tower-intro"><span class="eyebrow">ENDLESS TOWER / 天穹終境</span><h3>✧ ${TOWER_NAME}</h3><p>共100層固定關卡，101層後開放無盡深淵。<strong>每層獨立挑戰，通關後立即存進度、返回村莊，可更換裝備／卡片／夥伴／配點，再挑戰下一層。</strong> 已通關樓層可隨時重戰，每10層記錄檢查點；死亡或超時只結束當層。獎勵限稱號、外觀、收藏與便利功能，沒有永久戰鬥加成。</p><p>最高紀錄：<b>${progress.highest} 層</b> · 檢查點 ${progress.checkpoint} 層 · 塔幣 ${Math.max(0,Math.floor(Number(player?.towerCoins)||0)).toLocaleString('zh-TW')}</p></section>`;
  if(active){
    const stage=towerFloor(active.floor);
    return title+`<section class="item trial-route tower-active" aria-live="polite"><h3>${stage.floor} 層 · ${escapeHtml(stage.name)}</h3><p>${escapeHtml(towerObjectiveLabel(stage))} · 剩餘 ${Math.ceil(towerRemainingSeconds(active,now))} 秒</p><p>${stage.objective==='hunt'?`逃離倒數 ${Math.max(0,stage.goal-Math.floor((now-active.stageStartedAt)/1000))} 秒 · 已擊殺 ${active.huntKills||0} 隻`:stage.objective==='survive'?`已生存 ${Math.max(0,Math.floor((now-active.stageStartedAt)/1000))}／${stage.goal} 秒`:`已擊敗 ${active.completedEnemyIds?.length||0}／${stage.enemyCount} 隻指定目標`}</p><button data-tower-exit>結束天穹終境挑戰</button></section>`;
  }
  const regions=TOWER_REGIONS.slice(0,Math.ceil(maxFloor/10)),available=new Set(towerAvailableFloors(progress,maxFloor));
  return title+(player?.towerLastFailure?towerFailureNotice(player.towerLastFailure):player?.towerLastResult?towerRewardNotice(player.towerLastResult):'')+`<section class="item"><b>開放條件</b><p>${escapeHtml(entryError||'已符合入場條件')}</p><p>第一階段開放 1～${maxFloor} 層，後續樓層將於實戰平衡驗收後開放。</p></section>`+
    regions.map((region,i)=>{
      const from=i*10+1,to=Math.min(maxFloor,(i+1)*10),unlocked=progress.highest>=from-1;
      const next=progress.highest>=from&&progress.highest<to?progress.highest+1:from;
      const canEnter=!entryError&&unlocked&&next<=maxFloor;
      const options=Array.from({length:to-from+1},(_,j)=>from+j).map(floor=>{const objective=towerFloor(floor).objective,mode=objective==='hunt'?'追擊殲敵':objective==='survive'?'堅守逃離':objective==='assassinate'?'首領斬首':'殲滅';return `<option value="${floor}" ${!available.has(floor)?'disabled':''} ${floor===next?'selected':''}>第 ${floor} 層 · ${mode}${floor<=progress.highest?' · 已通關':floor===progress.highest+1?' · 下一層':' · 未解鎖'}</option>`;}).join('');
      return `<section class="item trial-route tower-region"><h3>${from}～${to} 層 · ${escapeHtml(region.name)}</h3><p>大型首領：${escapeHtml(region.boss)}</p><p>敵人能力：${escapeHtml(region.mechanic)} · 首領首次通關稱號：${escapeHtml(region.reward)}</p><small>${progress.highest>=to?'✓ 已通關':unlocked?'可挑戰':'尚未解鎖'}</small><div class="tower-floor-picker"><label>選擇樓層 <select data-tower-floor-select="${i}" ${canEnter?'':'disabled'}>${options}</select></label><button data-tower-floor-go="${i}" ${canEnter?'':'disabled'}>進入選定樓層</button></div></section>`;
    }).join('');
}

export function towerRewardNotice({floor,coins=0,firstReward=null,clearSeconds=0,huntKills}={}) {
  return `<section class="item quest-ready tower-reward" role="status"><h3>✦ 天穹終境 · 第 ${Math.max(1,Math.floor(Number(floor)||1))} 層通關</h3><p>通關時間 ${Math.max(0,Number(clearSeconds)||0).toFixed(1)} 秒 · 天穹塔幣 +${Math.max(0,Math.floor(Number(coins)||0))}</p>${huntKills!==undefined?`<p>追擊關共擊殺 ${Math.max(0,Math.floor(Number(huntKills)||0))} 隻重生小怪</p>`:''}${firstReward?`<p>首次通關稱號：${escapeHtml(firstReward)}</p>`:''}</section>`;
}

export function towerFailureNotice({floor,reason='',elapsedSeconds=0}={}) {
  return `<section class="item tower-failure" role="status"><h3>⚠ 天穹終境 · 第 ${Math.max(1,Math.floor(Number(floor)||1))} 層未通關</h3><p>原因：${escapeHtml(reason)} · 持續 ${Math.max(0,Math.floor(Number(elapsedSeconds)||0))} 秒</p><small>不扣除已通關進度，可調整生存裝備或夥伴後再次挑戰。</small></section>`;
}
