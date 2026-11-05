import {HOMECOMING_ROUTES} from './homecoming-data.js';
import {homecomingOpponent} from './homecoming-encounters.js';
export const HOMECOMING_SCENE_ART=Object.freeze(Object.fromEntries(HOMECOMING_ROUTES.map(r=>[r.id,Object.freeze({src:`assets/homecoming/scenes/${r.id}.webp`,alt:`${r.continent}・${r.title}任務場景`})])));
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderHomecomingArt(routeId,stepId){
 const scene=HOMECOMING_SCENE_ART[routeId];if(!scene)return '';
 const foe=homecomingOpponent(routeId,stepId);
 return `<figure class="homecoming-scene"><img src="${scene.src}" alt="${escapeHtml(scene.alt)}" loading="lazy" decoding="async" width="1152" height="768"></figure>`+(foe?`<figure class="homecoming-opponent"><img src="${foe.artPath}" alt="${escapeHtml(foe.name)}" loading="lazy" decoding="async" width="768" height="768"><figcaption><b>${escapeHtml(foe.name)}</b><span>${escapeHtml(foe.description)}</span></figcaption></figure>`:'');
}
