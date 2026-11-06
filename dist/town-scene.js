const NPC_ART = {
  quests:'guide', guild:'guild', evolution:'evolution', shop:'merchant', warehouse:'warehouse',
  enhancement:'enhancer', reforge:'reforge', collection:'collector', cardrecycle:'alchemist',
  cardcollection:'archivist', trials:'guardian', sigilcraft:'sigil', third:'awakener'
};
const NPC_DIALOG = {
  quests:['征途引導官・艾琳','每段旅程都有自己的故事。你想查看目前的委託，還是準備迎接下一次試煉？','查看任務'],
  guild:['公會轉職官','你的冒險經驗已經累積不少了。準備好選擇下一條職業道路了嗎？','查看轉職'],
  third:['覺醒導師','力量不只是數值，更是對自己的理解。讓我們看看你能覺醒什麼。','進行覺醒'],
  evolution:['靈契進化師','我能感受到你與夥伴之間的羈絆。現在就確認牠們的進化可能吧。','查看夥伴進化'],
  shop:['旅途補給商','遠行前先準備好藥水與捕捉球吧，補給充足才能走得更遠。','進入商店'],
  warehouse:['倉庫管理員・米菈','你的珍藏我會妥善保管。需要寄存，還是領回物品呢？','開啟倉庫'],
  enhancement:['星鑄師・赫瑟','精良的裝備也有成長的潛力。帶來星鑄結晶，我就能替你淬鍊。','查看強化'],
  reforge:['靈紋重鑄師','每道靈紋都記錄著命運。想重新雕琢裝備的力量嗎？','進行重鑄'],
  collection:['鑄金典藏師','真正的收藏家，追求的可不只是金幣。來看看你的收藏成就吧。','查看收藏館'],
  cardrecycle:['命運卡片鍊成師','不需要的卡片，也能成為下一張珍稀卡片的起點。','進行卡片鍊成'],
  cardcollection:['星頁典藏師・露娜','每一張卡片都是冒險世界的一頁紀錄。要翻閱你的收藏嗎？','查看卡片收藏'],
  trials:['試煉之門守護者','門後的守衛會檢驗你的實力。準備好接受連續五場挑戰了嗎？','進入試煉'],
  sigilcraft:['契印師・曦紋','曙光會回應耐心雕琢之人。讓我看看你收集到的契印材料。','製作契印']
};
const bypassDialog=new WeakSet();

export function showNpcDialog(role,button){
  const info=NPC_DIALOG[role];if(!info)return;
  document.querySelector('.town-npc-dialog-overlay')?.remove();
  const overlay=document.createElement('div');overlay.className='town-npc-dialog-overlay';
  const dialog=document.createElement('section');dialog.className='town-npc-dialog';
  dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
  dialog.setAttribute('aria-label',`與${info[0]}對話`);
  const portrait=document.createElement('img');portrait.src=`assets/towns/npc-${NPC_ART[role]}.webp`;portrait.alt=info[0];
  const copy=document.createElement('div');copy.className='town-npc-dialog-copy';
  const title=document.createElement('h3');title.textContent=info[0];
  const speech=document.createElement('p');speech.textContent=`「${info[1]}」`;
  const actions=document.createElement('div');actions.className='town-npc-dialog-actions';
  const proceed=document.createElement('button');proceed.className='goldbtn';proceed.textContent=info[2];
  const close=document.createElement('button');close.textContent='稍後再來';
  const restoreFocus=()=>{overlay.remove();if(button.isConnected)button.focus();};
  close.onclick=restoreFocus;
  proceed.onclick=()=>{overlay.remove();bypassDialog.add(button);button.click();};
  actions.append(proceed,close);copy.append(title,speech,actions);dialog.append(portrait,copy);overlay.append(dialog);
  overlay.addEventListener('click',event=>{if(event.target===overlay)restoreFocus();});
  overlay.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();restoreFocus();}
    if(event.key==='Tab'){
      const items=[proceed,close];const index=items.indexOf(document.activeElement);
      if(event.shiftKey&&index===0){event.preventDefault();close.focus();}
      else if(!event.shiftKey&&index===1){event.preventDefault();proceed.focus();}
    }
  });
  document.body.append(overlay);proceed.focus();
}

function actionFor(button){
  if(button.id==='townTransferBtn')return 'guild';
  if(button.id==='townThirdBtn')return 'third';
  if(button.id==='townEvolutionBtn')return 'evolution';
  return button.dataset.open||'';
}

/** Move existing action buttons, preserving their behavior and event binding. */
export function decorateTownScene(area,location){
  if(!['town','skycity','dawncity'].includes(location))return;
  const buttons=[...area.querySelectorAll(':scope > .town-evolution, :scope > .town-npc button, :scope > [data-open]')];
  if(!buttons.length)return;
  const scene=document.createElement('section');
  scene.className=`town-scene town-scene-${location}`;
  scene.setAttribute('aria-label','村莊 NPC 互動場景');
  const heading=document.createElement('div');
  heading.className='town-scene-heading';
  heading.innerHTML='<strong>村莊漫步</strong><span>選擇想拜訪的居民</span>';
  const roster=document.createElement('div');roster.className='town-scene-roster';
  for(const button of buttons){
    const role=actionFor(button);
    if(!NPC_ART[role])continue;
    const card=document.createElement('div');card.className='town-scene-npc';
    const portrait=document.createElement('img');
    portrait.src=`assets/towns/npc-${NPC_ART[role]}.webp`;
    portrait.alt=`${button.textContent.trim()}角色立繪`;
    portrait.loading='lazy';portrait.decoding='async';
    portrait.onerror=()=>{portrait.style.display='none';card.classList.add('art-missing');};
    button.classList.add('town-scene-action');
    button.classList.remove('town-evolution');
    button.addEventListener('click',event=>{
      if(bypassDialog.delete(button))return;
      event.preventDefault();event.stopImmediatePropagation();showNpcDialog(role,button);
    },true);
    card.append(portrait,button);roster.append(card);
  }
  area.querySelector(':scope > .town-npc')?.remove();
  scene.append(heading,roster);area.append(scene);
}

if(typeof document!=='undefined'){
  const css=document.createElement('link');css.rel='stylesheet';css.href='town-scene.css?v=6.5.71';document.head.append(css);
  const initialize=()=>{
    const area=document.getElementById('area');if(!area)return;
    let pending=false;
    new MutationObserver(()=>{
      if(pending||area.querySelector('.town-scene'))return;
      pending=true;
      queueMicrotask(()=>{pending=false;if(!area.querySelector('.town-scene'))decorateTownScene(area,['town','skycity','dawncity'].find(x=>area.classList.contains(x)));});
    }).observe(area,{childList:true});
    decorateTownScene(area,['town','skycity','dawncity'].find(x=>area.classList.contains(x)));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
}
