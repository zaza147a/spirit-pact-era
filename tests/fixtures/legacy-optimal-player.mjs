// Read exact user-supplied optimum saves. Never regenerate their equipment.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('./legacy-best-v6559/',import.meta.url));
export const LEGACY_OPTIMAL_MANIFEST=JSON.parse(readFileSync(resolve(root,'manifest.json'),'utf8'));
export const LEGACY_OPTIMAL_BUILD_NAMES=Object.freeze(LEGACY_OPTIMAL_MANIFEST.rows.map(row=>row.job));
export function legacyOptimalPlayer(job){
 const row=LEGACY_OPTIMAL_MANIFEST.rows.find(entry=>entry.job===job);
 if(!row)throw Error('No user-provided optimum save for '+job);
 const save=JSON.parse(readFileSync(resolve(root,row.file),'utf8'));
 return structuredClone(save.player);
}
