// Stage the same tree as Pages, without uploading or deploying.
import assert from 'node:assert/strict';
import {cp,mkdir,readFile,readdir,rm,stat,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const dest=resolve('premerge-pages-site');await rm(dest,{recursive:true,force:true});await mkdir(dest,{recursive:true});await cp('dist',dest,{recursive:true});await mkdir(resolve(dest,'wiki'),{recursive:true});await cp('wiki/index.html',resolve(dest,'wiki/index.html'));
let removedPng=0;for(const tier of ['S','SS','SSS']){const dir=resolve(dest,'assets/true-forms',tier);for(const f of await readdir(dir))if(f.endsWith('.png')){await stat(resolve(dir,f.replace(/\.png$/,'.webp')));await rm(resolve(dir,f));removedPng++;}}
for(const name of ['effects-lab.html','weapon-compensation-test.html','balance-sim.mjs','test-saves/weapon-compensation-assassin-200.json'])await rm(resolve(dest,name),{force:true});try{await rm(resolve(dest,'test-saves'));}catch{}
let dependencies=0;const paths=await readdir(dest);for(const name of paths.filter(n=>n.endsWith('.js'))){const file=resolve(dest,name),source=await readFile(file,'utf8');for(const m of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){if(!m[1].startsWith('./'))continue;await stat(resolve(dirname(file),m[1].split(/[?#]/,1)[0]));dependencies++;}}
const wiki=await readFile(resolve(dest,'wiki/index.html'),'utf8');for(const m of wiki.matchAll(/from '\.\.\/([^']+)'/g))await stat(resolve(dest,m[1].split(/[?#]/,1)[0]));
const html=await readFile(resolve(dest,'index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^(?:https?:|data:)/.test(m[1]))continue;const path=m[1].split(/[?#]/,1)[0];if(path)await stat(resolve(dest,path));}
let bytes=0,files=0;async function walk(path){for(const d of await readdir(path,{withFileTypes:true})){const p=resolve(path,d.name);if(d.isDirectory())await walk(p);else{files++;bytes+=(await stat(p)).size;}}}await walk(dest);
assert.ok(html.includes('homecoming.css'));assert.ok(html.includes('entry-portrait-clarity.css'));
await mkdir('artifacts/homecoming-premerge',{recursive:true});const report={passed:true,sourceSha:process.env.GITHUB_SHA,files,bytes,removedPng,relativeModuleDependencies:dependencies,wikiStaged:true,noUploadOrDeploy:true};await writeFile('artifacts/homecoming-premerge/stage-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
