const NPC_ART = {
  quests:'guide', guild:'guild', evolution:'evolution', shop:'merchant', warehouse:'warehouse',
  enhancement:'enhancer', reforge:'reforge', collection:'collector', cardrecycle:'alchemist',
  cardcollection:'archivist', trials:'guardian', sigilcraft:'sigil', third:'awakener'
};

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
    card.append(portrait,button);roster.append(card);
  }
  area.querySelector(':scope > .town-npc')?.remove();
  scene.append(heading,roster);area.append(scene);
}

if(typeof document!=='undefined'){
  const css=document.createElement('link');css.rel='stylesheet';css.href='town-scene.css?v=6.5.70';document.head.append(css);
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
