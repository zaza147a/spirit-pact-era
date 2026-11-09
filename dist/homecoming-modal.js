import {HOMECOMING_ROUTES} from './homecoming-data.js';
import {HOMECOMING_ADVENTURES} from './homecoming-adventures.js';
import {renderHomecomingArt,renderHomecomingJourneyArt} from './homecoming-art.js';

const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function homecomingPicture(p,routeId){
 const route=HOMECOMING_ROUTES.find(r=>r.id===routeId),q=p?.homecoming?.routes?.[routeId];
 if(!route||!q)return null;
 if(q.phase==='traveling'){
  const i=q.journeyIndex;
  if(!Number.isInteger(i)||i<0||i>2)return null;
  return {key:`${routeId}:journey:${i}`,title:`${route.title}・${['啟程','途中','抵達'][i]}`,story:route.journey[i],html:renderHomecomingJourneyArt(routeId,i)};
 }
 if(q.phase==='active'&&q.adventure){
  const node=HOMECOMING_ADVENTURES[routeId]?.nodes?.[q.adventure.step];
  if(!node)return null;
  return {key:`${routeId}:scene:${q.adventure.step}`,title:`${route.title}・任務場景`,story:node.text,html:renderHomecomingArt(routeId,q.adventure.step)};
 }
 return null;
}

export function showHomecomingPicture(p,routeId){
 if(typeof document==='undefined')return false;
 const picture=homecomingPicture(p,routeId);if(!picture)return false;
 let dialog=document.getElementById('homecomingPictureDialog');
 if(!dialog){
  dialog=document.createElement('dialog');dialog.id='homecomingPictureDialog';dialog.className='homecoming-picture-dialog';
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  document.body.append(dialog);
 }
 dialog.innerHTML=`<div class="homecoming-picture-content"><header><h2>${escapeHtml(picture.title)}</h2><button type="button" data-close-homecoming-picture aria-label="關閉圖片">✕</button></header><p>${escapeHtml(picture.story)}</p>${picture.html}<button type="button" class="homecoming-picture-continue" data-close-homecoming-picture>繼續故事</button></div>`;
 dialog.querySelectorAll('[data-close-homecoming-picture]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
 if(!dialog.open)dialog.showModal();
 dialog.querySelector('[data-close-homecoming-picture]')?.focus();
 return true;
}
