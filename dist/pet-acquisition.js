export const CAPTURE_WEIGHTS={common:.7,rare:.25,uncommon:.04,legendary:.01};
export const MYTHIC_MUTATION={common:.01,rare:.02,uncommon:.03,legendary:.05,mythic:0};
export const QUALITY_ORDER=['common','rare','uncommon','legendary','mythic'];
export function evolutionChances(rarity){if(rarity==='mythic')return {mythic:1};const index=Math.max(0,QUALITY_ORDER.indexOf(rarity)),eligible=QUALITY_ORDER.slice(index,4),mythic=MYTHIC_MUTATION[rarity]||.01,total=eligible.reduce((n,k)=>n+CAPTURE_WEIGHTS[k],0);return {...Object.fromEntries(eligible.map(k=>[k,(1-mythic)*CAPTURE_WEIGHTS[k]/total])),mythic};}
export function weightedQuality(table,rng=Math.random){const roll=Math.max(0,Math.min(.999999999,rng()));let sum=0;for(const [id,p] of Object.entries(table)){sum+=p;if(roll<sum)return id;}return Object.keys(table).at(-1);}
export const captureQuality=(rng=Math.random)=>weightedQuality(CAPTURE_WEIGHTS,rng);
export const evolveQuality=(rarity,rng=Math.random)=>weightedQuality(evolutionChances(rarity),rng);
export function capturedQuality(player,role,rolled){player.capturePity=player.capturePity||{};const n=Math.max(0,Math.min(100,Math.floor(Number(player.capturePity[role])||0)));if(n>=100){player.capturePity[role]=0;return 'legendary';}player.capturePity[role]=n+(rolled==='rare'?1:0);return rolled==='mythic'?'legendary':rolled;}
