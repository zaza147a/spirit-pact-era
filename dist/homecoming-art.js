import {HOMECOMING_ROUTES} from './homecoming-data.js';
import {homecomingOpponent} from './homecoming-encounters.js';
export const HOMECOMING_SCENE_ART=Object.freeze(Object.fromEntries(HOMECOMING_ROUTES.map(r=>[r.id,Object.freeze({src:`assets/homecoming/scenes/${r.id}.webp`,alt:`${r.continent}・${r.title}任務場景`})])));
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderHomecomingArt(routeId,stepId){
 const scene=HOMECOMING_SCENE_ART[routeId];if(!scene)return '';
 const foe=homecomingOpponent(routeId,stepId);
 return `<figure class="homecoming-scene"><img src="${scene.src}" alt="${escapeHtml(scene.alt)}" loading="lazy" decoding="async" width="1152" height="768"></figure>`+(foe?`<figure class="homecoming-opponent"><img src="${foe.artPath}" alt="${escapeHtml(foe.name)}" loading="lazy" decoding="async" width="768" height="768"><figcaption><b>${escapeHtml(foe.name)}</b><span>${escapeHtml(foe.description)}</span></figcaption></figure>`:'');
}

// Recovered first-trip illustrations. Missing pages remain explicitly pending.
export const HOMECOMING_JOURNEY_ART=Object.freeze({
 'defense-support':Object.freeze(['assets/homecoming/journeys/defense-support-1.webp','assets/homecoming/journeys/defense-support-2.webp',null]),
 'support-magic':Object.freeze(['assets/homecoming/journeys/support-magic-1.webp','assets/homecoming/journeys/support-magic-2.webp','assets/homecoming/journeys/support-magic-3.webp']),
 'magic-support':Object.freeze(['assets/homecoming/journeys/magic-support-1.webp','assets/homecoming/journeys/magic-support-2.webp','assets/homecoming/journeys/magic-support-3.webp']),
 'defense-magic':Object.freeze(['assets/homecoming/journeys/defense-magic-1.webp','assets/homecoming/journeys/defense-magic-2.webp','assets/homecoming/journeys/defense-magic-3.webp']),
 'magic-defense':Object.freeze(['assets/homecoming/journeys/magic-defense-1.webp','assets/homecoming/journeys/magic-defense-2.webp','assets/homecoming/journeys/magic-defense-3.webp']),
 'defense-attack':Object.freeze(['assets/homecoming/journeys/defense-attack-1.webp','assets/homecoming/journeys/defense-attack-2.webp','assets/homecoming/journeys/defense-attack-3.webp']),
 'attack-defense':Object.freeze(['assets/homecoming/journeys/attack-defense-1.webp','assets/homecoming/journeys/attack-defense-2.webp','assets/homecoming/journeys/attack-defense-3.webp']),
 'magic-attack':Object.freeze(['assets/homecoming/journeys/magic-attack-1.webp','assets/homecoming/journeys/magic-attack-2.webp','assets/homecoming/journeys/magic-attack-3.webp']),
 'attack-magic':Object.freeze(['assets/homecoming/journeys/attack-magic-1.webp','assets/homecoming/journeys/attack-magic-2.webp','assets/homecoming/journeys/attack-magic-3.webp']),
 'support-attack':Object.freeze(['assets/homecoming/journeys/support-attack-1.webp','assets/homecoming/journeys/support-attack-2.webp','assets/homecoming/journeys/support-attack-3.webp']),
 'attack-support':Object.freeze(['assets/homecoming/journeys/attack-support-1.webp','assets/homecoming/journeys/attack-support-2.webp','assets/homecoming/journeys/attack-support-3.webp'])
});
export function renderHomecomingJourneyArt(routeId,index){
 const route=HOMECOMING_ROUTES.find(r=>r.id===routeId);
 const src=Number.isInteger(index)&&index>=0&&index<3?HOMECOMING_JOURNEY_ART[routeId]?.[index]:null;
 if(!route||!src)return '<small>此頁旅行插畫準備中</small>';
 return `<figure class="homecoming-journey-art"><img src="${src}" alt="${escapeHtml(route.journey[index])}" width="1280" height="720" decoding="async"></figure>`;
}
